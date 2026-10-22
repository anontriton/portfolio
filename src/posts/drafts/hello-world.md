---
title: How to write a post
date: 2026-10-22
summary: A template showing the front matter and the Markdown this blog supports. It lives in drafts/, so it only appears in npm run dev.
tags: meta, markdown
---

Copy this file to start a post, and keep it in `src/posts/drafts/` while you work on it: drafts show up in `npm run dev` but never ship to the live site. When it's ready, move it up into `src/posts/`, then commit and push. The file name becomes the URL: `src/posts/simd-gemm.md` is published at `/blog/simd-gemm`.

## Headings

Use `##` for sections and `###` for subsections; the post title already acts as the top-level heading.

### Text

Regular paragraphs, **bold**, *italics*, `inline code`, and [links](https://iversonlai.dev).

> Blockquotes work for callouts or quoting someone.

- Bulleted lists
- with as many items
- as you need

1. Numbered lists
2. too

## Code

```cpp
// fenced code blocks keep their formatting and scroll sideways if long
for (int i = 0; i < n; i += 8) {
  __m256 a = _mm256_loadu_ps(x + i);
  acc = _mm256_fmadd_ps(a, b, acc);
}
```

## Tables

| version | tokens/s | speedup |
|---|---|---|
| naive | 0.11 | 1× |
| AVX2 + threads | 42.6 | 373× |

## Images

Put images in `public/images/blog/` and reference them from the site root, e.g. `![alt text](/images/blog/my-chart.png)`.

---

That's everything. Happy writing.
