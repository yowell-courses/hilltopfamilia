// The /studio launcher: three blank 4-block scripts, and the optional AI drafts (POST /api/draft, site/draft.ts).
// A document is a link: every button ends in one, "/<app>/#title=…&doc=…", read by the browser alone.
import { link } from '../tinyoffice.js';

const block = (title, hint) => `## ${title}\n\n*${hint}*`;
const deck = (...blocks) => blocks.join('\n\n---\n\n') + '\n';

const TEMPLATES = {
  problema: {
    app: 'deck',
    lang: 'en',
    title: 'Script: Problem / Solution',
    doc: deck(
      block('1 · The Problem (0:00–0:15)', 'Write in Spanish: What is happening, in one clear sentence any parent would recognize. (~35 words)'),
      block('2 · Why It Matters (0:15–0:30)', 'Write in Spanish: How it affects the student and their family — budget, safety, classes, or career.'),
      block('3 · The Solution & Its Limits (0:30–0:50)', 'Write in Spanish: What resource or solution exists, plus its real limits — caps, costs, deadlines, or eligibility.'),
      block('4 · Next Step (0:50–1:05)', 'Write in Spanish: Next key deadline or office to contact + 1 concrete question to discuss at home.'),
    ),
  },
  faq: {
    app: 'deck',
    lang: 'en',
    title: 'Script: Explainer / FAQ',
    doc: deck(
      block('1 · The Question (0:00–0:15)', 'Write in Spanish: The key process or date and the #1 question families ask, in their own words. (~35 words)'),
      block('2 · The Short Answer (0:15–0:30)', 'Write in Spanish: The direct answer and why it matters at this point in the semester.'),
      block('3 · What to Know & Its Limits (0:30–0:50)', 'Write in Spanish: The key detail (date, amount, or rule) and any important limit or exception.'),
      block('4 · Where to Get Help (0:50–1:05)', 'Write in Spanish: Which office to contact, how to reach them, and a suggested question for their student.'),
    ),
  },
  evento: {
    app: 'deck',
    lang: 'en',
    title: 'Script: Event / Community',
    doc: deck(
      block('1 · What It Is (0:00–0:15)', 'Write in Spanish: What the event, milestone, or resource is on campus or in Austin. (~35 words)'),
      block('2 · When & Where (0:15–0:30)', 'Write in Spanish: Date, time, location, and how participating connects or benefits their student.'),
      block('3 · Why Go & What It Costs (0:30–0:50)', 'Write in Spanish: Why it is worth a family’s time, costs/tickets, and practical details (parking, capacity).'),
      block('4 · How to Participate (0:50–1:05)', 'Write in Spanish: Where to register and how to share it in the family group chat.'),
    ),
  },
  recursos: {
    app: 'write',
    lang: 'es',
    title: 'Guía Familiar',
    doc: `> 🔒 **Guía privada para familias:** esta guía vive dentro del enlace. No necesitas crear cuenta y nadie rastrea lo que marcas o escribes aquí.

## 📌 Resumen en 3 puntos

- *El hecho principal, la fecha o la regla.*
- *El apoyo disponible.*
- *El límite importante.*

## 🔗 Enlaces y contactos directos

- *Oficina, teléfono o enlace, y si hay personal que hable español.*

## 🗣️ Glosario bilingüe (para hablar con su estudiante)

- **English term** — *definición sencilla en español.*

## ✅ Lista de pasos para conversar hoy en casa

- [ ] *Una pregunta para su estudiante.*
- [ ] *Una fecha que confirmar.*
- [ ] *Guardar este enlace o exportarlo como PDF.*
`,
  },
};

const reporter = () => document.getElementById('reporter').value.trim();

const templateHref = (t) => link({ app: t.app ?? 'deck', title: t.title, doc: t.doc, by: reporter(), lang: t.lang ?? 'en' });

for (const a of document.querySelectorAll('[data-template]')) {
  const t = TEMPLATES[a.dataset.template];
  a.href = templateHref(t);
  a.addEventListener('click', () => {
    a.href = templateHref(t);
  });
}

const status = document.getElementById('status');
const say = (text, error = false) => {
  status.textContent = text;
  status.classList.toggle('error', error);
};

const urlEl = document.getElementById('url');
const articleEl = document.getElementById('article');

