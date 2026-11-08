# outline: an outliner

A nested list, two spaces a level. An item's tie to its parent can be an arrow, `{.to}` (towards the parent) or `{.from}`, named with `label="…"`; any two items join with `~ Pricing -> Press: informs`. An item may be a task (`- [ ]`, `- [x]`), carry a status from the document's own set (`statuses: TODO=red, DOING=yellow, DONE=green` in the head, a name and a color each: `red`, `orange`, `yellow`, `green`, `blue`, `purple`, `indigo`, `gray`; the last is the done one, and a task's box follows it), `{status=DOING}`, and a due day, `{due=2026-10-20}`; `{.shut}` folds its family away (an item is open otherwise). A fence named by any app's id (```` ```anim ````, `cal`, `diagram`, `sheet`, the lot) puts that document under an item, `{depth=2}` after its name saying how deep. The same tree opens as slides, a mind map, an org chart or a network.

Launch plan:

````
---
title: Fieldnote 2.0 launch
---
- Fieldnote 2.0, out on Thursday, November 12
  - Product
    - Pricing {.from label=sets}
      - $4 a month or $36 a year; free for students^[Three rivals checked in September: $3 to $6 a month.]
    - Onboarding
      - Three screens, then straight to the first note
    - Freeze the build on Monday, November 2
  - Dates

```cal {depth=2}
- 2026-11-02: Build frozen
- 2026-11-05: Review copies out
- 2026-11-12: Launch day
```

  - Marketing
    - Press
      - Review copies to six writers on November 5, embargoed to the 12th
    - Newsletter
      - To 4,200 readers at 8 am on launch day
    - A ninety-second film of a note being made
  - Support
    - Help pages
      - Twelve of them, the five most asked about first
    - A reply within a day, Priya and Tom taking turns

~ Pricing -> Press: informs
~ Help pages -> Newsletter: linked from
````

As a link: <https://hilltopfamilia.org/outline/#doc=---%0Atitle%3A+Fieldnote+2.0+launch%0A---%0A-+Fieldnote+2.0%2C+out+on+Thursday%2C+November+12%0A++-+Product%0A++++-+Pricing+%7B.from+label%3Dsets%7D%0A++++++-+%244+a+month+or+%2436+a+year%3B+free+for+students%5E%5BThree+rivals+checked+in+September%3A+%243+to+%246+a+month.%5D%0A++++-+Onboarding%0A++++++-+Three+screens%2C+then+straight+to+the+first+note%0A++++-+Freeze+the+build+on+Monday%2C+November+2%0A++-+Dates%0A%0A%60%60%60cal+%7Bdepth%3D2%7D%0A-+2026-11-02%3A+Build+frozen%0A-+2026-11-05%3A+Review+copies+out%0A-+2026-11-12%3A+Launch+day%0A%60%60%60%0A%0A++-+Marketing%0A++++-+Press%0A++++++-+Review+copies+to+six+writers+on+November+5%2C+embargoed+to+the+12th%0A++++-+Newsletter%0A++++++-+To+4%2C200+readers+at+8+am+on+launch+day%0A++++-+A+ninety-second+film+of+a+note+being+made%0A++-+Support%0A++++-+Help+pages%0A++++++-+Twelve+of+them%2C+the+five+most+asked+about+first%0A++++-+A+reply+within+a+day%2C+Priya+and+Tom+taking+turns%0A%0A~+Pricing+-%3E+Press%3A+informs%0A~+Help+pages+-%3E+Newsletter%3A+linked+from>

Templates: Packing list, A decision, Launch plan, A talk, A speech, An essay plan, A research plan, A syllabus, A novel, A book, A company, A family, A decision tree, Troubleshooting. Its own files: `.opml`, `.md`, `.pdf`, `.txt`. (the `.pdf` is the outline's words as sections and bullets, selectable and bookmarked)
