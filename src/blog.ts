import { marked } from 'marked'

// Blog posts are Markdown files in src/posts/. The file name is the URL slug
// (src/posts/simd-gemm.md → /blog/simd-gemm). Each starts with a front-matter
// block:
//
//   ---
//   title: Making GEMM fast with AVX2
//   date: 2026-11-02
//   summary: One line for the blog list.
//   tags: c++, simd, performance
//   ---
//
// title and date (YYYY-MM-DD) are required. Drafts go in src/posts/drafts/:
// they show in `npm run dev` but are never bundled into a production build,
// so unpublished text can't be read from the site's JavaScript. Publish by
// moving the file up into src/posts/.

export type Post = {
  slug: string
  title: string
  date: string
  summary: string
  tags: string[]
  draft: boolean
  readTime: string
  html: string
}

// Bundled at build time; posts are the site author's own files, so rendering
// their HTML directly is safe.
const published = import.meta.glob('./posts/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
// Dead code in production builds, so the drafts are tree-shaken out entirely.
const drafts = import.meta.env.DEV
  ? (import.meta.glob('./posts/drafts/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>)
  : {}

export const posts: Post[] = [
  ...Object.entries(published).map(([path, raw]) => parse(slugOf(path), raw, false)),
  ...Object.entries(drafts).map(([path, raw]) => parse(slugOf(path), raw, true)),
].sort((a, b) => b.date.localeCompare(a.date))

function slugOf(path: string) {
  return path.replace(/^.*\/|\.md$/g, '')
}

function parse(slug: string, raw: string, draft: boolean): Post {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) throw new Error(`src/posts/${slug}.md: missing the --- front matter --- block at the top`)
  const meta: Record<string, string> = {}
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^(\w+)\s*:\s*(.*)$/)
    if (kv) meta[kv[1]] = kv[2].trim().replace(/^(['"])(.*)\1$/, '$2')
  }
  if (!meta.title) throw new Error(`src/posts/${slug}.md: front matter needs a title`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.date ?? '')) throw new Error(`src/posts/${slug}.md: front matter needs date: YYYY-MM-DD`)

  const body = match[2]
  const words = body.split(/\s+/).filter(Boolean).length
  return {
    slug,
    title: meta.title,
    date: meta.date,
    summary: meta.summary ?? '',
    tags: (meta.tags ?? '').replace(/^\[|\]$/g, '').split(',').map((t) => t.trim()).filter(Boolean),
    draft,
    readTime: `${Math.max(1, Math.round(words / 220))} min read`,
    html: marked.parse(body, { async: false }),
  }
}

export function formatDate(date: string) {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).toLowerCase()
}