/** Fetch public story content directly in the browser (avoids datacenter IP blocks on campus sites). */
async function fetchStoryFromUrl(rawUrl) {
  try {
    const u = new URL(rawUrl.trim());
    if (u.hostname === 'hilltopviewsonline.com') u.hostname = 'www.hilltopviewsonline.com';
    const segments = u.pathname.split('/').filter(Boolean);
    const slug = segments.at(-1);
    const idMatch = segments.find((s) => /^\d{4,8}$/.test(s));
    const endpoints = [
      idMatch ? `${u.origin}/wp-json/wp/v2/posts/${idMatch}?_fields=title,content` : null,
      slug ? `${u.origin}/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_fields=title,content` : null,
    ].filter(Boolean);

    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, { headers: { accept: 'application/json' } });
        if (res.ok) {
          const data = await res.json();
          const post = Array.isArray(data) ? data[0] : data;
          if (post?.content?.rendered) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(post.content.rendered, 'text/html');
            const title = post.title?.rendered ? parser.parseFromString(post.title.rendered, 'text/html').body.textContent : '';
            doc.querySelectorAll('script, style, noscript, figure').forEach((el) => el.remove());
            const text = (doc.body.textContent || '').replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n\n').trim();
            const combined = [title, text].filter(Boolean).join('\n\n').trim();
            if (combined.length >= 80) return combined;
          }
        }
      } catch (err) {
        console.warn('WP fetch error on', ep, err);
      }
    }
  } catch (err) {
    console.warn('URL parse error', err);
  }
  return null;
}

let fetchingUrl = false;
async function tryAutoFetchUrl() {
  const url = urlEl?.value.trim();
  if (!url || !/^https?:\/\/\S+$/i.test(url) || fetchingUrl) return;
  if (articleEl && !articleEl.value.trim()) {
    fetchingUrl = true;
    say('Reading story from URL…');
    const text = await fetchStoryFromUrl(url);
    fetchingUrl = false;
    if (text) {
      articleEl.value = text;
      say('Story loaded from URL! Review notes below or click Generate.');
    } else {
      say('');
    }
  }
}

urlEl?.addEventListener('change', tryAutoFetchUrl);
urlEl?.addEventListener('paste', () => setTimeout(tryAutoFetchUrl, 60));

for (const button of document.querySelectorAll('[data-draft]')) {
  button.addEventListener('click', async () => {
    const urlInput = urlEl?.value.trim() ?? '';
    let article = articleEl?.value.trim() ?? '';
    if (urlInput && !/^https?:\/\/\S+$/i.test(urlInput)) {
      return say('Please enter a valid Story URL starting with https:// (or clear the URL field and paste your text below).', true);
    }
    if (!urlInput && article.length < 80) {
      return say('Please enter a Story URL or paste your full article or reporting notes first (at least a few sentences).', true);
    }
    const buttons = document.querySelectorAll('[data-draft]');
    buttons.forEach((b) => (b.disabled = true));
    document.getElementById('result').hidden = true;

    // If only a URL was given, try reading it directly in the browser first
    if (!article && urlInput) {
      say('Reading story from URL…');
      const loaded = await fetchStoryFromUrl(urlInput);
      if (loaded) {
        article = loaded;
        if (articleEl) articleEl.value = loaded;
      }
    }

    say('Generating Spanish draft with [VERIFICAR] tags… (up to 30 seconds)');
    try {
      const res = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          kind: button.dataset.draft,
          format: document.getElementById('format').value,
          ...(urlInput && !article ? { url: urlInput } : {}),
          article,
        }),
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error || 'Error');
      const lang = out.app === 'write' ? 'es' : 'en';
      const url = link({ app: out.app, title: out.title, doc: out.doc, by: reporter(), lang });
      say('');
      const titleEl = document.getElementById('result-title');
      if (titleEl) titleEl.textContent = `Draft ready: ${out.title}`;
      document.getElementById('open').href = url;
      document.getElementById('result').hidden = false;
      document.getElementById('result').dataset.url = url;
      buttons.forEach((b) => (b.disabled = false));
    } catch (e) {
      say(e instanceof Error && e.message ? e.message : 'Could not generate draft. Please try again or use a blank template above.', true);
      buttons.forEach((b) => (b.disabled = false));
    }
  });
}

document.getElementById('copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(document.getElementById('result').dataset.url);
    say('Link copied to clipboard.');
  } catch {
    say('Could not copy automatically: open the draft and copy the URL from the browser address bar.', true);
  }
});
