# Hilltop Familia

**Hilltop Familia** (`https://hilltopfamilia.org`) is a Spanish-language campus and Austin community media workspace and family resource platform powered by student journalists.

## How It Works: The Document Is the Link
- Every 60-second video script (`Deck`), family resource guide (`Write`), outline, spreadsheet, or calendar is held in the URL fragment (`#`) of its page.
- Copy the link and you have copied the document—whoever has the link has the document.
- There is no account, login, or tracking for student reporters or Spanish-speaking families.

## Student Reporter Studio (`/studio`)
Student reporters use the internal [Reporter Studio](public/studio/index.html) (`/studio`) in English to produce:
1. **60-Second Spanish Video Scripts (`Deck` Teleprompter):** Structured in 4 swipeable blocks (`0:00–0:15`, `0:15–0:30`, `0:30–0:50`, `0:50–1:05`) across three story formats (*Problem / Solution*, *Explainer / FAQ*, and *Event / Community*).
2. **Optional Spanish Family Resource Sheets (`Write`):** Shareable Spanish guides (`?lang=es`) with a 3-point summary, campus contacts, a bilingual English/Spanish glossary, and an interactive family checklist.
3. **Optional AI First-Draft Assistant ([`site/draft.ts`](site/draft.ts)):** Reporters can write manually from blank templates or optionally paste a published **Story URL** and/or reporting notes to generate a starting Spanish draft with mandatory `[VERIFICAR: …]` fact-check tags.

## Privacy by Default
- By default nothing is kept, on your device or anywhere else.
- Your browser might save the link in history, of course. Use incognito mode if you want.
- If you decide to save, it keeps your documents on your own device, never on a server.
- If you save a short link (`tinier.hilltopfamilia.org`), it's encrypted with a key the server never sees.
- If you decide to use the social sharing functionality it will make a preview card and save that on a server.

## Five Active Apps
- **Word Processor (`Write`)** — Spanish Family Resource Sheets and printable guides
- **Outliner (`Outline`)** — Story planning and structured reporting notes
- **Presentation Builder (`Deck`)** — 4-block Spanish video scripts and phone teleprompter cards
- **Spreadsheet (`Sheet`)** — Data tables and budget breakdowns
- **Calendar (`Cal`)** — Academic and Austin community deadlines

Sample documents are available in [samples/](samples/).

## AI Agent & CLI Integration
An agent has three ways in:
1. [/llms.txt](public/llms.txt) for a fetch;
2. `npx tinylittleoffice` with a runtime ([packages/doc](packages/doc/README.md));
3. And, for Claude Code, the [skill](skill/tinyoffice/SKILL.md) (a short SKILL.md and a reference an app), installed with `npx tinylittleoffice skill --into ~/.claude/skills`.

## Developers
Node 24 or later.

```sh
npm install
npm run dev      # the site at http://localhost:4178 (studio at /studio/)
npm test         # every test, under Node and in Chromium
npm run build    # the site as it ships
```

Architecture, security, and deployment details are in [docs/](docs/README.md): the [threat model](docs/threat-model.md), the [cryptography](docs/crypto/password.md), [self-hosting](docs/self-host.md), and the [mirror](docs/mirror.md). A security problem should be reported privately through the repository's Security tab, never as an issue.

## Acknowledgments & Citation
Hilltop Familia is built on and gratefully acknowledges [**Tiny Little Office**](https://github.com/aboard-io/tinylittleoffice) (`tinylittleoffice.com`), created by Paul Ford and [Aboard](https://aboard.com) and released under the MIT License ([LICENSE](LICENSE)):

> Ford, P., & Aboard. (2026). *Tiny Little Office: A tiny office suite where the link is the document* [Computer software]. GitHub. https://github.com/aboard-io/tinylittleoffice
