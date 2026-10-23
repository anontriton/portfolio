import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { posts } from '../blog'
import { profile, projects } from '../data'

// A tiny fake shell. Input never leaves this component: it's matched against
// a fixed command list, printed back as plain text (React escapes it), and the
// only side effects are navigate() to routes from the list below and opening
// the resume, so there's nothing for typed input to inject into.
const ROUTES = ['/', '/projects', '/blog', ...projects.map((p) => `/projects/${p.slug}`), ...posts.map((p) => `/blog/${p.slug}`)]

type Line = { cmd?: string; out: ReactNode }

export default function NotFound() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [lines, setLines] = useState<Line[]>([])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [back, setBack] = useState(-1)
  const field = useRef<HTMLInputElement>(null)
  const guess = closest(pathname)

  // Focus on desktop only; on phones it would throw up the keyboard unasked.
  useEffect(() => {
    if (window.matchMedia('(pointer: fine)').matches) field.current?.focus({ preventScroll: true })
  }, [])

  function run(raw: string) {
    const [cmd = '', ...args] = raw.trim().split(/\s+/)
    const arg = args.join(' ')
    const print = (out: ReactNode) => setLines((l) => [...l, { cmd: raw, out }])

    switch (cmd) {
      case '':
        return print(null)
      case 'help':
        return print(
          <div className="grid grid-cols-[116px_1fr] gap-x-3 text-fg-dim">
            {HELP.map(([c, d]) => (
              <div key={c} className="contents">
                <span className="text-blue">{c}</span>
                <span className="text-muted">{d}</span>
              </div>
            ))}
          </div>,
        )
      case 'ls':
        return print(list(arg))
      case 'cd': {
        const to = resolve(arg)
        if (to && ROUTES.includes(to)) return navigate(to, { viewTransition: true })
        return print(<span className="text-red">bash: cd: {arg}: No such file or directory</span>)
      }
      case 'pwd':
        return print(pathname + '  (allegedly)')
      case 'whoami':
        return print('guest')
      case 'open':
        if (/^(~\/|\/)?resume(\.pdf)?$/.test(arg)) {
          window.open(profile.resume, '_blank', 'noreferrer')
          return print('opening resume.pdf…')
        }
        return print(<span className="text-red">open: {arg || 'missing operand'}: not something I can open (try resume.pdf)</span>)
      case 'clear':
        return setLines([])
      case 'exit':
        return navigate('/', { viewTransition: true })
      case 'sudo':
        return print(<span className="text-red">guest is not in the sudoers file. This incident will be reported.</span>)
      case 'rm':
        return print(<span className="text-red">rm: nice try</span>)
      default:
        return print(<span className="text-red">bash: {cmd}: command not found</span>)
    }
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      run(input)
      if (input.trim()) setHistory((h) => [input, ...h].slice(0, 50))
      setInput('')
      setBack(-1)
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      const i = Math.max(-1, Math.min(history.length - 1, back + (e.key === 'ArrowUp' ? 1 : -1)))
      setBack(i)
      setInput(i < 0 ? '' : history[i])
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      setLines([])
    }
  }

  return (
    <div className="pt-16 text-[13.5px]" onClick={() => window.getSelection()?.isCollapsed && field.current?.focus({ preventScroll: true })}>
      <div className="text-muted">
        <span className="text-green">$</span> cd {pathname}
      </div>
      <div className="mt-2 text-red">bash: cd: {pathname}: No such file or directory</div>
      {guess && (
        <div className="mt-2 text-muted">
          did you mean{' '}
          <Link viewTransition to={guess} className="text-blue hover:underline">
            cd {guess}
          </Link>
          ?
        </div>
      )}
      <div className="mt-2 text-muted">
        type <span className="text-fg-dim">help</span> for commands, or{' '}
        <Link viewTransition to="/" className="text-blue hover:underline">
          cd ~
        </Link>{' '}
        to go home.
      </div>

      <div className="mt-6 space-y-2" aria-live="polite">
        {lines.map((l, i) => (
          <div key={i}>
            <div className="text-muted">
              <span className="text-green">$</span> <span className="text-fg-dim">{l.cmd}</span>
            </div>
            {l.out && <div className="mt-1 break-words">{l.out}</div>}
          </div>
        ))}
      </div>

      <label className="mt-2 flex items-center gap-2 text-muted">
        <span className="text-green">$</span>
        <input
          ref={field}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          maxLength={120}
          aria-label="Terminal command, type help for a list"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          className="term-input min-w-0 flex-1 bg-transparent text-fg caret-blue"
        />
      </label>
    </div>
  )
}

const HELP = [
  ['ls [dir]', 'list pages (try ls projects)'],
  ['cd <dir>', 'go somewhere that exists'],
  ['open resume.pdf', 'open the resume'],
  ['pwd · whoami', 'where / who you are'],
  ['clear', 'clear the screen (ctrl+l)'],
  ['exit', 'back to the home page'],
] as const

// "~", "..", "/projects/", "./blog" and friends → a route path, or null.
function resolve(arg: string) {
  const p = arg.replace(/^~/, '').replace(/^\.\//, '').replace(/^\/+|\/+$/g, '')
  if (p === '' || p === '..') return '/'
  return '/' + p
}

function list(arg: string): ReactNode {
  const dir = resolve(arg)
  const entries =
    dir === '/'
      ? [
          ['projects/', 'text-blue'],
          ['blog/', 'text-blue'],
          ['resume.pdf', 'text-fg-dim'],
        ]
      : dir === '/projects'
        ? projects.map((p) => [p.slug + '/', 'text-blue'])
        : dir === '/blog'
          ? posts.map((p) => [p.slug + '.md', 'text-fg-dim'])
          : null
  if (!entries) return <span className="text-red">ls: cannot access '{arg}': No such file or directory</span>
  if (entries.length === 0) return <span className="text-faint">total 0</span>
  return (
    <div className="flex flex-wrap gap-x-5">
      {entries.map(([name, color]) => (
        <span key={name} className={color}>
          {name}
        </span>
      ))}
    </div>
  )
}

// The nearest real route by edit distance, if it's close enough to be a typo.
function closest(path: string) {
  const p = path.toLowerCase().replace(/\/+$/, '')
  let best: string | null = null
  let bestD = Infinity
  for (const r of ROUTES) {
    if (r === '/') continue
    const d = distance(p, r)
    if (d < bestD) [best, bestD] = [r, d]
  }
  return bestD <= Math.max(2, Math.floor((best?.length ?? 0) / 3)) ? best : null
}

function distance(a: string, b: string) {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    }
    prev = cur
  }
  return prev[b.length]
}
