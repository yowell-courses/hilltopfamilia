# deck: slides

A slide between each `---`. The headline is `## :icon-name: Headline`, its layout an attribute: `{.title}` (a title slide), `{.two}` (two columns, a paragraph `|` between them) or `{.icon}` (bullets beside one big icon). The words are `- ` bullets nested by two spaces; `> ` lines are speaker notes; a `^[footnote]` is shown at the foot of its slide; `` `code` `` between backticks is set in a monospace face (a command, a file's name). A fence named by any app's id (```` ```anim ````, `diagram`, `draw`, `trip`, `cal`, `sheet`, the lot) puts that document on the slide, drawn by its app: an animation moves, a sheet with `chart: bar` in its head is a chart. The head may hold `theme:` (`boardroom`, `ivory`, `midnight`, `graphite`; for fun `confetti`, `sunset`, `ocean`, `bubblegum`, `arcade`, `chalkboard`; plain otherwise) and `transition:` (`cut`, `slide`, `zoom`; a fade otherwise).

The rules, before they are broken: a slide with a fence (a chart, a diagram, a table) is the fence's, drawn alone under the headline: bullets on it are not drawn, so put them in the notes (`> ` lines) or on a slide of their own. A headline is a few words; a long one is set smaller, then cut after two lines. Bullets are set as large as they fit, down to 14px; more than that runs off the slide, so split it. Presenting reveals one bullet, or one item of a fenced document, per step; the notes show with N or the Notes button, and start hidden under a finger.

`format:` in the head makes the deck a thing to print and fold, a page between each `---`: `poster` (one page, as big as the page allows), `zine` (8 pages), `booklet` (8 to 20), `brochure` (6 panels), `comic` (a panel per bullet, `- :icon-name: What is said | caption`) or `badges` (a page per person, the name as the headline).

Status update:

```
---
theme: boardroom
---
## :calendar: Acme Inc. site: status {.title}

- Week of November 2, 2026 · Harbor Studio

---

## This week and next {.two}

- Done: the six pages sketched and agreed
- Done: words for home, about and contact
- Done: hosting set up, the old address kept

|

- Next: words for work, prices and news
- Next: photographs on Thursday morning, weather allowing
- Next: first build shown on Friday, November 13

> Left, what shipped; right, what is planned. Keep it to the facts.

---

## :warning: Risks

- The price list is still being decided by Acme: the prices page waits on it
- Thursday may rain: Saturday is the fallback for photographs

---

## :help: Asks

- Dee Okafor to send the final prices by Wednesday, November 11
- Someone from Acme at the Friday read-through, an hour
```

As a link: <https://hilltopfamilia.org/deck/#doc=---%0Atheme%3A+boardroom%0A---%0A%23%23+%3Acalendar%3A+Acme+Inc.+site%3A+status+%7B.title%7D%0A%0A-+Week+of+November+2%2C+2026+%C2%B7+Harbor+Studio%0A%0A---%0A%0A%23%23+This+week+and+next+%7B.two%7D%0A%0A-+Done%3A+the+six+pages+sketched+and+agreed%0A-+Done%3A+words+for+home%2C+about+and+contact%0A-+Done%3A+hosting+set+up%2C+the+old+address+kept%0A%0A%7C%0A%0A-+Next%3A+words+for+work%2C+prices+and+news%0A-+Next%3A+photographs+on+Thursday+morning%2C+weather+allowing%0A-+Next%3A+first+build+shown+on+Friday%2C+November+13%0A%0A%3E+Left%2C+what+shipped%3B+right%2C+what+is+planned.+Keep+it+to+the+facts.%0A%0A---%0A%0A%23%23+%3Awarning%3A+Risks%0A%0A-+The+price+list+is+still+being+decided+by+Acme%3A+the+prices+page+waits+on+it%0A-+Thursday+may+rain%3A+Saturday+is+the+fallback+for+photographs%0A%0A---%0A%0A%23%23+%3Ahelp%3A+Asks%0A%0A-+Dee+Okafor+to+send+the+final+prices+by+Wednesday%2C+November+11%0A-+Someone+from+Acme+at+the+Friday+read-through%2C+an+hour>

Poster:

```
---
format: poster
---
## :music: Open mic night {.title}

- Friday, November 13, 8 pm
- The Anchor, 14 Quay Street
- Free. Bring a song, a poem, or just your ears.
```

As a link: <https://hilltopfamilia.org/deck/#doc=---%0Aformat%3A+poster%0A---%0A%23%23+%3Amusic%3A+Open+mic+night+%7B.title%7D%0A%0A-+Friday%2C+November+13%2C+8+pm%0A-+The+Anchor%2C+14+Quay+Street%0A-+Free.+Bring+a+song%2C+a+poem%2C+or+just+your+ears.>

Templates: A talk, Status update, A proposal, A pitch, A lesson, Conference talk, Quarterly review, Workshop agenda, Product launch, Town-hall notice, Trivia night, Wedding slideshow, Zine, Recipe zine, Booklet, Concert program, Brochure, Farm brochure, Comic, Comic: the umbrella, Poster, Lost cat poster, Name badges, Conference badges. Its own files: `.pptx`, `.html`, `.zip`, `.gif`, `.webm`.
