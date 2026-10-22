import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { about, contributions, education, experience, neofetch, profile, projects, skills, type Job } from '../data'
import { useTldr } from '../components/Layout'
import ProjectCard from '../components/ProjectCard'
import ActivityGraph from '../components/ActivityGraph'
import AsciiPortrait from '../components/AsciiPortrait'
import {
  ActionButton,
  Button,
  IconFile,
  IconGithub,
  IconKeyboard,
  IconLinkedin,
  IconMail,
  IconPlay,
  LiveBadge,
  Prompt,
  Section,
  Tag,
  accentFor,
} from '../components/ui'

const LOGO = String.raw`██╗██╗
██║██║
██║██║
██║██║
██║███████╗
╚═╝╚══════╝`

export default function Home() {
  // Unfeatured projects are only listed on /projects.
  const others = projects.slice(1).filter((p) => p.featured)

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
      <About />
      <Education />
      <Contact />
    </>
  )
}

function Hero() {
  const openTldr = useTldr()
  const info = useRef<HTMLDivElement>(null)
  const [infoHeight, setInfoHeight] = useState<number>()

  // The portrait is square, so sizing its width to the readout's height
  // lines the two columns up top and bottom.
  useEffect(() => {
    const el = info.current!
    const ro = new ResizeObserver(() => setInfoHeight(el.offsetHeight))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const logo = (
    <pre
      aria-hidden
      className="hidden shrink-0 select-none bg-gradient-to-b from-blue to-purple bg-clip-text text-[21px] leading-[1.12] text-transparent sm:block"
    >
      {LOGO}
    </pre>
  )
  // ANSI 0–7 over 8–15 (black red green yellow blue magenta cyan white), as
  // Catppuccin Mocha's terminal ports define them
  const swatches = [
    ['#45475a', '#f38ba8', '#a6e3a1', '#f9e2af', '#89b4fa', '#f5c2e7', '#94e2d5', '#bac2de'],
    ['#585b70', '#f37799', '#89d88b', '#ebd391', '#74a8fc', '#f2aede', '#6bd7ca', '#a6adc8'],
  ]

  return (
    <section className="relative pt-10 sm:pt-16">
      <h1 className="sr-only">{profile.name}, {profile.title}</h1>
      <a
        href="#contact"
        className="stamp absolute right-0 top-12 hidden rounded-[3px] border-2 border-green/60 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-green/80 hover:border-green hover:text-green sm:block"
      >
        open to work
      </a>
      <div className="text-[13px] text-muted">
        <span className="text-purple">{profile.handle}</span>
        <span className="text-muted">@</span>
        <span className="text-blue">{profile.host}</span>:<span className="text-teal">~</span>$ neofetch
      </div>

      <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-9">
        {profile.portrait ? (
          <div className="w-[220px] shrink-0 sm:w-[var(--portrait)]" style={{ '--portrait': `${infoHeight ?? 300}px` } as CSSProperties}>
            <AsciiPortrait src={profile.portrait} alt={`ASCII portrait of ${profile.name}`} fallback={logo} />
          </div>
        ) : (
          logo
        )}

        <div ref={info} className="min-w-0 flex-1 text-[14px] leading-[1.6]">
          <div>
            <span className="font-medium text-purple">{profile.handle}</span>
            <span className="text-muted">@</span>
            <span className="font-medium text-blue">{profile.host}</span>
          </div>
          <div className="text-faint" aria-hidden>
            {'─'.repeat(profile.handle.length + profile.host.length + 1)}
          </div>
          <dl className="grid grid-cols-[96px_1fr] gap-x-2 sm:grid-cols-[104px_1fr]">
            {neofetch.map((f) => (
              <div key={f.key} className="contents">
                <dt className="text-blue">{f.key}</dt>
                <dd className={f.accent ?? 'text-fg-dim'}>{f.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-3" aria-hidden>
            {swatches.map((row) => (
              <div key={row[0]} className="flex">
                {row.map((c) => (
                  <span key={c} className="h-3.5 w-5" style={{ background: c }} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-9 text-[14.5px] leading-relaxed text-fg-dim">
        {profile.pitch}
        <span className="cursor" />
      </p>
      {profile.current && (
        <p className="mt-3 text-[13.5px] text-muted">
          <span className="text-green">▸</span> building <span className="font-medium text-amber">{profile.current.name}</span> —{' '}
          {profile.current.note}
        </p>
      )}

      {/* buttons and icons share a row on desktop; icons drop below on mobile */}
      <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button href={profile.resume} primary icon={<IconFile />}>
            resume
          </Button>
          <Button href={`mailto:${profile.email}`} icon={<IconMail />}>
            email
          </Button>
          <ActionButton onClick={openTldr}>tl;dr</ActionButton>
        </div>
        <span className="mx-1.5 hidden h-6 w-px bg-line sm:block" />
        <div className="-ml-1.5 flex items-center gap-2 sm:ml-0">
          <a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub" title="github" className="p-1.5 text-muted transition-colors hover:text-fg">
            <IconGithub size={21} />
          </a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" title="linkedin" className="p-1.5 text-muted transition-colors hover:text-blue">
            <IconLinkedin size={21} />
          </a>
          <a href={profile.monkeytype} target="_blank" rel="noreferrer" aria-label="Monkeytype" title="monkeytype" className="p-1.5 text-muted transition-colors hover:text-amber">
            <IconKeyboard size={22} />
          </a>
        </div>
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

const jobDot: Record<string, string> = { engineering: 'bg-blue', research: 'bg-green', other: 'bg-orange' }

function Experience() {
  const main = experience.filter((j) => j.kind !== 'other')
  const more = experience.filter((j) => j.kind === 'other')
  const [showMore, setShowMore] = useState(false)
  // The current role starts expanded; the rest show their first bullet.
  const [open, setOpen] = useState(() => new Set(main.filter((j) => j.current).map((j) => j.org)))
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
            {(['engineering', 'research', 'other'] as const).map((k) => (
              <span key={k} className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${jobDot[k]}`} /> {k}
              </span>
            ))}
          </span>
        }
      />
      <ol className="relative ml-[3px] border-l border-line">
        {main.map((j) => (
          <JobEntry key={j.org} job={j} open={open.has(j.org)} onToggle={() => toggle(j.org)} />
        ))}
      </ol>

      {more.length > 0 && (
        <div className="mt-8">
          <button
            type="button"
            onClick={() => setShowMore((v) => !v)}
            aria-expanded={showMore}
            aria-controls="more-experience"
            className="flex cursor-pointer items-center gap-2 text-[12.5px] text-muted hover:text-orange"
          >
            <span className={`inline-block transition-transform duration-200 ${showMore ? 'rotate-90' : ''}`}>▸</span>
            {showMore ? 'hide' : `${more.length} more roles`}
            <span className="text-faint">· sales, management, hospitality, photography, campus sustainability</span>
          </button>
          <div
            id="more-experience"
            className={`grid transition-[grid-template-rows] duration-500 ease-out ${showMore ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
          >
            <div className="overflow-hidden" inert={!showMore}>
              <ol className="relative ml-[3px] mt-6 border-l border-line">
                {more.map((j) => (
                  <JobEntry key={j.org} job={j} open />
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </Section>
  )
}

// One timeline entry. Without onToggle every bullet shows; with it, the
// first bullet shows and the rest fold behind a "N more" toggle.
function JobEntry({ job: j, open, onToggle }: { job: Job; open: boolean; onToggle?: () => void }) {
  const id = `job-${j.org.toLowerCase().replace(/\W+/g, '-')}`
  const folded = onToggle && j.bullets.length > 1
  return (
    <li className="relative pb-9 pl-6 last:pb-0">
      <span className={`absolute -left-[4px] top-[7px] h-[7px] w-[7px] rounded-full ${jobDot[j.kind]}`} />
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
        {(folded ? j.bullets.slice(0, 1) : j.bullets).map((b) => (
          <Bullet key={b} text={b} />
        ))}
      </ul>
      {folded && (
        <>
          <div id={id} className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
            <ul className="space-y-2 overflow-hidden" inert={!open}>
              {j.bullets.slice(1).map((b) => (
                <Bullet key={b} text={b} className="first:mt-2" />
              ))}
            </ul>
          </div>
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-controls={id}
            className="mt-2 flex cursor-pointer items-center gap-1.5 text-[12px] text-muted hover:text-blue"
          >
            <span className={`inline-block transition-transform duration-200 ${open ? 'rotate-90' : ''}`}>▸</span>
            {open ? 'less' : `${j.bullets.length - 1} more`}
          </button>
        </>
      )}
    </li>
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
          <div key={e.school} className="rounded-[4px] border border-line bg-surface p-5">
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

function Contact() {
  const [from, setFrom] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [website, setWebsite] = useState('') // honeypot: hidden from people, filled by bots
  const [status, setStatus] = useState<{ state: 'idle' | 'sending' | 'sent' } | { state: 'error'; message: string }>({ state: 'idle' })
  const openedAt = useRef(Date.now())

  const mailto = `mailto:${profile.email}?${new URLSearchParams({ subject: subject || 'Hello from your portfolio', body })
    .toString()
    .replace(/\+/g, '%20')}`

  async function send(e: FormEvent) {
    e.preventDefault()
    setStatus({ state: 'sending' })
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: from, subject, message: body, website, elapsed: Date.now() - openedAt.current }),
      })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) throw new Error(data.error || 'could not send right now')
      setStatus({ state: 'sent' })
      setSubject('')
      setBody('')
    } catch (err) {
      setStatus({ state: 'error', message: err instanceof Error ? err.message : 'could not send right now' })
    }
  }

  const row = 'flex items-center gap-3 border-b border-line px-4 py-2.5'
  const input = 'min-w-0 flex-1 bg-transparent text-fg outline-none placeholder:text-faint'
  return (
    <Section>
      <Prompt cmd="./contact.sh" id="contact" />
      <form onSubmit={send} className="rounded-[4px] border border-line bg-surface text-[13px]">
        <div className={row}>
          <span className="w-[64px] shrink-0 text-amber">to:</span>
          <span className="truncate text-fg">{profile.email}</span>
        </div>
        <label className={row}>
          <span className="w-[64px] shrink-0 text-amber">from:</span>
          <input type="email" required value={from} onChange={(e) => setFrom(e.target.value)} placeholder="you@example.com" autoComplete="email" className={input} />
        </label>
        <label className={row}>
          <span className="w-[64px] shrink-0 text-amber">subject:</span>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="software engineering role at …" maxLength={150} className={input} />
        </label>
        <label className="absolute -left-[9999px]" aria-hidden>
          website
          <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={5}
          maxLength={5000}
          aria-label="Message"
          placeholder="Hi Iverson, …"
          className="block w-full resize-none bg-transparent px-4 py-3 leading-relaxed text-fg outline-none placeholder:text-faint"
        />
        <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
          <span className="text-[11.5px] text-muted" role="status">
            {status.state === 'sent' && <span className="text-green">sent ✓ — I&apos;ll reply to {from}</span>}
            {status.state === 'error' && (
              <span className="text-red">
                {status.message} ·{' '}
                <a href={mailto} className="underline hover:text-fg">
                  use your mail app
                </a>
              </span>
            )}
            {status.state === 'sending' && 'sending…'}
            {status.state === 'idle' && 'goes straight to my inbox'}
          </span>
          <button
            type="submit"
            disabled={status.state === 'sending'}
            className="h-8 shrink-0 cursor-pointer rounded-[3px] border border-blue/50 bg-blue/10 px-4 text-[12.5px] text-blue hover:border-blue disabled:cursor-wait disabled:opacity-60"
          >
            send ↵
          </button>
        </div>
      </form>
    </Section>
  )
}
