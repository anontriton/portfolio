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

- `profile` — name, links, status line, optional "currently building" entry
- `projects` — cards and case-study pages (`/projects/:slug`); `featured` controls the tl;dr
- `experience`, `education`, `skills`, `about`
- `writing` — published articles only
- `contributions` — open-source PRs; the homepage section appears once this has entries

Images go in `public/images/`; the resume is `public/resume.pdf`.

## Deploy

Import the repo in Vercel (framework preset: Vite). `vercel.json` rewrites routes to `index.html` so deep links like `/projects/re-genesis` work.
