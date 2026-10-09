GOLD MOTION — CUSTOM EFFECTS DOCS
=================================

Documentation for the Custom category import feature in Gold Motion V7.
No build step, no framework, no internet. Open index.html.

FOLDER MAP
----------
  index.html                    the docs (one page, 10 sections)
  logo.webp                     Gold Motion logo (top bar + favicon)
  styles.css                    minimal dark theme, mobile-first layout
  app.js                        code highlight, copy buttons, effects search
  effects.js                    the 77-effect index (inlined so it works on file://)
  effects.json                  same data as JSON
  effects/                      77 ready-to-import .xml files
  thumb/                        legacy previews for the original 68 effects
  downloads/
    GoldMotion-CustomFX-Pack.zip  effects + install guide

VIEWING IT
----------
* Double-click index.html. Everything works offline, including the library
  and the download button.
* To serve it properly:
      python -m http.server 8080
      npx serve .
  then open http://localhost:8080

PUBLISHING
----------
Upload the whole folder to any static host (GitHub Pages, Netlify,
Cloudflare Pages, Vercel). Nothing to build. Keep the folder structure so
effects/ and downloads/ resolve.

WHAT THE DOCS COVER
-------------------
  01  What the Custom category does, and the 5 things the + button runs
  02  THE HEADER — every attribute, and why thumb="..." is mandatory
  03  Import step by step, including the thumbnail prompt and the
      back-out-and-re-enter refresh
  04  Controls (spinner, color, switch, selector, texture, point, xyz, section)
  05  The shader — GLSL ES 1.00 rules and every ac* engine value
  06  Working practice — the four things that save an evening
  07  Troubleshooting, mapped to the app's real error messages
  08  The copy-paste AI prompt with the full schema embedded
  09  The 77-effect library with per-effect download
  10  FAQ

EDITING THE DOCS
----------------
* Text is in index.html, grouped by <section id="...">.
* Code samples are <pre><code data-lang="xml|glsl|text"> ... </code></pre>.
  Inside those, write &lt; for <, &gt; for > and &amp; for &.
* Colours are CSS variables at the top of styles.css (--accent is the accent).

REGENERATING THE EFFECTS
------------------------
Run ../.workbuddy-ai/customfx-build/build_effects.py with the managed Python.
It rewrites effects/, thumb/, the ZIP and the JSON in one go. The header
format it emits is documented at the top of that script.
