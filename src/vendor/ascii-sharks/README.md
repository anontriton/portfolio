# ascii-sharks (vendored)

ASCII sharks and fish schools on a canvas, by **@stackedlol**:
https://github.com/stackedlol/ascii-sharks

Copied from commit `c521e24a787e6d4cc460d4cf2b9815f25e4fe453`. The upstream
repo has no license file; the author publicly invited people to use it (posted
on X with a link to the repo). All credit for the simulation and renderer goes
to the author; the site footer links back to the repo.

Local changes (marked "Patched in for iversonlai.dev" in the source):

- `renderer.ts` — `background` / `setBackground()` so the backdrop matches the
  site's theme instead of pure black.
- `engine.ts` — reads the canvas's CSS `background-color` and passes it to the
  renderer.

Everything else is unchanged. `react.tsx` and the demo were not copied; the site
uses its own wrapper in `src/components/SharkBackground.tsx`.
