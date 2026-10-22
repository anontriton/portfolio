import { useEffect, useRef, type ReactNode } from 'react'
import { Link as RouterLink } from 'react-router-dom'

const accents = ['text-blue', 'text-green', 'text-pink', 'text-amber', 'text-purple', 'text-teal', 'text-orange', 'text-lavender', 'text-red', 'text-cyan']

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

// Fades in the first time it scrolls into view (see .reveal in index.css).
export function Section({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current!
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        el.dataset.shown = ''
        io.disconnect()
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <section ref={ref} className={`reveal mt-16 sm:mt-20 ${className}`}>
      {children}
    </section>
  )
}

export function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-[3px] border border-green/40 px-1.5 py-[2px] text-[10.5px] leading-none text-green">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green" aria-hidden />
      live
    </span>
  )
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
      <RouterLink to={href} viewTransition className={cls}>
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

export const IconGithub = ({ size = 15 }: { size?: number }) => (
  <svg {...svg} width={size} height={size}>
    <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
  </svg>
)
export const IconLinkedin = ({ size = 15 }: { size?: number }) => (
  <svg {...svg} width={size} height={size}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
  </svg>
)
export const IconKeyboard = ({ size = 15 }: { size?: number }) => (
  <svg {...svg} width={size} height={size}>
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" />
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
