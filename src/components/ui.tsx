import type { ReactNode } from 'react'
import { Link as RouterLink } from 'react-router-dom'

const accents = ['text-blue', 'text-green', 'text-amber', 'text-purple', 'text-cyan', 'text-orange', 'text-red']

export function accentFor(i: number) {
  return accents[i % accents.length]
}

// "$ cat experience.log" style section header
export function Prompt({ cmd, arg, right, id }: { cmd: string; arg?: string; right?: ReactNode; id?: string }) {
  return (
    <div id={id} className="mb-5 flex scroll-mt-20 items-baseline justify-between gap-4 text-[13px]">
      <h2 className="font-normal text-muted">
        <span className="text-green">$</span> <span className="text-fg-dim">{cmd}</span>
        {arg && <span className="text-blue"> {arg}</span>}
      </h2>
      {right}
    </div>
  )
}

export function Section({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`mt-16 sm:mt-20 ${className}`}>{children}</section>
}

export function Tag({ children, color = 'text-fg-dim' }: { children: ReactNode; color?: string }) {
  return (
    <span className={`inline-flex items-center rounded-[3px] border border-line bg-surface px-2 py-[3px] text-[11.5px] leading-none ${color}`}>
      {children}
    </span>
  )
}

type ButtonProps = {
  href: string
  children: ReactNode
  primary?: boolean
  icon?: ReactNode
  download?: boolean
}

const btnBase =
  'inline-flex h-8 items-center gap-2 rounded-[3px] border px-3 text-[12.5px] transition-colors duration-150'
const btnPrimary = 'border-blue/50 bg-blue/10 text-blue hover:border-blue hover:bg-blue/15'
const btnPlain = 'border-line-strong text-fg-dim hover:border-muted hover:text-fg'

export function Button({ href, children, primary, icon, download }: ButtonProps) {
  const cls = `${btnBase} ${primary ? btnPrimary : btnPlain}`
  if (href.startsWith('/') && !download && !href.endsWith('.pdf')) {
    return (
      <RouterLink to={href} className={cls}>
        {icon}
        {children}
      </RouterLink>
    )
  }
  const external = href.startsWith('http')
  return (
    <a
      href={href}
      className={cls}
      {...(external || href.endsWith('.pdf') ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      {icon}
      {children}
      {external && <IconArrow />}
    </a>
  )
}

export function ActionButton({ onClick, children, icon }: { onClick: () => void; children: ReactNode; icon?: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`${btnBase} ${btnPlain} cursor-pointer`}>
      {icon}
      {children}
    </button>
  )
}

export function formatMonth(date: string) {
  const d = new Date(date + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toLowerCase()
}

/* icons — 16px, stroke-based */
const svg = {
  width: 15,
  height: 15,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export const IconGithub = () => (
  <svg {...svg}>
    <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
  </svg>
)
export const IconLinkedin = () => (
  <svg {...svg}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
  </svg>
)
export const IconMail = () => (
  <svg {...svg}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 6L2 7" />
  </svg>
)
export const IconFile = () => (
  <svg {...svg}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6M8 13h8M8 17h5" />
  </svg>
)
export const IconPlay = () => (
  <svg {...svg}>
    <path d="m6 4 14 8-14 8z" />
  </svg>
)
export const IconArrow = () => (
  <svg {...svg} width={11} height={11} className="opacity-60">
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
)
export const IconChevron = () => (
  <svg {...svg} width={13} height={13}>
    <path d="m9 18 6-6-6-6" />
  </svg>
)
