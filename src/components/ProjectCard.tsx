import { Link } from 'react-router-dom'
import type { Project } from '../data'
import { Tag, accentFor } from './ui'

export default function ProjectCard({ project: p, wide }: { project: Project; wide?: boolean }) {
  const preview = p.sections?.find((s) => s.code)?.code
  return (
    <Link
      to={`/projects/${p.slug}`}
      className={`group flex flex-col overflow-hidden rounded-[4px] border border-line bg-surface transition-colors hover:border-line-strong ${wide ? 'sm:col-span-2' : ''}`}
    >
      {p.image && (
        <div className="aspect-[16/9] overflow-hidden border-b border-line bg-raised">
          <img
            src={p.image.src}
            alt={p.image.alt}
            loading="lazy"
            className="h-full w-full object-cover opacity-90 transition duration-300 group-hover:scale-[1.02] group-hover:opacity-100"
          />
        </div>
      )}
      {!p.image && !wide && preview && (
        <div className="flex aspect-[16/9] items-center overflow-hidden border-b border-line bg-raised px-5">
          <pre className="text-[10.5px] leading-[1.55] text-muted transition-colors group-hover:text-fg-dim">{preview}</pre>
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-[15px] font-medium text-fg group-hover:text-blue">{p.name}</h3>
          <span className="shrink-0 text-[11.5px] text-faint">{p.year}</span>
        </div>
        <div className="mt-0.5 text-[11.5px] text-muted">~/{p.file}</div>
        <p className="mt-3 text-[13px] leading-relaxed text-fg-dim">{p.tagline}</p>

        {wide && p.stats && (
          <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
            {p.stats.map((s, i) => (
              <div key={s.label}>
                <span className={`text-[18px] font-bold ${accentFor(i + 1)}`}>{s.value}</span>
                <span className="ml-2 text-[12px] text-muted">{s.label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
          {p.stack.slice(0, wide ? 6 : 4).map((t, i) => (
            <Tag key={t} color={accentFor(i)}>
              {t}
            </Tag>
          ))}
        </div>
      </div>
    </Link>
  )
}
