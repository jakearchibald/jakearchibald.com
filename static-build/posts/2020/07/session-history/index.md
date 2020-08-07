---
title: Different versions of your site can be running at the same time
date: 2020-08-04 01:00:00
summary: Are you prepared for that? I'm not sure I am
meta: Are you prepared for that? I'm not sure I am
---

<script async type="module" src="client-bundle:./script.ts"></script>

# Notes

- Look at these buttons. There for decades. Should be well specified and consistent across browsers right? WRONG
- Navigate twice
- Go back
- What happens?
- Bf-cache
  - Safari & Firefox. Coming to Chrome.
  - Optimisation, might not happen. Also duplicate tab, tab restore etc etc
  - No unload or beforeunload in Safari. Seems ok to drop unload (in favour of pagehide), but not so much beforeunload.
- Without bf-cache
  - Loads from memory-cache (what about assets on the page like JS?) - again, optimisation
- Back again, then navigate
  - Wipes additional history
  - Makes sense, just wanted to set that up for later
- Nested
  - Nav iframe 1, nav iframe 2, back, back,
  - Just works
  - Single flat history model
  - Slightly concerning with history.back and length in iframes across origins
  - Sandbox prevents it (what does the spec say?)
- Nested, with modification
  - Nav iframe 1, nav iframe 2, remove iframe 1, back, ???
  - Talk through browsers
  - The safari problem
  - Nav iframe 1, add another iframe, back, Safari reloads
- Nested + top level
  - Examples and explanations
- A better model?
  - Link to github

Diagram buttons need to be previous/next
Just use preact? Might use that for the interface anyway
