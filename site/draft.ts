/**
 * The optional AI drafting assistant behind /studio: POST /api/draft takes a student's own finished article and gives
 * back a first Spanish draft, never a publication. Two kinds:
 *
 *   script     a 4-block script as a Deck (one block a swipeable card), with [VERIFICAR: …] around every date, number
 *              and phone number, for the student to check and say in their own voice
 *   resources  the family resource sheet as a Write document: a 3-point summary, links and contacts, a bilingual
 *              glossary and a checklist
 *
 * The article is sent to the model and kept nowhere: nothing is stored or logged (wrangler.jsonc: observability is
 * off). The model writes only the content of each block, split by a line of "==="; the documents' shape is made
 * here, so a model's slip cannot break a document.
 */

export type Kind = 'script' | 'resources';
export type Format = 'problema' | 'faq' | 'evento';

export interface DraftRequest {
  kind: Kind;
  format: Format | 'auto';
  article: string;
  url?: string;
}

export interface Draft {
  app: 'deck' | 'write';
  title: string;
  doc: string;
}

export const MAX_ARTICLE = 12000;
export const MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

const FORMATS: Record<Format, { name: string; blocks: [string, string][] }> = {
  problema: {
    name: 'Problema / Solución',
    blocks: [
      ['1 · El problema (0:00–0:15)', 'what is happening, in one clear sentence that a parent would recognize'],
      ['2 · Por qué importa (0:15–0:30)', 'why it matters to a student and their family (money, time, status)'],
      ['3 · La solución y sus límites (0:30–0:50)', 'what to do about it, concretely'],
      ['4 · Siguiente paso (0:50–1:05)', 'the one next step, with the deadline or the office to contact'],
    ],
  },
  faq: {
    name: 'Preguntas frecuentes',
    blocks: [
      ['1 · La pregunta (0:00–0:15)', 'the question families ask, in their own words'],
      ['2 · La respuesta corta (0:15–0:30)', 'the short, direct answer'],
      ['3 · Lo que hay que saber y sus límites (0:30–0:50)', 'the key detail: a date, an amount or a rule'],
      ['4 · Dónde pedir ayuda (0:50–1:05)', 'which office to ask, and how'],
    ],
  },
  evento: {
    name: 'Evento / Comunidad',
    blocks: [
      ['1 · Qué es (0:00–0:15)', 'what the event or community resource is'],
      ['2 · Cuándo y dónde (0:15–0:30)', 'the date, time and place'],
      ['3 · Por qué ir y cuánto cuesta (0:30–0:50)', 'why it is worth a family’s time, and what it costs'],
      ['4 · Cómo participar (0:50–1:05)', 'how to take part or sign up'],
    ],
  },
};

const RULES = `You help a student journalist at a university in Austin, Texas. Write natural, warm, plain Latin American Spanish for Spanish-speaking parents of students. Use only facts in the student's article: never invent a fact, a number, a date, a phone number or a link. Put every date, amount, number, phone number and deadline inside [VERIFICAR: …] so the student confirms it, for example [VERIFICAR: 15 de marzo]. Keep English proper names (office names, program names) as they are, adding a short Spanish explanation where it helps. Always state honest limits or caveats of what the article reports (what is not covered, who is not eligible, what is uncertain). The student will say this on camera in their own voice, so write the way people talk.`;

