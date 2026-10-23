# stacked-dither (vendored)

A WebGL wave field, Bayer-dithered to a palette, by **@stackedlol**:
https://github.com/stackedlol/stacked-dither

Copied from commit `2da616c6de3cb25ccd4bc3d1645b23bda36dc1fa`. The upstream
repo has no license file; the author publicly invited
people to use it as long as they're credited. All credit for the shader and
engine goes to the author; the site footer links back to the repo.

`engine.ts`, `palettes.ts`, `shader.ts` and `index.ts` are unchanged.
`react.tsx`, the demo and the GIF script were not copied; the site uses its own
wrapper in `src/components/DitherBackground.tsx` (used behind the 404 page),
which also holds the Catppuccin palette.
