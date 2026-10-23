import { useState } from 'react'
import { projects, profile, type Project } from '../data'
import DitherBanner from '../components/DitherBanner'
import ProjectCard from '../components/ProjectCard'
import { Prompt } from '../components/ui'

const filters: { key: 'all' | Project['tags'][number]; label: string }[] = [
  { key: 'all', label: 'all' },
  { key: 'systems', label: 'systems' },
  { key: 'ml', label: 'ml' },
  { key: 'games', label: 'games' },
  { key: 'web', label: 'web' },
]

export default function Projects() {
  const [filter, setFilter] = useState<(typeof filters)[number]['key']>('all')
  const shown = projects.filter((p) => filter === 'all' || p.tags.includes(filter))

  return (
    <div className="pt-10 sm:pt-14">
      <DitherBanner seed={42}>
        <Prompt
          cmd="ls"
          arg={`projects/${filter === 'all' ? '' : `--tag=${filter}`}`}
          right={
            <a href={profile.github} target="_blank" rel="noreferrer" className="text-[12px] text-muted hover:text-blue">
              github →
            </a>
          }
        />
        <h1 className="text-[28px] font-bold text-fg">projects</h1>
        <p className="mt-2 max-w-[600px] text-[13.5px] leading-relaxed text-muted">
          Systems rebuilt from first principles, then pushed on for performance and correctness.
        </p>
      </DitherBanner>

      <div className="mt-6 flex gap-1 text-[12.5px]" role="tablist">
        {filters.map((f, i) => (
          <span key={f.key} className="flex items-center gap-1">
            {i > 0 && <span className="text-faint">/</span>}
            <button
              role="tab"
              aria-selected={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={`cursor-pointer px-1.5 py-1 ${filter === f.key ? 'text-blue' : 'text-muted hover:text-fg'}`}
            >
              {f.label}
            </button>
          </span>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {shown.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
    </div>
  )
}
