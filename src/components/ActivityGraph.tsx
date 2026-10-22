import { useEffect, useRef, useState } from 'react'
import data from '../generated/contributions.json'
import { profile } from '../data'

type Day = { date: string; level: number; count: number }

const levels = ['bg-raised', 'bg-green/25', 'bg-green/45', 'bg-green/70', 'bg-green']

// GitHub-style contribution grid, built from data fetched at build time
// (scripts/fetch-contributions.mjs). Renders nothing if the fetch failed.
export default function ActivityGraph() {
  const days = data.days as Day[]
  const scroller = useRef<HTMLDivElement>(null)
  const [tip, setTip] = useState<{ day: Day; x: number; y: number } | null>(null)

  // On narrow screens the grid scrolls sideways; start at the most recent week.
  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [])

  if (days.length === 0) return null

  // Columns are weeks starting on Sunday; pad the first week if needed.
  const lead = new Date(days[0].date + 'T00:00:00').getDay()
  const cells: (Day | null)[] = [...Array(lead).fill(null), ...days]
  const weeks: (Day | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  // Label the week each month starts in; drop the partial first month's
  // label when the next one follows too closely to fit.
  const months = weeks.map((w, i) => {
    const first = w.find((d) => d && d.date.endsWith('-01')) ?? (i === 0 ? w.find(Boolean) : null)
    return first ? new Date(first.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' }).toLowerCase() : ''
  })
  if (months.slice(1, 3).some(Boolean)) months[0] = ''
  const columns = { gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }
  const total = days.reduce((s, d) => s + d.count, 0)

  return (
    <div className="relative rounded-[4px] border border-line bg-surface p-4 sm:p-5">
      <div ref={scroller} className="overflow-x-auto pb-1">
        <div className="min-w-[620px]">
          <div className="mb-1.5 grid gap-[3px] text-[10.5px] text-muted" style={columns}>
            {months.map((m, i) => (
              <span key={i} className="overflow-visible whitespace-nowrap">
                {m}
              </span>
            ))}
          </div>
          <div className="grid gap-[3px]" style={columns} onMouseLeave={() => setTip(null)}>
            {weeks.map((w, i) => (
              <div key={i} className="flex flex-col gap-[3px]">
                {w.map((d, j) =>
                  d ? (
                    <span
                      key={d.date}
                      className={`aspect-square rounded-[2px] ${levels[d.level]} transition-transform duration-75 hover:scale-125 hover:outline hover:outline-1 hover:outline-fg-dim`}
                      onMouseEnter={(e) => {
                        const r = e.currentTarget.getBoundingClientRect()
                        const box = e.currentTarget.closest('.relative')!.getBoundingClientRect()
                        // keep the tooltip inside the card near either edge
                        const x = Math.min(Math.max(r.left - box.left + r.width / 2, 75), box.width - 75)
                        setTip({ day: d, x, y: r.top - box.top })
                      }}
                    />
                  ) : (
                    <span key={j} className="aspect-square" />
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {tip && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-[3px] border border-line-strong bg-raised px-2 py-1 text-[11px] text-fg-dim shadow-lg shadow-black/40"
          style={{ left: tip.x, top: tip.y - 6 }}
        >
          <span className={tip.day.count ? 'text-green' : 'text-muted'}>
            {tip.day.count || 'no'} contribution{tip.day.count === 1 ? '' : 's'}
          </span>{' '}
          · {new Date(tip.day.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toLowerCase()}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-muted">
        <a href={profile.github} target="_blank" rel="noreferrer" className="hover:text-fg">
          <span className="text-fg-dim">{total}</span> contributions in the last year
        </a>
        <span className="flex items-center gap-[3px]" aria-hidden>
          less
          {levels.map((c) => (
            <span key={c} className={`mx-px h-[10px] w-[10px] rounded-[2px] ${c}`} />
          ))}
          more
        </span>
      </div>
    </div>
  )
}
