# cal: a calendar, or a schedule

A list item per thing: `- 2027-03-01: Launch`, `- 2027-03-01 to 2027-03-03: Offsite`, `- 2027-03-10 09:00-10:30: Retro`. Attributes give a color and a repeat: `{color=green every=week times=6}` (or `until=2027-06-01`). The head may hold a time zone, `zone: America/New_York`; without one the times are read in the reader's own zone. It may say what a color stands for: `green: Sam`. `view: gantt` in the head draws the same items as a schedule: an item nested under another is part of it, `{done=40%}` is how far along it is, `- [x]` that it is done.

Family calendar:

```
---
title: The Okafor family
green: Sam
orange: Ana
blue: Everyone
---
- 2026-11-03 16:30-17:15: Swim lesson, Sam {color=green every=week times=10}
- 2026-11-04: Trash and recycling out tonight {every=week}
- 2026-11-05 18:30-20:00: Parent-teacher night, bring the reading log {color=blue}
- 2026-11-07 10:00-11:30: Soccer, under-10s home game {color=green every=week until=2026-12-12}
- 2026-11-09: Ana's birthday {color=orange every=year}
- 2026-11-12 08:40-09:20: Dentist, Dr. Patel, both kids {color=blue}
- 2026-11-21 to 2026-11-22: Grandma visits from Philadelphia {color=blue}
- 2026-11-26: Thanksgiving at Aunt Jo's, bring the pies {color=blue every=year}
- 2026-12-03 19:30-22:00: Book club at Jo's {color=orange every=month}
- 2026-12-23 to 2027-01-01: Winter break {color=green}
```

As a link: <https://hilltopfamilia.org/cal/#doc=---%0Atitle%3A+The+Okafor+family%0Agreen%3A+Sam%0Aorange%3A+Ana%0Ablue%3A+Everyone%0A---%0A-+2026-11-03+16%3A30-17%3A15%3A+Swim+lesson%2C+Sam+%7Bcolor%3Dgreen+every%3Dweek+times%3D10%7D%0A-+2026-11-04%3A+Trash+and+recycling+out+tonight+%7Bevery%3Dweek%7D%0A-+2026-11-05+18%3A30-20%3A00%3A+Parent-teacher+night%2C+bring+the+reading+log+%7Bcolor%3Dblue%7D%0A-+2026-11-07+10%3A00-11%3A30%3A+Soccer%2C+under-10s+home+game+%7Bcolor%3Dgreen+every%3Dweek+until%3D2026-12-12%7D%0A-+2026-11-09%3A+Ana%27s+birthday+%7Bcolor%3Dorange+every%3Dyear%7D%0A-+2026-11-12+08%3A40-09%3A20%3A+Dentist%2C+Dr.+Patel%2C+both+kids+%7Bcolor%3Dblue%7D%0A-+2026-11-21+to+2026-11-22%3A+Grandma+visits+from+Philadelphia+%7Bcolor%3Dblue%7D%0A-+2026-11-26%3A+Thanksgiving+at+Aunt+Jo%27s%2C+bring+the+pies+%7Bcolor%3Dblue+every%3Dyear%7D%0A-+2026-12-03+19%3A30-22%3A00%3A+Book+club+at+Jo%27s+%7Bcolor%3Dorange+every%3Dmonth%7D%0A-+2026-12-23+to+2027-01-01%3A+Winter+break+%7Bcolor%3Dgreen%7D>

Project plan:

```
---
title: A website for Hollow Pine Coffee
view: gantt
---
- 2026-09-28 to 2026-10-09: Discovery
  - [x] 2026-09-28 to 2026-09-30: Interviews with the staff and six regulars
  - [x] 2026-10-01 to 2026-10-02: Analytics review
  - 2026-10-05 to 2026-10-09: Content audit {done=80%}
- 2026-10-12 to 2026-10-30: Design
  - 2026-10-12 to 2026-10-16: Wireframes
  - 2026-10-16: The logo chosen {color=red}
  - 2026-10-19 to 2026-10-30: Visual design
- 2026-11-02 to 2026-11-20: Build
  - 2026-11-02 to 2026-11-13: Pages and the menu {color=blue}
  - 2026-11-09 to 2026-11-13: Ordering ahead {color=blue}
  - 2026-11-16 to 2026-11-20: Testing on phones {color=blue}
- 2026-11-24: Launch {color=red}
```

As a link: <https://hilltopfamilia.org/cal/#doc=---%0Atitle%3A+A+website+for+Hollow+Pine+Coffee%0Aview%3A+gantt%0A---%0A-+2026-09-28+to+2026-10-09%3A+Discovery%0A++-+%5Bx%5D+2026-09-28+to+2026-09-30%3A+Interviews+with+the+staff+and+six+regulars%0A++-+%5Bx%5D+2026-10-01+to+2026-10-02%3A+Analytics+review%0A++-+2026-10-05+to+2026-10-09%3A+Content+audit+%7Bdone%3D80%25%7D%0A-+2026-10-12+to+2026-10-30%3A+Design%0A++-+2026-10-12+to+2026-10-16%3A+Wireframes%0A++-+2026-10-16%3A+The+logo+chosen+%7Bcolor%3Dred%7D%0A++-+2026-10-19+to+2026-10-30%3A+Visual+design%0A-+2026-11-02+to+2026-11-20%3A+Build%0A++-+2026-11-02+to+2026-11-13%3A+Pages+and+the+menu+%7Bcolor%3Dblue%7D%0A++-+2026-11-09+to+2026-11-13%3A+Ordering+ahead+%7Bcolor%3Dblue%7D%0A++-+2026-11-16+to+2026-11-20%3A+Testing+on+phones+%7Bcolor%3Dblue%7D%0A-+2026-11-24%3A+Launch+%7Bcolor%3Dred%7D>

Templates: Family calendar, School term, Bills and renewals, Volunteer schedule, Vacation planner, League schedule, Garden calendar, Content schedule, Editorial calendar, Training plan, Project plan, Conference agenda, Festival weekend. Its own files: `.ics`, `.csv`.
