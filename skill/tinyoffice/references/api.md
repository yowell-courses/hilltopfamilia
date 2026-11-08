# Files, short links, the API and the command line

## Every app's files

Every document downloads as a `.pdf` (its pages as pictures; Print in the browser saves one with the words still words), a picture (`.png`), a web page (`.html`), Markdown (`.md`, footnotes in Markdown's reference form) and its own text (`.tlo`: the TLO with `app: <id>` in its head, which opens as its own app when dropped on the site). A `.zip` of `.tlo` and `.md` files, a folder per app, opens the same way when dropped: every document in it is kept on the device (with Save in browser off, listed to keep or to open). A link that downloads a file as it opens is `#/v1/<app>.<ext>/<payload>`, or `view=<ext>` in the plain form.

## Short links

The API below is this site's. Make a short link at the shortener of the site the link opens on, `tinier.<the site's host>`: the shortener opens only links to its own site. An agent on a development machine running its own copy of the site uses that site's `/tinier/` (the shortener started with `SITE` set to the site's address, `npm run tinier:dev`), and the link it makes opens there; production's shortener accepts only links to production.

A long link can be shortened at tinier.hilltopfamilia.org for an hour, a day, a week or a month. The link is encrypted where it is made (AES-256-GCM, a random key); only the ciphertext goes to the service, and the key travels in the short link's fragment, which browsers never send. A program can do the same:

```
POST https://tinier.hilltopfamilia.org/api   {c, iv, ttl}   → 201 {id, exp}
```

`c` and `iv` are the AES-GCM ciphertext of the long link and its 12-byte IV, base64url; `ttl` is 3600, 86400, 604800 or 2592000 seconds (a month at most). The short link is `https://tinier.hilltopfamilia.org/<id>#<key>` (the key as base64url). A short link cannot be changed or recalled once made; it expires on its own, so make a new one for a new version. The ciphertext may be 16 KiB at most (a link of at most 12,272 characters; `measure` says whether yours fits, `short: {fits, over}`, `over` the characters to cut), and one address may make a hundred links a day (the 101st is 429, with `Retry-After`).

## Who made it

The head may carry `created` (when the document was first written, to the minute) and `by` (who made it, a claim: nothing proves it). Write `by` to say who you are.

## Without a browser

The site serves its own API as a module, for programs and agents; in a browser, Deno or Bun it imports as it is:

```js
import { link, plain, read, text, compare, apps, templates } from 'https://hilltopfamilia.org/api.js';
const url = link('sheet', 'Item | Cost:money\n--- | ---\nRent | 1200\n', { title: 'Budget', by: 'planner-agent' });
read(url).text;                 // the document's TLO text, its title and by in the head
await text(url);                // what the document says, as Markdown: what a screen reader reads on its Display Link
compare(url, revised).changes;  // what the second link changed, block by block
await templates('deck');        // what a deck can start from
```

A document under a password: `await link(app, text, { seal: true })` (or `tinyoffice link --seal`) returns `{ url, password }`: the link holds only ciphertext, and the password is one the app made (twenty random characters). Give the person the password apart from the link, and tell them to send it another way than the link. You cannot choose the password: one handed in (`password:`, `--password`) is refused with "The app makes the password; ask for one with seal."

An agent that would rather send structure than write TLO can send JSON: `fromJson(json)` gives the TLO text (so `link(app, fromJson(json))`, or `tinyoffice link <app> --json doc.json`), and `toJson(text)` (`read(url).json`, `tinyoffice json <link>`) gives the kernel's document as JSON, a head and a list of blocks with their runs.
It is the same document, nothing added or renamed, to the JSON Schema at https://github.com/aboard-io/tinylittleoffice/blob/main/packages/doc/schema/tlo.schema.json; one that does not fit is refused, naming where (`blocks[2].runs[0].t is missing`).

Node does not import a module from a URL: in Node, use the command line, `npx tinylittleoffice` (the npm package `tinylittleoffice`, one file and no dependencies): `link`, `read` (`read --text` for what it says, as Markdown), `file`, `diff`, `lint`, `measure`, `apps`, `templates`.

To learn a shape by example rather than from these pages: `npx tinylittleoffice shapes deck` lists what a deck reads, a line a shape; `npx tinylittleoffice example deck two` prints the smallest document that shows it, its JSON (the kernel's document), and what `lint` and `measure` say of it (with no shape, every one of the app's); `npx tinylittleoffice try deck draft.tlo` (or `-` for stdin) is the loop in one call: the lint, the measures and the JSON of a draft. The API has the same three: `await shapes(app)`, `await example(app, shape)`, `await tryDraft(app, text)`. An agent that can only fetch reads the examples as files: `https://hilltopfamilia.org/examples/<app>.json` (every shape of the app, its text, its plain link and its JSON), and `https://hilltopfamilia.org/llms/<app>.txt`, a page on one app.

The words of a document may be in any language or script, right to left too (the kit sets the direction by the words): write for the reader. A link opens in its reader's browser's language; `link(app, text, { lang: 'ht' })` (or `--lang ht`) makes one that opens in Haitian Creole, or any language the site has (`es`, `pt-br`, `zh-hant`, `he`, `yi`, …), whatever the reader's browser says.

A page of your own can import `https://hilltopfamilia.org/tinyoffice.js` instead: `link({ app, doc, title })` writes the plain link and `embed({ app, doc, title })` the `<iframe>` that shows the document's pages. In the API, `encode`/`decode` are the codec, `parse`/`write` the kernel (the document as a head and blocks, and back), `tlo`/`fromTlo` a `.tlo` file's text, `file(app, text, ext)` a file of the app's own formats that needs no browser.
