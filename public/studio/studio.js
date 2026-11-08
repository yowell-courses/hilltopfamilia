// The /studio launcher: three blank 4-block scripts, and the optional AI drafts (POST /api/draft, site/draft.ts).
// A document is a link: every button ends in one, "/<app>/#title=…&doc=…", read by the browser alone.
import { link } from '../tinyoffice.js';

const block = (title, hint) => `## ${title}\n\n*${hint}*`;
const deck = (...blocks) => blocks.join('\n\n---\n\n') + '\n';

const TEMPLATES = {
  problema: {
    app: 'deck',
    lang: 'en',
    title: 'Guion: Problema / Solución',
    doc: deck(
      block('1 · El problema (0:00–0:15)', 'Qué está pasando, en una frase clara que cualquier padre reconozca. (~35 palabras)'),
      block('2 · Por qué importa (0:15–0:30)', 'Cómo afecta a su estudiante y a su familia: presupuesto, seguridad, clases o carrera.'),
      block('3 · La solución y sus límites (0:30–0:50)', 'Qué recurso o solución existe, e incluye sus límites reales: cupos, costos, plazos o requisitos.'),
      block('4 · Siguiente paso (0:50–1:05)', 'Próxima fecha clave u oficina a la que acudir + 1 pregunta concreta para conversar en casa.'),
    ),
  },
  faq: {
    app: 'deck',
    lang: 'en',
    title: 'Guion: Preguntas frecuentes',
    doc: deck(
      block('1 · La pregunta (0:00–0:15)', 'El trámite o fecha clave y la duda principal que hacen las familias, con sus palabras. (~35 palabras)'),
      block('2 · La respuesta corta (0:15–0:30)', 'La respuesta directa y por qué es clave en este momento del semestre.'),
      block('3 · Lo que hay que saber y sus límites (0:30–0:50)', 'El dato clave (fecha, monto o regla) y cualquier límite o excepción importante.'),
      block('4 · Dónde pedir ayuda (0:50–1:05)', 'Qué oficina contactar, cómo hacerlo y una pregunta sugerida para enviar a su estudiante.'),
    ),
  },
  evento: {
    app: 'deck',
    lang: 'en',
    title: 'Guion: Evento / Comunidad',
    doc: deck(
      block('1 · Qué es (0:00–0:15)', 'En qué consiste el evento, logro o recurso en el campus o Austin. (~35 palabras)'),
      block('2 · Cuándo y dónde (0:15–0:30)', 'Fecha, hora, lugar y cómo conecta o beneficia a su estudiante.'),
      block('3 · Por qué ir y cuánto cuesta (0:30–0:50)', 'Por qué vale la pena para la familia, costos/boletos y detalles prácticos (estacionamiento, cupos).'),
      block('4 · Cómo participar (0:50–1:05)', 'Dónde registrarse y cómo compartirlo en el chat familiar.'),
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

for (const button of document.querySelectorAll('[data-draft]')) {
  button.addEventListener('click', async () => {
    const article = document.getElementById('article').value.trim();
    if (article.length < 80) return say('Please paste your full article or reporting notes first (at least a few sentences).', true);
    const buttons = document.querySelectorAll('[data-draft]');
    buttons.forEach((b) => (b.disabled = true));
    document.getElementById('result').hidden = true;
    say('Generating Spanish draft with [VERIFICAR] tags… (up to 30 seconds)');
    try {
      const res = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          kind: button.dataset.draft,
          format: document.getElementById('format').value,
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
