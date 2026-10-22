import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { Project } from '../data'
import { LiveBadge, Tag, accentFor } from './ui'

export default function ProjectCard({ project: p, wide }: { project: Project; wide?: boolean }) {
  const preview = p.sections?.find((s) => s.code)?.code
  const live = p.links.some((l) => l.label === 'live demo')
  return (
    <Link
      to={`/projects/${p.slug}`}
      viewTransition
      className={`group flex flex-col overflow-hidden rounded-[4px] border border-line bg-surface transition-colors hover:border-line-strong ${wide ? 'sm:col-span-2' : ''}`}
    >
      {p.video && <CardVideo src={p.video} poster={p.image?.src} label={p.image?.alt ?? p.name} />}
      {p.image && !p.video && (
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
          <span className="flex shrink-0 items-center gap-2 text-[11.5px] text-faint">
            {live && <LiveBadge />}
            {p.year}
          </span>
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

// Plays while the card is on screen; with reduced motion, only on hover.
function CardVideo({ src, poster, label }: { src: string; poster?: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current!
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const card = video.closest('a')!
    const play = () => video.play().catch(() => {})
    const pause = () => video.pause()
    if (reduce) {
      card.addEventListener('mouseenter', play)
      card.addEventListener('mouseleave', pause)
      return () => {
        card.removeEventListener('mouseenter', play)
        card.removeEventListener('mouseleave', pause)
      }
    }
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? play() : pause()), { threshold: 0.5 })
    io.observe(video)
    return () => io.disconnect()
  }, [])

  return (
    <div className="aspect-[16/9] overflow-hidden border-b border-line bg-raised">
      <video
        ref={ref}
        src={src}
        poster={poster}
        aria-label={label}
        muted
        loop
        playsInline
        preload="metadata"
        className="h-full w-full object-cover opacity-90 transition duration-300 group-hover:scale-[1.02] group-hover:opacity-100"
      />
    </div>
  )
}
