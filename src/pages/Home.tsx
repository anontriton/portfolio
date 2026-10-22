import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { about, contributions, education, experience, profile, projects, skills, writing } from '../data'
import { useTldr } from '../components/Layout'
import ProjectCard from '../components/ProjectCard'
import ActivityGraph from '../components/ActivityGraph'
import AsciiPortrait from '../components/AsciiPortrait'
import Ocean from '../components/Ocean'
import {
  ActionButton,
  Button,
  IconFile,
  IconGithub,
  IconLinkedin,
  IconMail,
  IconPlay,
  LiveBadge,
  Prompt,
  Section,
  Tag,
  accentFor,
  formatMonth,
} from '../components/ui'

const LOGO = String.raw`██╗██╗
██║██║
██║██║
██║██║
██║███████╗
╚═╝╚══════╝`

export default function Home() {
  const others = projects.slice(1)

  return (
    <>
      <Hero />
      <Flagship />
      <Section>
        <Prompt
          cmd="ls"
          arg="projects/"
          right={
            <Link viewTransition to="/projects" className="text-[12px] text-muted hover:text-blue">
              all projects →
            </Link>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {others.map((p, i) => (
            <ProjectCard key={p.slug} project={p} wide={i === 0} />
          ))}
        </div>
      </Section>
      <Activity />
      <Experience />
      {contributions.length > 0 && <Contributions />}
      <Skills />
      <Reef />
      <About />
      <Education />
      <Writing />
      <Contact />
    </>
  )
}

function Hero() {
  const openTldr = useTldr()
  const rows: [string, string, string?][] = [
    ['role', profile.title.toLowerCase()],
    ['focus', profile.focus.toLowerCase()],
    ['education', profile.degree],
    ['location', profile.location],
    ['status', profile.status, 'text-green'],
  ]

  const logo = (
    <pre
      aria-hidden
      className="hidden shrink-0 select-none bg-gradient-to-b from-blue to-purple bg-clip-text text-[21px] leading-[1.12] text-transparent sm:block"
    >
      {LOGO}
    </pre>
  )

  return (
    <section className="relative pt-10 sm:pt-16">
      <a
        href="#contact"
        className="stamp absolute right-0 top-12 hidden rounded-[3px] border-2 border-green/60 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-green/80 hover:border-green hover:text-green sm:block"
      >
        open to work
      </a>
      <div className="text-[13px] text-muted">
        <span className="text-green">{profile.handle}@lai</span>:<span className="text-blue">~</span>$ neofetch
      </div>

      <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-10">
        {profile.portrait ? (
          <div className="w-[170px] shrink-0 sm:w-[190px]">
            <AsciiPortrait src={profile.portrait} alt={`ASCII portrait of ${profile.name}`} fallback={logo} />
          </div>
        ) : (
          logo
        )}

        <div className="min-w-0 flex-1 text-[13px]">
          <div>
            <span className="text-blue">iverson</span>
            <span className="text-muted">@</span>
            <span className="text-blue">lai</span>
          </div>
          <div className="text-faint">───────────</div>
          <dl className="mt-1 grid grid-cols-[84px_1fr] gap-x-2 gap-y-[3px] sm:grid-cols-[96px_1fr]">
            {rows.map(([k, v, c]) => (
              <div key={k} className="contents">
                <dt className="text-amber">{k}</dt>
                <dd className={c ?? 'text-fg-dim'}>{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-3 flex gap-0" aria-hidden>
            {['bg-red', 'bg-orange', 'bg-amber', 'bg-green', 'bg-cyan', 'bg-blue', 'bg-purple', 'bg-fg-dim'].map((c) => (
              <span key={c} className={`h-3.5 w-6 ${c}`} />
            ))}
          </div>
        </div>
      </div>

      <h1 className="mt-10 text-[34px] font-bold leading-tight tracking-tight text-fg sm:text-[44px]">
        {profile.name}
        <span className="cursor" />
      </h1>
      <p className="mt-4 max-w-[640px] text-[14.5px] leading-relaxed text-fg-dim">{profile.pitch}</p>
      {profile.current && (
        <p className="mt-3 text-[13.5px] text-muted">
          <span className="text-green">▸</span> building <span className="font-medium text-amber">{profile.current.name}</span> —{' '}
          {profile.current.note}
        </p>
      )}

      <div className="mt-7 flex flex-wrap items-center gap-2">
        <Button href={profile.resume} primary icon={<IconFile />}>
          resume
        </Button>
        <Button href={`mailto:${profile.email}`} icon={<IconMail />}>
          email
        </Button>
        <ActionButton onClick={openTldr}>tl;dr</ActionButton>
        <span className="mx-1 hidden h-5 w-px bg-line sm:block" />
        <a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="p-2 text-muted hover:text-fg">
          <IconGithub />
        </a>
        <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="p-2 text-muted hover:text-fg">
          <IconLinkedin />
        </a>
      </div>
    </section>
  )
}

function Flagship() {
  const p = projects[0]
  return (
    <Section>
      <Prompt cmd="./bench" arg={`--project ${p.file}`} right={<span className="text-[11px] uppercase tracking-wider text-amber">flagship</span>} />
      <div className="rounded-[4px] border border-line bg-surface">
        <div className="border-b border-line p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <Link viewTransition to={`/projects/${p.slug}`} className="group">
              <h3 className="text-[19px] font-medium text-fg group-hover:text-blue">{p.name}</h3>
            </Link>
            {p.links.some((l) => l.label === 'live demo') && <LiveBadge />}
          </div>
          <p className="mt-2 text-[13.5px] leading-relaxed text-fg-dim">{p.tagline}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4">
          {p.stats!.map((s, i) => (
            <div
              key={s.label}
              className={`border-line p-4 sm:p-5 ${i % 2 === 0 ? 'border-r' : ''} ${i < 2 ? 'border-b sm:border-b-0' : ''} ${i === 1 ? 'sm:border-r' : ''}`}
            >
              <div className={`text-[24px] font-bold leading-none sm:text-[26px] ${accentFor(i + 1)}`}>{s.value}</div>
              <div className="mt-2 text-[12px] text-fg-dim">{s.label}</div>
              <div className="mt-1 text-[11px] leading-snug text-muted">{s.detail}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-line p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex flex-wrap gap-1.5">
            {p.stack.slice(0, 6).map((t, i) => (
              <Tag key={t} color={accentFor(i)}>
                {t}
              </Tag>
            ))}
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button href={p.links[0].href} primary icon={<IconPlay />}>
              live demo
            </Button>
            <Button href={`/projects/${p.slug}`}>case study</Button>
          </div>
        </div>
      </div>
    </Section>
  )
}

function Activity() {
  return (
    <Section>
      <Prompt cmd="git log" arg="--since=1.year --graph" />
      <ActivityGraph />
    </Section>
  )
}

function Experience() {
  const dot: Record<string, string> = { engineering: 'bg-blue', research: 'bg-green' }
  // The current role starts expanded; the rest show their first bullet.
  const [open, setOpen] = useState(() => new Set(experience.filter((j) => j.current).map((j) => j.org)))
  const toggle = (org: string) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(org)) next.delete(org)
      else next.add(org)
      return next
    })

  return (
    <Section>
      <Prompt
        cmd="cat"
        arg="experience.log"
        right={
          <span className="flex gap-3 text-[11px] text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue" /> engineering
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green" /> research
            </span>
          </span>
        }
      />
      <ol className="relative ml-[3px] border-l border-line">
        {experience.map((j) => (
          <li key={j.org} className="relative pb-9 pl-6 last:pb-0">
            <span className={`absolute -left-[4px] top-[7px] h-[7px] w-[7px] rounded-full ${dot[j.kind]}`} />
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
              <h3 className="text-[14.5px] text-fg">
                {j.role} <span className="text-muted">@</span> <span className="text-blue">{j.org}</span>
              </h3>
              <span className="shrink-0 text-[12px] text-muted">
                {j.current && <span className="mr-2 text-green">● now</span>}
                {j.dates}
              </span>
            </div>
            <div className="mt-0.5 text-[12px] text-faint">{j.place}</div>
            <ul className="mt-3 space-y-2">
              <Bullet text={j.bullets[0]} />
            </ul>
            {j.bullets.length > 1 && (
              <>
                <div
                  id={`job-${j.org}`}
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${open.has(j.org) ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                >
                  <ul className="space-y-2 overflow-hidden" inert={!open.has(j.org)}>
                    {j.bullets.slice(1).map((b) => (
                      <Bullet key={b} text={b} className="first:mt-2" />
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(j.org)}
                  aria-expanded={open.has(j.org)}
                  aria-controls={`job-${j.org}`}
                  className="mt-2 flex cursor-pointer items-center gap-1.5 text-[12px] text-muted hover:text-blue"
                >
                  <span className={`inline-block transition-transform duration-200 ${open.has(j.org) ? 'rotate-90' : ''}`}>▸</span>
                  {open.has(j.org) ? 'less' : `${j.bullets.length - 1} more`}
                </button>
              </>
            )}
          </li>
        ))}
      </ol>
    </Section>
  )
}

function Bullet({ text, className = '' }: { text: string; className?: string }) {
  return (
    <li className={`flex gap-2.5 text-[13px] leading-relaxed text-fg-dim ${className}`}>
      <span className="select-none text-faint">-</span>
      <span>{text}</span>
    </li>
  )
}

function Contributions() {
  return (
    <Section>
      <Prompt cmd="git log" arg="--author=iverson --upstream" />
      <ul className="divide-y divide-line rounded-[4px] border border-line">
        {contributions.map((c) => (
          <li key={c.href}>
            <a href={c.href} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-4 px-4 py-3 text-[13px] hover:bg-surface">
              <span className="min-w-0">
                <span className="text-blue">{c.repo}</span>
                <span className="block truncate text-fg-dim sm:inline sm:pl-3">{c.title}</span>
              </span>
              <span className={c.status === 'merged' ? 'text-purple' : 'text-green'}>{c.status}</span>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  )
}

function Skills() {
  return (
    <Section>
      <Prompt cmd="cat" arg="skills.toml" />
      <div className="space-y-3 rounded-[4px] border border-line bg-surface p-5 text-[13px]">
        {skills.map((g, i) => (
          <div key={g.group} className="flex flex-col gap-1.5 sm:flex-row sm:gap-3">
            <span className="w-[92px] shrink-0 pt-[3px] text-amber">{g.group}</span>
            <div className="flex flex-wrap gap-1.5">
              {g.items.map((s) => (
                <Tag key={s} color={accentFor(i)}>
                  {s}
                </Tag>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

function Reef() {
  return (
    <Section>
      <Prompt cmd="./reef" arg="--boids" right={<span className="hidden text-[11px] text-muted sm:inline">hover to scatter · click to splash</span>} />
      <div className="overflow-hidden rounded-[4px] border border-line bg-surface">
        <Ocean />
      </div>
      <p className="mt-2 text-[11.5px] text-muted">
        a nod to my time at scripps tracking humpbacks · flocking from separation, alignment, and cohesion
      </p>
    </Section>
  )
}

function About() {
  return (
    <Section>
      <Prompt cmd="cat" arg="about.md" />
      <div className="space-y-4 border-l-2 border-line-strong pl-5 text-[13.5px] leading-[1.8] text-fg-dim">
        {about.map((p) => (
          <p key={p.slice(0, 20)}>{p}</p>
        ))}
      </div>
    </Section>
  )
}

function Education() {
  return (
    <Section>
      <Prompt cmd="cat" arg="education.txt" />
      <div className="grid gap-4 sm:grid-cols-2">
        {education.map((e) => (
          <div key={e.school} className="rounded-[4px] border border-line p-5">
            <div className="text-[12px] text-muted">{e.dates.toLowerCase()}</div>
            <div className="mt-2 text-[14px] text-fg">{e.degree}</div>
            <div className="mt-0.5 text-[13px] text-blue">{e.school}</div>
            <p className="mt-3 text-[12.5px] leading-relaxed text-muted">{e.note}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}

function Writing() {
  return (
    <Section>
      <Prompt
        cmd="ls"
        arg="writing/"
        right={
          <Link viewTransition to="/writing" className="text-[12px] text-muted hover:text-blue">
            all writing →
          </Link>
        }
      />
      <ul className="space-y-3">
        {writing.slice(0, 3).map((a) => (
          <li key={a.href}>
            <a href={a.href} target="_blank" rel="noreferrer" className="group block rounded-[4px] border border-line p-5 transition-colors hover:border-line-strong hover:bg-surface">
              <div className="text-[12px] text-muted">{formatMonth(a.date)}</div>
              <h3 className="mt-1.5 text-[15px] text-fg group-hover:text-blue">{a.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">{a.summary}</p>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  )
}

function Contact() {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  function send(e: FormEvent) {
    e.preventDefault()
    const q = new URLSearchParams({ subject: subject || 'Hello from your portfolio', body })
    window.location.href = `mailto:${profile.email}?${q.toString().replace(/\+/g, '%20')}`
  }

  const row = 'flex items-center gap-3 border-b border-line px-4 py-2.5'
  return (
    <Section>
      <Prompt cmd="./contact.sh" id="contact" />
      <form onSubmit={send} className="rounded-[4px] border border-line bg-surface text-[13px]">
        <div className={row}>
          <span className="w-[64px] shrink-0 text-amber">to:</span>
          <span className="truncate text-fg">{profile.email}</span>
        </div>
        <label className={row}>
          <span className="w-[64px] shrink-0 text-amber">subject:</span>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="software engineering role at …"
            className="min-w-0 flex-1 bg-transparent text-fg outline-none placeholder:text-faint"
          />
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          aria-label="Message"
          placeholder="Hi Iverson, …"
          className="block w-full resize-none bg-transparent px-4 py-3 leading-relaxed text-fg outline-none placeholder:text-faint"
        />
        <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
          <span className="text-[11.5px] text-muted">opens in your mail app</span>
          <button type="submit" className="h-8 cursor-pointer rounded-[3px] border border-blue/50 bg-blue/10 px-4 text-[12.5px] text-blue hover:border-blue">
            send ↵
          </button>
        </div>
      </form>
    </Section>
  )
}
