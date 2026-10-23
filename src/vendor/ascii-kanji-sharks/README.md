# ascii-kanji-sharks (vendored)

Kanji sharks and fish schools on a canvas, by **@michikusa404**:
https://github.com/michikusa404/ascii-kanji-sharks (MIT, see `LICENSE`).

Copied from commit `7153916aebba0f34ce2d46904ad192188cdc6ceb`: `glyphs.js`,
`ocean.js`, `painter.js`, `util.js`. All credit for the simulation and renderer
goes to the author; the site footer links back to the repo.

Local changes (marked "Patched in for iversonlai.dev" in the source):

- `painter.js` — `setBackground()` so the backdrop matches the site's theme
  instead of the night theme's `#03070d`.

Added for the site, not upstream:

- `engine.js` / `engine.d.ts` — replaces upstream's `main.js` (URL params, key
  bindings, whole-page canvas) with a class that attaches to one canvas and can
  be torn down. Used by `src/components/SharkBackground.tsx`.

The glyphs are drawn in Noto Serif JP, subset to just the characters used and
loaded from Google Fonts by `glyphs.js`; offline it falls back to the system
Mincho.
