// The agent skill and /llms.txt are written from their template and the registry (npm run skill); test/lints.test.ts holds them current.
import { test, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { makeLlms, makeSkill, skillFolder } from '../scripts/make-skill.ts';
import { apps } from '../src/kit/core/apps.ts';
import { SHORT_LINK_MAX } from '../src/kit/share/short.ts';

const ROOT = join(import.meta.dirname, '..');

test('the skill names every app, teaches the plain link, and leaves no placeholder behind', async () => {
  const skill = await makeSkill();
  expect(skill.startsWith('---\nname: tinyoffice\ndescription: ')).toBe(true);
  expect(skill).toMatch(/\nlicense: MIT\n---\n/);
  for (const a of apps()) expect(skill).toContain(`| \`${a.id}\` | ${a.name} |`);
  expect(skill).toContain('#title=<title>&doc=<document>');
  expect(skill).toContain('https://hilltopfamilia.org/sheet/#doc=');
  expect(skill).not.toMatch(/\{\{[a-z]/);
  expect(makeLlms(skill).startsWith('# Tiny Little Office links')).toBe(true);
});

test('the skill says the short link’s limit as the site counts it', async () => {
  expect(await makeSkill()).toContain(`a link of at most ${SHORT_LINK_MAX.toLocaleString('en')} characters`);
});

// The skill as Claude Code reads one (Paul, 2026-10-15, after Oskar Austegard's rewrite of it as a short SKILL.md and a
// reference an app: "make skills work like they are supposed to work"): SKILL.md, read whole when the skill is chosen,
// holds what every document needs; the rest is a reference each, read when the task needs it.
test('the skill is a folder: a short SKILL.md that names a reference an app, one for the API and one for the editors, and together they are the whole guide', { timeout: 60_000 }, async () => {
  const guide = await makeSkill();
  const folder = skillFolder(guide);
  const skill = folder['SKILL.md'];
  expect(new TextEncoder().encode(skill).length).toBeLessThan(16 * 1024);
  expect(skill.split('\n').length).toBeLessThan(200);
  expect(skill.startsWith('---\nname: tinyoffice\n')).toBe(true);
  // What every document needs is in SKILL.md: the link, the rules, the format, the apps and how to check.
  for (const h of [
    'The URL',
    'Sharing: a link is a copy',
    'A document inside a document',
    'Three rules agents break first',
    'TLO: Markdown, and what it adds',
    'The apps',
    'Choosing an app',
    'Check it, do not look at it',
    'Good practice',
  ])
    expect(skill).toContain(`\n## ${h}\n`);
  // Each app's reference, named after its table, with the app's words and one of its templates as a link.
  for (const a of apps()) {
    expect(skill).toContain(`[${a.id}](references/${a.id}.md)`);
    const ref = folder[`references/${a.id}.md`];
    expect(ref, a.id).toMatch(new RegExp(`^# ${a.id}: `));
    expect(ref, a.id).toContain(`https://hilltopfamilia.org/${a.id}/#doc=`);
    expect(skill).not.toContain(`\n### ${a.id}: `);
  }
  expect(skill).toContain('[references/api.md](references/api.md)');
  expect(skill).toContain('[references/editors.md](references/editors.md)');
  expect(folder['references/api.md']).toMatch(/^# Files, short links, the API and the command line\n\n## Every app's files\n/);
  expect(folder['references/api.md']).toContain('\n## Without a browser\n');
  expect(folder['references/editors.md']).toMatch(/^# Driving the editors\n/);
  expect(Object.keys(folder).sort()).toStrictEqual(['SKILL.md', 'references/api.md', 'references/editors.md', ...apps().map((a) => `references/${a.id}.md`)].sort());
  // Nothing lost, nothing twice: every heading of the guide outside its examples is in exactly one file (but the
  // headings that only group the apps' sections, "## Words", "## Numbers", which the folder has no need of), and every
  // line of the guide is in one of them.
  const outside = (t: string) => {
    const kept: string[] = [];
    let fence = 0;
    for (const l of t.split('\n')) {
      const ticks = /^(`{3,})/.exec(l)?.[1].length ?? 0;
      if (fence) {
        if (ticks >= fence && /^`+\s*$/.test(l)) fence = 0;
      } else if (ticks) fence = ticks;
      else kept.push(l);
    }
    return kept;
  };
  const full = makeLlms(guide);
  const groups = [...full.matchAll(/^## (.*)\n\n### /gm)].map((m) => `## ${m[1]}`);
  expect(groups.length).toBeGreaterThan(3);
  const all = Object.values(folder).join('\n');
  for (const h of outside(full).filter((l) => /^#{2,3} /.test(l) && !groups.includes(l)))
    expect(
      all.split('\n').filter((l) => l === h || l === h.replace(/^#{2,3} /, '# ')),
      h,
    ).toHaveLength(1);
  const lines = new Set(all.split('\n'));
  for (const l of full.split('\n')) if (l.trim() && !/^#{2,3} /.test(l)) expect(lines.has(l), l.slice(0, 80)).toBe(true);
  // The committed folder is this one, with no file of an earlier version left in it.
  const dir = join(ROOT, 'skill/tinyoffice');
  expect(readdirSync(dir).sort()).toStrictEqual(['SKILL.md', 'SKILL.tpl.md', 'references']);
  expect(readdirSync(join(dir, 'references')).sort()).toStrictEqual(
    Object.keys(folder)
      .filter((f) => f.startsWith('references/'))
      .map((f) => f.slice('references/'.length))
      .sort(),
  );
  for (const [f, text] of Object.entries(folder)) expect(readFileSync(join(dir, f), 'utf8'), f).toBe(text);
});
