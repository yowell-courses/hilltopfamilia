import { expect, test } from 'vitest';
import { build, extractArticle, handleDraft, prompt, validStoryUrl } from '../site/draft.ts';
import { link, read } from '../src/api.ts';

const SCRIPT = `FORMATO: faq
TITULO: Cómo pedir ayuda financiera
¿Qué pasa si su estudiante necesita más ayuda? [VERIFICAR: 15 de marzo] es la fecha.
===
Respuesta corta: hay una oficina que revisa cada caso.

Es gratis.
===
Lleve el formulario [VERIFICAR: 512-555-0100].
===
Pregunte en Financial Aid.`;

const RES = `TITULO: Becas de emergencia y retenciones\n- Punto uno\n- Punto dos\n- Punto tres\n===\n- Financial Aid: [VERIFICAR: 512-555-0100]\n===\n- FAFSA Verification — revisión de datos\n===\n- Revisar la fecha\n- [ ] Llamar a la oficina`;

test('a script becomes a four-card deck the app reads, with the format the model chose', () => {
  const d = build({ kind: 'script', format: 'auto', article: '' }, SCRIPT)!;
  expect(d.app).toBe('deck');
  expect(d.title).toBe('Cómo pedir ayuda financiera');
  expect(d.doc).toContain('## 1 · La pregunta (0:00–0:15)');
  expect(d.doc.split('\n---\n')).toHaveLength(4);
  expect(read(link('deck', d.doc, { title: d.title })).text).toContain('[VERIFICAR');
});

test('a resource sheet has the four sections and a checkbox list', () => {
  const d = build({ kind: 'resources', format: 'auto', article: '' }, RES)!;
  expect(d.app).toBe('write');
  expect(d.title).toBe('Guía: Becas de emergencia y retenciones');
  expect(d.doc).toContain('## ✅ Lista de pasos para conversar hoy en casa\n\n- [ ] Revisar la fecha\n- [ ] Llamar a la oficina');
  expect(read(link('write', d.doc)).text).toContain('Glosario');
});

test('output without four blocks is refused', () => {
  expect(build({ kind: 'script', format: 'faq', article: '' }, 'uno\n===\ndos')).toBeNull();
});

test('the prompt carries the article and the never-invent rule', () => {
  const p = prompt({ kind: 'script', format: 'evento', article: 'ARTICULO' });
  expect(p.user).toContain('ARTICULO');
  expect(p.system).toContain('[VERIFICAR');
});

const post = (body: unknown, headers: Record<string, string> = {}) =>
  new Request('https://x.test/api/draft', {
    method: 'POST',
    body: JSON.stringify(body),
    headers,
  });
const ai = { run: async () => ({ response: SCRIPT }) };
const article = 'x'.repeat(100);

test('the endpoint drafts, and refuses wrong methods, other origins, short and long articles, and a missing model', async () => {
  const ok = await handleDraft(post({ kind: 'script', format: 'faq', article }), { ai });
  expect(ok.status).toBe(200);
  expect(((await ok.json()) as { app: string }).app).toBe('deck');
  expect((await handleDraft(new Request('https://x.test/api/draft'), { ai })).status).toBe(405);
  expect((await handleDraft(post({ kind: 'script', article }, { origin: 'https://evil.test' }), { ai })).status).toBe(403);
  expect((await handleDraft(post({ kind: 'script', article: 'corto' }), { ai })).status).toBe(400);
  expect((await handleDraft(post({ kind: 'script', article: 'x'.repeat(13000) }), { ai })).status).toBe(413);
  expect((await handleDraft(post({ kind: 'script', article }), {})).status).toBe(503);
  expect(
    (
      await handleDraft(post({ kind: 'script', article }), {
        ai: { run: async () => ({ response: 'nada' }) },
      })
    ).status,
  ).toBe(502);
});

test('with a Gemini key the draft comes from Gemini, the key in a header and never in the address', async () => {
  let seen: { url: string; key: string | null } | null = null;
  const fake = (async (url: string, init: RequestInit) => {
    seen = { url, key: new Headers(init.headers).get('x-goog-api-key') };
    return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: SCRIPT }] } }] }));
  }) as unknown as typeof fetch;
  const res = await handleDraft(post({ kind: 'script', format: 'faq', article }), { geminiKey: 'k', fetch: fake });
  expect(res.status).toBe(200);
  expect(seen!.key).toBe('k');
  expect(seen!.url).not.toContain('key=');
});

test('a story URL is validated, extracted from HTML, and combined with any reporting notes', async () => {
  expect(validStoryUrl('https://www.hilltopviewsonline.com/2026/03/story/')?.hostname).toBe('www.hilltopviewsonline.com');
  expect(validStoryUrl('http://localhost:8789/secret')).toBeNull();
  expect(validStoryUrl('http://127.0.0.1/secret')).toBeNull();
  expect(validStoryUrl('ftp://example.com/story')).toBeNull();

  const html = `<html><head><title>Campus Grant Update</title><script>bad()</script></head><body><nav>Menu</nav><article><p>${'Students can apply for emergency grants at the main office before Friday. '.repeat(3)}</p></article></body></html>`;
  expect(extractArticle(html)).toContain('Campus Grant Update');
  expect(extractArticle(html)).not.toContain('bad()');

  let prompted = '';
  const captureAi = {
    run: async (_m: string, input: { messages: { role: string; content: string }[] }) => {
      prompted = input.messages[1].content;
      return { response: SCRIPT };
    },
  };
  const fakeFetch = (async () => new Response(html, { status: 200 })) as unknown as typeof fetch;
  const ok = await handleDraft(post({ kind: 'script', format: 'faq', url: 'https://www.hilltopviewsonline.com/story', article: 'Extra reporter note: Spanish staff at extension 4.' }), {
    ai: captureAi,
    fetch: fakeFetch,
  });
  expect(ok.status).toBe(200);
  expect(prompted).toContain('Campus Grant Update');
  expect(prompted).toContain('Extra reporter note: Spanish staff at extension 4.');

  const badUrl = await handleDraft(post({ kind: 'script', format: 'faq', url: 'http://localhost/internal', article: '' }), { ai: captureAi, fetch: fakeFetch });
  expect(badUrl.status).toBe(400);
});
