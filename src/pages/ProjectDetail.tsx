import { Link, useParams } from 'react-router-dom'
import { projects } from '../data'
import { Button, IconPlay, Prompt, Section, Tag, accentFor } from '../components/ui'
import NotFound from './NotFound'

// One column per stat on desktop, so three stats fill the row like four do.
const statCols: Record<number, string> = { 1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-4' }

export default function ProjectDetail() {
  const { slug } = useParams()
  const idx = projects.findIndex((p) => p.slug === slug)
  if (idx < 0) return <NotFound />
  const p = projects[idx]
  const next = projects[(idx + 1) % projects.length]

  return (
    <article className="pt-10 sm:pt-14">
      <Link viewTransition to="/projects" className="text-[12.5px] text-muted hover:text-blue">
        ← cd ..
      </Link>

      <div className="mt-6 text-[12px] text-muted">
        ~/{p.file} · {p.year}
      </div>
      <h1 className="mt-2 text-[30px] font-bold leading-tight text-fg sm:text-[36px]">{p.name}</h1>
      <p className="mt-4 text-[14.5px] leading-relaxed text-fg-dim">{p.description}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {p.links.map((l) => (
          <Button key={l.href} href={l.href} primary={l.primary} icon={l.label === 'live demo' ? <IconPlay /> : undefined}>
            {l.label}
          </Button>
        ))}
      </div>
      {p.note && <p className="mt-3 text-[12.5px] text-muted">{p.note}</p>}

      {p.image && (
        <figure className="mt-10">
          {p.video ? (
            <video
              src={p.video}
              poster={p.image.src}
              aria-label={p.image.alt}
              controls
              autoPlay={!window.matchMedia('(prefers-reduced-motion: reduce)').matches}
              muted
              loop
              playsInline
              preload="metadata"
              className="w-full rounded-[4px] border border-line"
            />
          ) : (
            <img src={p.image.src} alt={p.image.alt} className="w-full rounded-[4px] border border-line" />
          )}
          {p.image.caption && <figcaption className="mt-2 text-[12px] text-muted">{p.image.caption}</figcaption>}
        </figure>
      )}

      {p.stats && (
        <div className={`mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-[4px] border border-line bg-line ${statCols[p.stats.length] ?? 'sm:grid-cols-4'}`}>
          {p.stats.map((s, i, all) => (
            // an odd one out spans the row on phones instead of leaving a gap
            <div key={s.label} className={`bg-surface p-4 ${all.length % 2 && i === all.length - 1 ? 'col-span-2 sm:col-span-1' : ''}`}>
              <div className={`text-[22px] font-bold leading-none ${accentFor(i + 1)}`}>{s.value}</div>
              <div className="mt-2 text-[12px] text-fg-dim">{s.label}</div>
              {s.detail && <div className="mt-1 text-[11px] text-muted">{s.detail}</div>}
            </div>
          ))}
        </div>
      )}

      <Section className="!mt-12">
        <Prompt cmd="cat" arg="highlights.md" />
        <ul className="space-y-3">
          {p.highlights.map((h) => (
            <li key={h} className="flex gap-3 text-[13.5px] leading-relaxed text-fg-dim">
              <span className="select-none text-green">▸</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </Section>

      {p.sections?.map((s) => (
        <Section key={s.heading} className="!mt-12">
          <Prompt cmd="#" arg={s.heading} />
          {s.body?.map((b) => (
            <p key={b.slice(0, 24)} className="mb-4 text-[13.5px] leading-[1.8] text-fg-dim">
              {b}
            </p>
          ))}
          {s.bullets && (
            <ol className="space-y-2">
              {s.bullets.map((b, i) => (
                <li key={b} className="flex gap-3 text-[13.5px] leading-relaxed text-fg-dim">
                  <span className="w-5 shrink-0 select-none text-amber">{i}.</span>
                  <span>{b}</span>
                </li>
              ))}
            </ol>
          )}
          {s.code && (
            <pre className="overflow-x-auto rounded-[4px] border border-line bg-surface p-4 text-[12px] leading-relaxed text-fg-dim">
              {s.code}
            </pre>
          )}
        </Section>
      ))}

      {p.gallery && p.gallery.length > 0 && (
        <Section className="!mt-12">
          <Prompt cmd="ls" arg="screenshots/" />
          <div className="grid gap-4 sm:grid-cols-2">
            {p.gallery.map((g) => (
              <figure key={g.src}>
                <img src={g.src} alt={g.alt} loading="lazy" className="w-full rounded-[4px] border border-line" />
                {g.caption && <figcaption className="mt-2 text-[12px] text-muted">{g.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </Section>
      )}

      <Section className="!mt-12">
        <Prompt cmd="cat" arg="stack.txt" />
        <div className="flex flex-wrap gap-1.5">
          {p.stack.map((t, i) => (
            <Tag key={t} color={accentFor(i)}>
              {t}
            </Tag>
          ))}
        </div>
      </Section>

      <div className="mt-16 border-t border-line pt-6">
        <Link viewTransition to={`/projects/${next.slug}`} className="group flex items-center justify-between text-[13px]">
          <span className="text-muted">next project</span>
          <span className="text-fg group-hover:text-blue">{next.name} →</span>
        </Link>
      </div>
    </article>
  )
}
