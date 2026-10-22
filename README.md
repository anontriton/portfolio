# portfolio

Source for [iversonlai.dev](https://iversonlai.dev), the personal site of Iverson Lai, software engineer (C/C++ · systems · ML).

Built with React, Vite, Tailwind CSS v4, and React Router. Static output, deployed on Vercel.

## Develop

```sh
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build into dist/
npm run preview   # serve dist/ locally
```

## Editing content

Everything on the site comes from [`src/data.ts`](src/data.ts):

- `profile` — name, links, bio (`pitch`), status line, optional "currently building" entry
- `neofetch` — the hero readout, top to bottom; `uptime` counts up from June 2023 on its own
- `projects` — cards and case-study pages (`/projects/:slug`); `featured` controls the tl;dr
- `experience` — `kind: 'other'` roles sit in a collapsed "more roles" group
- `education`, `skills`, `about` (the about.md section)
- `writing` — articles, not shown yet; `/blog` is an empty placeholder
- `contributions` — open-source PRs; the homepage section appears once this has entries

Images go in `public/images/`; the resume is `public/resume.pdf`.

- **ASCII portrait** — put a photo in `public/images/` and set `profile.portrait` to its path. A cut-out PNG with a transparent background works best; until then the hero shows the `IL` logo.
- **Project videos** — put a short muted clip in `public/videos/` and set the project's `video`. Its `image` becomes the poster frame.
- **Activity graph** — `scripts/fetch-contributions.mjs` pulls the last year of GitHub contributions before every `dev` and `build` (no token needed). If it can't reach GitHub, the graph is hidden.

## Deploy

Import the repo in Vercel (framework preset: Vite). `vercel.json` rewrites routes to `index.html` so deep links like `/projects/re-genesis` work.
