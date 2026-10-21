import { createContext, useContext, useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { profile, projects } from '../data'
import { IconFile, IconGithub, IconLinkedin, IconMail } from './ui'

const TldrContext = createContext<() => void>(() => {})
export const useTldr = () => useContext(TldrContext)

export default function Layout() {
  const [tldrOpen, setTldrOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <TldrContext.Provider value={() => setTldrOpen(true)}>
      <div className="scanlines" aria-hidden />
      <Nav />
      <main className="mx-auto w-full max-w-[860px] px-4 pb-16 sm:px-6">
        <Outlet />
      </main>
      <Footer />
      {tldrOpen && <Tldr onClose={() => setTldrOpen(false)} />}
    </TldrContext.Provider>
  )
}

function Nav() {
  const { pathname } = useLocation()
  const path = pathname === '/' ? '~' : '~' + pathname.replace(/\/$/, '')
  const link = ({ isActive }: { isActive: boolean }) =>
    `transition-colors hover:text-fg ${isActive ? 'text-blue' : 'text-muted'}`

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <nav className="mx-auto flex h-12 max-w-[860px] items-center justify-between gap-4 px-4 text-[13px] sm:px-6">
        <NavLink to="/" className="min-w-0 truncate text-fg hover:text-blue">
          <span className="text-green">{profile.handle}</span>
          <span className="text-muted">@lai</span>
          <span className="hidden text-muted sm:inline">:</span>
          <span className="hidden text-blue sm:inline">{path}</span>
        </NavLink>
        <div className="flex shrink-0 items-center gap-4 sm:gap-5">
          <NavLink to="/projects" className={link}>
            projects
          </NavLink>
          <NavLink to="/writing" className={link}>
            writing
          </NavLink>
          <a
            href={profile.resume}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-[3px] border border-blue/40 px-2 py-1 text-blue transition-colors hover:border-blue hover:bg-blue/10"
          >
            <IconFile />
            resume
          </a>
        </div>
      </nav>
    </header>
  )
}

function Footer() {
  const [time, setTime] = useState(() => sdTime())
  useEffect(() => {
    const id = setInterval(() => setTime(sdTime()), 15_000)
    return () => clearInterval(id)
  }, [])

  return (
    <footer className="mx-auto flex max-w-[860px] flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-6 text-[12px] text-muted sm:px-6">
      <span>
        {time} PT · {profile.location.toLowerCase()}
      </span>
      <span className="flex items-center gap-4">
        <a href={profile.sourceRepo} target="_blank" rel="noreferrer" className="hover:text-fg">
          view source
        </a>
        <a href="#top" onClick={() => window.scrollTo(0, 0)} className="hover:text-fg">
          top ↑
        </a>
      </span>
    </footer>
  )
}

function sdTime() {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: profile.timezone,
  })
}

function Tldr({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const featured = projects.filter((p) => p.featured)

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-bg/80 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Recruiter summary"
    >
      <div
        className="max-h-[90vh] w-full max-w-[480px] overflow-y-auto rounded-[4px] border border-line-strong bg-surface text-[13px] shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <span className="text-muted">
            <span className="text-green">$</span> cat tl;dr.txt
          </span>
          <button onClick={onClose} className="cursor-pointer text-muted hover:text-fg" aria-label="Close">
            esc ✕
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          <div>
            <div className="text-[17px] font-medium text-fg">{profile.name}</div>
            <div className="mt-1 text-muted">
              {profile.title.toLowerCase()} · {profile.focus.toLowerCase()}
            </div>
          </div>

          <dl className="grid grid-cols-[88px_1fr] gap-x-3 gap-y-1.5">
            <dt className="text-muted">education</dt>
            <dd className="text-fg-dim">{profile.degree}</dd>
            <dt className="text-muted">location</dt>
            <dd className="text-fg-dim">{profile.location}</dd>
            <dt className="text-muted">status</dt>
            <dd className="text-green">{profile.status}</dd>
            <dt className="text-muted">current</dt>
            <dd className="text-fg-dim">freelance SWE, Angular / Node / MongoDB on AWS</dd>
          </dl>

          <div>
            <div className="mb-2 text-[11px] uppercase tracking-wider text-faint">notable work</div>
            <ul className="space-y-2">
              {featured.map((p) => (
                <li key={p.slug} className="leading-snug">
                  <span className="text-blue">▸ {p.name}</span>
                  <span className="text-muted"> — {p.stats?.[0] ? `${p.stats[0].value} ${p.stats[0].label}` : p.stack[0]}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-2 text-[11px] uppercase tracking-wider text-faint">strongest in</div>
            <div className="text-fg-dim">C · C++ · Python · TypeScript · Linux · PyTorch · performance work</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-line px-5 py-4">
          <a href={profile.resume} target="_blank" rel="noreferrer" className="tl-btn text-blue">
            <IconFile /> resume
          </a>
          <a href={`mailto:${profile.email}`} className="tl-btn">
            <IconMail /> email
          </a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer" className="tl-btn">
            <IconLinkedin /> linkedin
          </a>
          <a href={profile.github} target="_blank" rel="noreferrer" className="tl-btn">
            <IconGithub /> github
          </a>
        </div>
      </div>
    </div>
  )
}
