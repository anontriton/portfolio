import { writing } from '../data'
import { IconArrow, Prompt, Tag, formatMonth } from '../components/ui'

export default function Writing() {
  const sorted = [...writing].sort((a, b) => b.date.localeCompare(a.date))
  return (
    <div className="pt-10 sm:pt-14">
      <Prompt cmd="ls" arg="-lt writing/" />
      <h1 className="text-[28px] font-bold text-fg">engineering notes</h1>
      <p className="mt-2 max-w-[620px] text-[13.5px] leading-relaxed text-muted">
        Deep dives and retrospectives: architecture, experimental results, debugging, and the decisions behind them.
      </p>

      <ul className="mt-8 divide-y divide-line border-y border-line">
        {sorted.map((a) => (
          <li key={a.href}>
            <a href={a.href} target="_blank" rel="noreferrer" className="group flex flex-col gap-2 py-5 sm:flex-row sm:gap-6">
              <span className="w-[80px] shrink-0 pt-0.5 text-[12px] text-muted">{formatMonth(a.date)}</span>
              <span className="min-w-0">
                <span className="flex items-center gap-2 text-[15px] text-fg group-hover:text-blue">
                  {a.title} <IconArrow />
                </span>
                <span className="mt-1.5 block text-[13px] leading-relaxed text-muted">{a.summary}</span>
                <span className="mt-3 flex flex-wrap gap-1.5">
                  {a.tags.map((t) => (
                    <Tag key={t} color="text-purple">
                      {t}
                    </Tag>
                  ))}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