export function prompt({ kind, format, article }: DraftRequest): {
  system: string;
  user: string;
} {
  if (kind === 'resources')
    return {
      system: RULES,
      user: `On the first line write TITULO: followed by a short Spanish topic title. Then from the article below, write a family resource sheet in Spanish. Write exactly four sections, in this order, separated by a line holding only ===. No headings, no other text.
Section 1: exactly three short bullet points ("- ") with the core facts, deadlines or eligibility rules.
Section 2: bullet points ("- ") of the campus offices and contacts named in the article: name, phone or web link if the article gives one, and whether Spanish-speaking staff are available if the article says. If the article names none, write one bullet: - [VERIFICAR: oficina y contacto].
Section 3: 3 or 4 bullets ("- ") of English university terms from the article, as "English term — plain Spanish definition".
Section 4: 3 to 5 short checklist items ("- ") of things a parent can do with their student.

ARTICLE:
${article}`,
    };
  const pick = format === 'auto' ? 'On the first line write FORMATO: followed by problema, faq or evento, whichever fits the article best. Then ' : '';
  const shape = format === 'auto' ? 'the chosen format' : FORMATS[format].name;
  const blocks = (format === 'auto' ? FORMATS.problema : FORMATS[format]).blocks.map(([n, hint], i) => `Block ${i + 1} (${n}): ${hint}`).join('\n');
  return {
    system: RULES,
    user: `${pick}On the next line write TITULO: followed by a short Spanish title. Then write a 60-second video script in the ${shape} format: exactly four blocks of about 35 words each (130 to 150 words in all), separated by a line holding only ===. Only the words to speak, no labels or headings.
${format === 'auto' ? 'Problema: problem, why it matters, solution, next step. FAQ: question, short answer, key detail, where to get help. Evento: what, when and where, why go, how to take part.' : blocks}

ARTICLE:
${article}`,
  };
}

const clean = (s: string) => s.replace(/^\s*[-*•]\s*/gm, (m) => m.replace(/[*•]/, '-')).trim();

/** The model's words as the documents' text; null when it did not give the four blocks asked for. */
export function build(req: DraftRequest, raw: string): Draft | null {
  let text = raw.trim();
  const title =
    /^\s*TITULO:\s*(.+)$/im
      .exec(text)?.[1]
      ?.trim()
      .replace(/^["“]|["”]$/g, '') ?? '';
  let format = req.format;
  if (format === 'auto') {
    const f = /^\s*FORMATO:\s*(problema|faq|evento)/im.exec(text)?.[1]?.toLowerCase() as Format | undefined;
    format = f ?? 'problema';
  }
  text = text.replace(/^\s*(TITULO|FORMATO):.*$/gim, '').trim();
  const parts = text
    .split(/^\s*={3,}\s*$/m)
    .map((p) => p.trim())
    .filter(Boolean);
  // A stray extra divider is the model's slip: the surplus joins the last block rather than failing the draft.
  if (parts.length > 4) parts.splice(3, parts.length - 3, parts.slice(3).join('\n\n'));
  if (parts.length !== 4) return null;
  if (req.kind === 'script') {
    const { blocks } = FORMATS[format as Format];
    const slides = parts.map((p, i) => `## ${blocks[i][0]}\n\n${p.replace(/\n{2,}/g, '\n\n')}`);
    return {
      app: 'deck',
      title: title || 'Guion de video',
      doc: slides.join('\n\n---\n\n') + '\n',
    };
  }
  const [summary, contacts, glossary, checks] = parts.map(clean);
  const items = checks
    .split('\n')
    .map((l) => l.replace(/^-\s*(\[[ x]\]\s*)?/, '').trim())
    .filter(Boolean)
    .map((l) => `- [ ] ${l}`)
    .join('\n');
  const doc = `> 🔒 **Guía privada para familias:** esta guía vive dentro del enlace. No necesitas crear cuenta y nadie rastrea lo que marcas o escribes aquí.\n\n## 📌 Resumen en 3 puntos\n\n${summary}\n\n## 🔗 Enlaces y contactos directos\n\n${contacts}\n\n## 🗣️ Glosario bilingüe (para hablar con su estudiante)\n\n${glossary}\n\n## ✅ Lista de pasos para conversar hoy en casa\n\n${items}\n`;
  return {
    app: 'write',
    title: title ? `Guía: ${title}` : 'Guía familiar',
    doc,
  };
}

