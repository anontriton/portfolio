# portfolio

Source for [iversonlai.dev](https://iversonlai.dev), the personal site of Iverson Lai.

A terminal-themed single-page app: a `neofetch` hero with an interactive ASCII portrait, a live ASCII ocean in the background, a GitHub activity graph, and a contact form that emails me. Built with React, Vite, Tailwind CSS v4, and React Router; deployed on Vercel with one serverless function. Colours are [Catppuccin Mocha](https://catppuccin.com).

## Develop

```sh
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build into dist/
npm run preview   # serve dist/ locally
```

## Editing content

Everything on the site except blog posts comes from [`src/data.ts`](src/data.ts):

- `profile` — name, links, email, bio (`pitch`), status line,  "currently building" entry
- `neofetch` — the hero readout, top to bottom; lines that repeat profile facts read them from `profile`, and `uptime` counts up from June 2023 on its own
- `projects` — cards and case-study pages (`/projects/:slug`); `featured` controls the tl;dr
- `experience` — `kind: 'other'` roles sit in a collapsed "more roles" group
- `education`, `skills`, `about` (the about.md section)
- `contributions` — open-source PRs; the homepage section appears once this has entries

- **ASCII portrait** — drawn live from `profile.portrait` by [`AsciiPortrait.tsx`](src/components/AsciiPortrait.tsx).

  ```sh
  sips -Z 400 public/images/iverson.png --out public/images/iverson-ascii.png
  ```

- **Project videos** — put a short muted clip in `public/videos/` and set the project's `video`. Its `image` becomes the poster frame.
- **Activity graph** — `scripts/fetch-contributions.mjs` pulls the last year of GitHub contributions before every `dev` and `build`. If it can't reach GitHub, the graph is hidden.

## Blog

Posts are Markdown files in [`src/posts/`](src/posts/), loaded by [`src/blog.ts`](src/blog.ts). The file name is the URL: `src/posts/simd-gemm.md` → `/blog/simd-gemm`. Each file starts with front matter:

```md
---
title: Making GEMM fast with AVX2
date: 2026-11-02
summary: One line for the blog list.
tags: c++, simd, performance
---

Post body in Markdown…
```

`title` and `date` (YYYY-MM-DD) are required. Write drafts in `src/posts/drafts/`: they appear in `npm run dev` (marked "draft") but are never included in a production build, and git ignores them, so they stay on this machine (back them up yourself). To publish, move the file up into `src/posts/`, then commit and push. Images go in `public/images/blog/` and are referenced as `/images/blog/name.png`. [`src/posts/drafts/hello-world.md`](src/posts/drafts/hello-world.md) is a template showing everything the renderer supports.

## Background

The ocean behind the page is [ascii-sharks](https://github.com/stackedlol/ascii-sharks) by @stackedlol, used with the author's public permission and credited in the footer. It's vendored in [`src/vendor/ascii-sharks/`](src/vendor/ascii-sharks/); local changes are marked `Patched in for iversonlai.dev` and listed in that folder's README. Its opacity and the fade behind the content column are `opacity-45` in `SharkBackground.tsx` and `.shark-sea` in `src/index.css`.

## Deploy

Import the repo in Vercel (framework preset: Vite). `vercel.json` rewrites routes to `index.html` so deep links like `/projects/re-genesis` work; `/api/` and `/_vercel/` are excluded so the contact function and analytics endpoints are reachable.

Web Analytics is enabled with `<Analytics />` in `src/main.tsx`.

### Contact form

The form posts to [`api/contact.ts`](api/contact.ts), a Vercel Function that emails messages through [Resend](https://resend.com) with the visitor as reply-to.

- `RESEND_API_KEY` — from Resend → API Keys
- `CONTACT_TO` — where messages go; must be your Resend account's email until you verify a domain in Resend
- `CONTACT_FROM` (optional) — sender address once a domain is verified; defaults to `onboarding@resend.dev`
