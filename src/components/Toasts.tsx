import { createContext, useCallback, useContext, useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'

// Stacked toasts after beUI's animated toast stack: newest in front, older
// ones tucked behind, fanned out on hover, swipe sideways to dismiss.
// Labelled like systemd boot lines.

type Tone = 'ok' | 'fail' | 'info'
type Toast = { id: number; tone: Tone; text: string; detail?: string; leaving?: boolean }

const label: Record<Tone, [string, string]> = {
  ok: ['  OK  ', 'text-green'],
  fail: ['FAILED', 'text-red'],
  info: [' INFO ', 'text-blue'],
}

const ToastContext = createContext<(t: Omit<Toast, 'id' | 'leaving'>) => void>(() => {})
export const useToast = () => useContext(ToastContext)

let seq = 0
const LIFETIME = 4500
const GAP = 8

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [heights, setHeights] = useState<Record<number, number>>({})
  const [hover, setHover] = useState(false)

  const push = useCallback((t: Omit<Toast, 'id' | 'leaving'>) => setToasts((ts) => [...ts, { ...t, id: ++seq }].slice(-5)), [])
  const dismiss = useCallback((id: number) => {
    setToasts((ts) => ts.map((t) => (t.id === id ? { ...t, leaving: true } : t)))
    setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 220)
  }, [])
  const measure = useCallback((id: number, h: number) => setHeights((hs) => (hs[id] === h ? hs : { ...hs, [id]: h })), [])

  // once the last toast goes, the stack collapses for the next one
  useEffect(() => {
    if (toasts.length === 0) setHover(false)
  }, [toasts.length])

  const live = toasts.filter((t) => !t.leaving)
  return (
    <ToastContext.Provider value={push}>
      {children}
      <section
        aria-label="Notifications"
        aria-live="polite"
        className="fixed inset-x-4 bottom-4 z-[70] sm:left-auto sm:right-6 sm:w-[340px]"
        // fanned out, the stack's box spans every toast so the gaps keep hover
        style={{ height: hover ? live.reduce((sum, t) => sum + (heights[t.id] ?? 0) + GAP, -GAP) : undefined }}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
      >
        {toasts.map((t) => {
          // 0 is the newest (a leaving toast's slot is ignored; it holds its last one)
          const k = Math.max(0, live.length - 1 - live.indexOf(t))
          const ahead = live.slice(live.length - k).reduce((sum, a) => sum + (heights[a.id] ?? 0) + GAP, 0)
          return (
            <ToastItem
              key={t.id}
              toast={t}
              depth={k}
              lift={hover ? ahead : k * 10}
              expanded={hover}
              paused={hover}
              onDismiss={dismiss}
              onMeasure={measure}
            />
          )
        })}
      </section>
    </ToastContext.Provider>
  )
}

function ToastItem({
  toast: t,
  depth,
  lift,
  expanded,
  paused,
  onDismiss,
  onMeasure,
}: {
  toast: Toast
  depth: number
  lift: number
  expanded: boolean
  paused: boolean
  onDismiss: (id: number) => void
  onMeasure: (id: number, h: number) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [entered, setEntered] = useState(false)
  const [drag, setDrag] = useState<{ x0: number; dx: number } | null>(null)
  const [flung, setFlung] = useState(0)
  const remaining = useRef(LIFETIME)
  const slot = useRef({ depth, lift })
  if (!t.leaving) slot.current = { depth, lift }

  // mount below the fold, then slide up on the next frame
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)))
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    const el = ref.current!
    const ro = new ResizeObserver(() => onMeasure(t.id, el.offsetHeight))
    ro.observe(el)
    return () => ro.disconnect()
  }, [t.id, onMeasure])

  // auto-dismiss, with the clock stopped while the stack is hovered
  useEffect(() => {
    if (paused || t.leaving) return
    const start = Date.now()
    const id = setTimeout(() => onDismiss(t.id), remaining.current)
    return () => {
      clearTimeout(id)
      remaining.current -= Date.now() - start
    }
  }, [paused, t.leaving, t.id, onDismiss])

  const down = (e: PointerEvent) => {
    if ((e.target as Element).closest('button')) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setDrag({ x0: e.clientX, dx: 0 })
  }
  const move = (e: PointerEvent) => drag && setDrag({ ...drag, dx: e.clientX - drag.x0 })
  const up = () => {
    if (!drag) return
    if (Math.abs(drag.dx) > 80) {
      setFlung(Math.sign(drag.dx))
      onDismiss(t.id)
    }
    setDrag(null)
  }

  const at = slot.current
  const hidden = !expanded && at.depth > 2
  const x = drag ? drag.dx : flung * 380
  const y = !entered ? 120 : -at.lift + (t.leaving && !flung ? 24 : 0)
  const scale = expanded ? 1 : 1 - at.depth * 0.05
  const [tag, color] = label[t.tone]

  return (
    <div
      ref={ref}
      role={t.tone === 'fail' ? 'alert' : 'status'}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      className="absolute inset-x-0 bottom-0 flex touch-pan-y select-none items-start gap-3 rounded-[4px] border border-line-strong bg-surface px-3.5 py-3 text-[12.5px] shadow-xl shadow-black/40"
      style={{
        zIndex: 10 - at.depth,
        transformOrigin: 'bottom center',
        transform: `translate(${x}px, ${y}px) scale(${scale})`,
        opacity: !entered || t.leaving || hidden ? 0 : drag ? 1 - Math.min(Math.abs(drag.dx) / 240, 0.6) : 1,
        transition: drag ? 'none' : 'transform 380ms cubic-bezier(0.22,1,0.36,1), opacity 220ms',
        pointerEvents: hidden || t.leaving ? 'none' : undefined,
      }}
    >
      <span className="shrink-0 whitespace-pre text-muted">
        [<span className={color}>{tag}</span>]
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-fg">{t.text}</div>
        {t.detail && <div className="mt-0.5 truncate text-muted">{t.detail}</div>}
      </div>
      <button type="button" onClick={() => onDismiss(t.id)} aria-label="Dismiss" className="shrink-0 cursor-pointer text-faint hover:text-fg">
        ✕
      </button>
    </div>
  )
}
