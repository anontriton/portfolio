import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { posts } from '../blog'
import { email, profile, projects } from '../data'
import { useGlide } from './motion'
import { useToast } from './Toasts'

// ⌘K / ctrl+K launcher after beUI's command palette block, dressed as a
// shell prompt: fuzzy-match a page or an action, arrows to pick, enter to go.

export const modKey = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘' : 'ctrl '

type Item = { id: string; group: 'go' | 'run'; label: string; hint: string; keywords?: string; run: () => void }

export default function CommandPalette({ onClose, onTldr }: { onClose: () => void; onTldr: () => void }) {
  const navigate = useNavigate()
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const field = useRef<HTMLInputElement>(null)

  useEffect(() => {
    field.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const items = useMemo<Item[]>(() => {
    const go = (to: string) => () => navigate(to, { viewTransition: true })
    const open = (href: string) => () => window.open(href, '_blank', 'noreferrer')
    const copy = (text: string, what: string) => () =>
      navigator.clipboard.writeText(text).then(
        () => toast({ tone: 'ok', text: `${what} copied`, detail: text }),
        () => toast({ tone: 'fail', text: `couldn't copy the ${what}`, detail: text }),
      )
    return [
      { id: 'home', group: 'go', label: 'home', hint: '~', run: go('/') },
      { id: 'projects', group: 'go', label: 'projects', hint: '~/projects', run: go('/projects') },
      ...projects.map<Item>((p) => ({
        id: `p-${p.slug}`,
        group: 'go',
        label: p.name,
        hint: `~/projects/${p.slug}`,
        keywords: p.stack.join(' '),
        run: go(`/projects/${p.slug}`),
      })),
      { id: 'blog', group: 'go', label: 'blog', hint: '~/blog', run: go('/blog') },
      ...posts.map<Item>((p) => ({
        id: `b-${p.slug}`,
        group: 'go',
        label: p.title,
        hint: `~/blog/${p.slug}`,
        keywords: p.tags.join(' '),
        run: go(`/blog/${p.slug}`),
      })),
      { id: 'resume', group: 'run', label: 'open resume', hint: 'resume.pdf ↗', keywords: 'cv', run: open(profile.resume) },
      { id: 'email', group: 'run', label: 'copy email', hint: profile.emailShown, keywords: 'contact mail', run: () => copy(email(), 'email')() },
      { id: 'contact', group: 'run', label: 'send a message', hint: './contact.sh', keywords: 'contact email mail', run: go('/#contact') },
      { id: 'tldr', group: 'run', label: 'tl;dr', hint: 'recruiter summary', keywords: 'summary tldr', run: onTldr },
      { id: 'link', group: 'run', label: 'copy link to this page', hint: 'url', keywords: 'share', run: copy(location.href, 'link') },
      { id: 'github', group: 'run', label: 'github', hint: 'github.com ↗', run: open(profile.github) },
      { id: 'linkedin', group: 'run', label: 'linkedin', hint: 'linkedin.com ↗', run: open(profile.linkedin) },
      { id: 'monkeytype', group: 'run', label: 'monkeytype', hint: 'typing stats ↗', keywords: 'wpm', run: open(profile.monkeytype) },
      { id: 'source', group: 'run', label: 'view source', hint: 'this site ↗', keywords: 'code repo', run: open(profile.sourceRepo) },
    ]
  }, [navigate, toast, onTldr])

  const results = useMemo(() => {
    if (!query.trim()) return items.map((item) => ({ item, hits: [] as number[] }))
    return items
      .map((item) => {
        const onLabel = fuzzy(query, item.label)
        const onKeywords = item.keywords ? fuzzy(query, item.keywords) : null
        // keyword hits rank below label hits and highlight nothing
        const best = onLabel ?? (onKeywords && { score: onKeywords.score - 20, hits: [] })
        return best && { item, ...best }
      })
      .filter((r) => r !== null)
      .sort((a, b) => b.score - a.score)
  }, [items, query])

  const choose = (item: Item | undefined) => {
    if (!item) return
    onClose()
    item.run()
  }

  const onKey = (e: KeyboardEvent) => {
    const step = (d: number) => {
      e.preventDefault()
      if (results.length) setActive((a) => (a + d + results.length) % results.length)
    }
    if (e.key === 'ArrowDown' || (e.ctrlKey && e.key === 'n')) step(1)
    else if (e.key === 'ArrowUp' || (e.ctrlKey && e.key === 'p')) step(-1)
    else if (e.key === 'Enter') choose(results[active]?.item)
    else if (e.key === 'Escape') onClose()
  }

  useEffect(() => {
    document.getElementById(`cmd-${results[active]?.item.id}`)?.scrollIntoView({ block: 'nearest' })
  }, [active, results])

  const glide = useGlide<HTMLUListElement>('[aria-selected="true"]', `${active}:${query}`)
  const grouped = !query.trim()

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-bg/80 p-4 pt-[14vh] backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="palette-in w-full max-w-[560px] overflow-hidden rounded-[4px] border border-line-strong bg-surface text-[13px] shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
          <span className="text-green">$</span>
          <input
            ref={field}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            onKeyDown={onKey}
            placeholder="jump to a page or run a command…"
            role="combobox"
            aria-expanded="true"
            aria-controls="cmd-list"
            aria-activedescendant={results[active] ? `cmd-${results[active].item.id}` : undefined}
            autoComplete="off"
            spellCheck={false}
            className="term-input min-w-0 flex-1 bg-transparent text-fg caret-blue outline-none placeholder:text-faint"
          />
          <button type="button" onClick={onClose} className="cursor-pointer text-[11.5px] text-muted hover:text-fg">
            esc
          </button>
        </div>

        <ul ref={glide.ref} id="cmd-list" role="listbox" className="relative max-h-[min(420px,55vh)] overflow-y-auto p-1.5">
          <li aria-hidden className="pointer-events-none absolute left-0 top-0 rounded-[3px] bg-raised" style={glide.style} />
          {results.map(({ item, hits }, i) => (
            <Row
              key={item.id}
              item={item}
              hits={hits}
              heading={grouped && item.group !== results[i - 1]?.item.group ? item.group : undefined}
              selected={i === active}
              onHover={() => setActive(i)}
              onChoose={() => choose(item)}
            />
          ))}
          {results.length === 0 && (
            <li className="px-3 py-6 text-center text-muted">
              command not found: <span className="text-red">{query}</span>
            </li>
          )}
        </ul>

        <div className="flex gap-4 border-t border-line px-4 py-2 text-[11px] text-faint">
          <span>
            <span className="text-muted">↑↓</span> select
          </span>
          <span>
            <span className="text-muted">↵</span> open
          </span>
          <span>
            <span className="text-muted">esc</span> close
          </span>
        </div>
      </div>
    </div>
  )
}

function Row({
  item,
  hits,
  heading,
  selected,
  onHover,
  onChoose,
}: {
  item: Item
  hits: number[]
  heading?: string
  selected: boolean
  onHover: () => void
  onChoose: () => void
}) {
  return (
    <>
      {heading && (
        <li role="presentation" className="relative px-3 pb-1 pt-2.5 text-[10.5px] uppercase tracking-wider text-faint first:pt-1.5">
          {heading}
        </li>
      )}
      <li
        id={`cmd-${item.id}`}
        role="option"
        aria-selected={selected}
        onMouseMove={selected ? undefined : onHover}
        onClick={onChoose}
        className="relative flex cursor-pointer items-center justify-between gap-4 rounded-[3px] px-3 py-2"
      >
        <span className={`truncate ${selected ? 'text-fg' : 'text-fg-dim'}`}>
          {[...item.label].map((c, i) =>
            hits.includes(i) ? (
              <span key={i} className="text-blue">
                {c}
              </span>
            ) : (
              c
            ),
          )}
        </span>
        <span className="flex shrink-0 items-center gap-2 text-[11.5px] text-faint">
          <span className="hidden sm:inline">{item.hint}</span>
          <span className={selected ? 'text-blue' : 'invisible'}>↵</span>
        </span>
      </li>
    </>
  )
}

// Subsequence match: every query character must appear in order. Runs of
// consecutive hits and hits at word starts score higher; gaps cost a little.
function fuzzy(query: string, text: string) {
  const q = query.toLowerCase().replace(/\s+/g, '')
  const t = text.toLowerCase()
  const hits: number[] = []
  let score = 0
  let from = 0
  for (const c of q) {
    const i = t.indexOf(c, from)
    if (i < 0) return null
    const prev = hits[hits.length - 1]
    if (prev !== undefined && i === prev + 1) score += 8
    if (i === 0 || /[\s\-/.:]/.test(t[i - 1])) score += 6
    score -= Math.min(i - from, 5)
    hits.push(i)
    from = i + 1
  }
  return { score: score - t.length * 0.1, hits }
}