export interface Ai {
  run(
    model: string,
    input: {
      messages: { role: string; content: string }[];
      max_tokens: number;
      temperature: number;
    },
  ): Promise<{ response?: string }>;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });

export const GEMINI_MODEL = 'gemini-2.5-flash';

export interface Models {
  /** Workers AI (wrangler.jsonc "ai"): no key to keep. */
  ai?: Ai;
  /** A Google AI Studio key (`wrangler secret put GEMINI_API_KEY`): when set, Gemini drafts instead of Workers AI. */
  geminiKey?: string;
  model?: string;
  fetch?: typeof fetch;
}

async function gemini(key: string, system: string, user: string, call: typeof fetch): Promise<string> {
  const res = await call(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: user }] }], generationConfig: { temperature: 0.4, maxOutputTokens: 2000 } }),
  });
  if (!res.ok) throw new Error(`gemini ${res.status} ${(await res.text()).slice(0, 200)}`);
  const out = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  return out.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
}

const ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&lt;': '<',
  '&gt;': '>',
  '&ndash;': '–',
  '&mdash;': '—',
  '&rsquo;': '’',
  '&lsquo;': '‘',
  '&ldquo;': '“',
  '&rdquo;': '”',
};

/** Extract readable article text from an HTML page or plain-text response. */
export function extractArticle(raw: string): string {
  if (!raw.includes('<')) return raw.trim();
  const titleMatch = /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i.exec(raw) ?? /<title[^>]*>([\s\S]*?)<\/title>/i.exec(raw);
  const pageTitle = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';
  const stripped = raw
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(?:script|style|noscript|svg|nav|header|footer|aside|form)\b[^>]*>[\s\S]*?<\/(?:script|style|noscript|svg|nav|header|footer|aside|form)>/gi, ' ');
  const mainMatch = /<article\b[^>]*>([\s\S]*?)<\/article>/i.exec(stripped) ?? /<main\b[^>]*>([\s\S]*?)<\/main>/i.exec(stripped);
  const toWords = (html: string) =>
    html
      .replace(/<\/(?:p|div|h[1-6]|li|blockquote|section|article|tr)>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
      .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
      .replace(/&(?:nbsp|amp|quot|#39|apos|lt|gt|ndash|mdash|rsquo|lsquo|ldquo|rdquo);/gi, (m) => ENTITIES[m.toLowerCase()] ?? m)
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n+/g, '\n\n')
      .trim();
  const focused = mainMatch ? toWords(mainMatch[1]) : '';
  const body = focused.length >= 80 ? focused : toWords(stripped);
  return pageTitle && !body.startsWith(pageTitle) ? `${pageTitle}\n\n${body}` : body;
}

/** Validate that a story URL is a public http(s) address and not a local/private network target. */
export function validStoryUrl(raw: string): URL | null {
  try {
    const u = new URL(raw.trim());
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    const h = u.hostname.toLowerCase();
    if (
      h === 'localhost' ||
      h === '0.0.0.0' ||
      h === '[::1]' ||
      h.endsWith('.local') ||
      h.endsWith('.internal') ||
      !h.includes('.') ||
      /^(?:127\.|10\.|192\.168\.|169\.254\.|172\.(?:1[6-9]|2\d|3[01])\.)/.test(h)
    )
      return null;
    return u;
  } catch {
    return null;
  }
}

export async function handleDraft(req: Request, { ai, geminiKey, model = MODEL, fetch: call = fetch }: Models): Promise<Response> {
  const url = new URL(req.url);
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  const origin = req.headers.get('origin');
  if (origin && origin !== url.origin) return json({ error: 'forbidden' }, 403);
  if (!ai && !geminiKey) return json({ error: 'The AI assistant is not configured.' }, 503);
  let body: Partial<DraftRequest>;
  try {
    body = (await req.json()) as Partial<DraftRequest>;
  } catch {
    return json({ error: 'bad request' }, 400);
  }
  const kind = body.kind === 'script' || body.kind === 'resources' ? body.kind : null;
  if (!kind) return json({ error: 'Please paste the full article (at least a few sentences).' }, 400);
  const format = body.format === 'faq' || body.format === 'evento' || body.format === 'problema' ? body.format : 'auto';
  const rawUrl = typeof body.url === 'string' ? body.url.trim() : '';
  const notes = typeof body.article === 'string' ? body.article.trim() : '';
  if (notes.length > MAX_ARTICLE) return json({ error: `The article is too long (maximum ${MAX_ARTICLE} characters).` }, 413);
  let fetched = '';
  if (rawUrl) {
    const target = validStoryUrl(rawUrl);
    if (!target) return json({ error: 'Please enter a valid public Story URL (https://…).' }, 400);
    const headers: Record<string, string> = {
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'accept-language': 'en-US,en;q=0.9',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'none',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1',
    };
    let why = '';
    try {
      const res = await call(target.href, { headers, redirect: 'follow' });
      if (res.ok) fetched = extractArticle(await res.text());
      else why = `the site answered ${res.status}`;
    } catch (e) {
      why = String(e).slice(0, 80);
    }
    // A site that turns away a page fetch from a server often serves the same story through WordPress's public REST API.
    if (fetched.length < 80) {
      const segments = target.pathname.split('/').filter(Boolean);
      const slug = segments.at(-1);
      const idMatch = segments.find((s) => /^\d{4,8}$/.test(s));
      const candidates = [
        idMatch ? `${target.origin}/wp-json/wp/v2/posts/${idMatch}?_fields=title,content` : null,
        slug ? `${target.origin}/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_fields=title,content` : null,
      ].filter(Boolean) as string[];
      for (const ep of candidates) {
        try {
          const api = await call(ep, {
            headers: {
              accept: 'application/json',
              'accept-language': 'en-US,en;q=0.9',
              'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            },
            redirect: 'follow',
          });
          if (api.ok) {
            const data = (await api.json()) as any;
            const post = Array.isArray(data) ? data[0] : data;
            if (post?.content?.rendered) {
              fetched = extractArticle(`<article><h1>${post.title?.rendered ?? ''}</h1>${post.content.rendered}</article>`);
              why = '';
              break;
            } else {
              why = `wp-json no post content (status ${api.status})`;
            }
          } else {
            why = `wp-json answered ${api.status}`;
          }
        } catch (err) {
          why = `wp-json error: ${String(err).slice(0, 60)}`;
        }
      }
    }
    if (fetched.length < 80 && notes.length < 80 && why)
      return json(
        {
          error: `Could not fetch that Story URL: ${why}. Please paste the article text directly below.`,
        },
        422,
      );
  }
  const article = [fetched, notes].filter(Boolean).join('\n\n').slice(0, MAX_ARTICLE);
  if (article.length < 80) {
    return json(
      {
        error: rawUrl ? 'Could not read enough article text from that URL. Please paste the article text directly below.' : 'Please paste the full article (at least a few sentences).',
      },
      rawUrl ? 422 : 400,
    );
  }
  const request: DraftRequest = { kind, format, article };
  const { system, user } = prompt(request);
  for (let attempt = 0; attempt < 3; attempt++) {
    let text = '';
    try {
      text = geminiKey
        ? await gemini(geminiKey, system, user, call)
        : ((
            await ai!.run(model, {
              messages: [
                { role: 'system', content: system },
                { role: 'user', content: user },
              ],
              max_tokens: 1400,
              temperature: 0.4,
            })
          ).response ?? '');
    } catch (e) {
      console.error('draft model error', String(e));
      return json({ error: 'The AI assistant did not respond. Please try again or use a blank template.' }, 502);
    }
    const draft = build(request, text);
    if (draft) return json(draft);
  }
  return json(
    {
      error: 'Could not format the draft. Please try again or use a blank template.',
    },
    502,
  );
}
