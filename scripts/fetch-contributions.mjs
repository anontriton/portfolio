// Fetches the last year of GitHub contributions at build time and writes
// src/generated/contributions.json. Uses the public calendar GitHub renders on
// profile pages, so no token is needed. On failure it writes an empty file and
// the homepage simply hides the graph — a flaky network never breaks a build.

import { mkdir, writeFile } from 'node:fs/promises'

const USER = 'anontriton'
const OUT = new URL('../src/generated/contributions.json', import.meta.url)

async function fetchDays() {
  const res = await fetch(`https://github.com/users/${USER}/contributions`, {
    headers: { 'User-Agent': 'iversonlai.dev build' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const html = await res.text()

  // Each day is a <td id=… data-date=… data-level=…>; its count lives in a
  // separate <tool-tip for=id>"N contributions on …"</tool-tip>.
  const counts = new Map()
  for (const m of html.matchAll(/<tool-tip[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    const n = m[2].match(/^(\d+) contribution/)
    counts.set(m[1], n ? Number(n[1]) : 0)
  }

  const days = []
  for (const m of html.matchAll(/<td\b[^>]*\bdata-date="[^"]+"[^>]*>/g)) {
    const tag = m[0]
    const date = tag.match(/data-date="([^"]+)"/)[1]
    const level = Number(tag.match(/data-level="(\d)"/)?.[1] ?? 0)
    const id = tag.match(/\bid="([^"]+)"/)?.[1]
    days.push({ date, level, count: counts.get(id) ?? 0 })
  }
  if (days.length < 300) throw new Error(`only parsed ${days.length} days`)
  return days.sort((a, b) => a.date.localeCompare(b.date))
}

let data = { user: USER, days: [] }
try {
  data.days = await fetchDays()
  console.log(`contributions: ${data.days.length} days, ${data.days.reduce((s, d) => s + d.count, 0)} total`)
} catch (err) {
  console.warn(`contributions: skipped (${err.message})`)
}
await mkdir(new URL('.', OUT), { recursive: true })
await writeFile(OUT, JSON.stringify(data))
