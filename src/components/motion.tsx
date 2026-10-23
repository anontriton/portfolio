import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject, type SyntheticEvent } from 'react'

// Small hand-rolled takes on beUI's text scramble, rolling number, and
// shared-layout highlight (beui.dev/components/motion), sized for this site.

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// True once the element has scrolled into view (same margin as Section).
export function useSeen(ref: RefObject<Element | null>) {
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        setSeen(true)
        io.disconnect()
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(ref.current!)
    return () => io.disconnect()
  }, [ref])
  return seen
}

// ASCII only, so every glyph is JetBrains Mono's width and nothing shifts.
const GLYPHS = '!<>-_\\/[]{}=+*^?#$%&@01'
const glyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
const scrambled = (text: string) => text.replace(/\S/g, glyph)

// Text that decodes left to right once `run` turns true. Until then it shows
// noise of the same length; spaces stay put so word shapes read early.
export function useScramble(text: string, run: boolean) {
  const [out, setOut] = useState(() => (reducedMotion() ? text : scrambled(text)))
  useEffect(() => {
    if (!run || reducedMotion()) return setOut(text)
    const start = performance.now()
    const settleAt = (i: number) => 180 + i * 32
    let frame = 0
    let last = 0
    const tick = (now: number) => {
      const t = now - start
      // reshuffle the unresolved tail every ~45ms, not every frame
      if (now - last > 45) {
        last = now
        setOut([...text].map((c, i) => (c === ' ' || t >= settleAt(i) ? c : glyph())).join(''))
      }
      if (t < settleAt(text.length - 1)) frame = requestAnimationFrame(tick)
      else setOut(text)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [text, run])
  return out
}

// Stat values like "373×", "~94%" or "129 MB": the number rolls into place
// digit by digit, the rest stays static. Anything else ("v0.0.34") renders as is.
export function Ticker({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const seen = useSeen(ref)
  const m = value.match(/^(~?)(\d+(?:\.\d+)?)(.*)$/)
  if (!m) return <span ref={ref}>{value}</span>
  const [, pre, num, post] = m
  const digits = [...num]
  return (
    <span ref={ref}>
      <span className="sr-only">{value}</span>
      <span aria-hidden className="inline-flex whitespace-pre leading-none">
        {pre}
        {digits.map((c, i) =>
          c === '.' ? (
            <span key={i}>.</span>
          ) : (
            <span key={i} className="h-[1em] overflow-hidden">
              {/* two runs of 0–9, so every column spins at least once */}
              <span
                className="flex flex-col transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ transform: `translateY(-${seen ? 10 + Number(c) : 0}em)`, transitionDelay: `${(digits.length - 1 - i) * 70}ms` }}
              >
                {Array.from({ length: 20 }, (_, d) => (
                  <span key={d} className="h-[1em]">
                    {d % 10}
                  </span>
                ))}
              </span>
            </span>
          ),
        )}
        {post}
      </span>
    </span>
  )
}

type Box = { x: number; y: number; w: number; h: number }

// A highlight that glides between the [data-glide] children of a container
// on hover and focus. With `rest`, it settles on the child matching that
// selector when the pointer leaves; otherwise it fades out. Re-run the resting
// placement by changing `key`. The container must be position: relative.
export function useGlide<T extends HTMLElement>(rest?: string, key?: unknown) {
  const ref = useRef<T>(null)
  const [state, setState] = useState<{ box: Box | null; on: boolean; jump: boolean }>({ box: null, on: false, jump: true })

  const place = (el: HTMLElement | null) =>
    setState((s) =>
      el
        ? // appearing from nothing snaps into place; moving between items glides
          { box: { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight }, on: true, jump: !s.on }
        : { ...s, on: false },
    )
  const settle = () => place(rest ? ref.current?.querySelector<HTMLElement>(rest) ?? null : null)
  const target = (e: SyntheticEvent) => {
    const el = (e.target as Element).closest<HTMLElement>('[data-glide]')
    if (el && ref.current?.contains(el)) place(el)
  }

  useLayoutEffect(settle, [key])
  useEffect(() => {
    const ro = new ResizeObserver(() => settle())
    ro.observe(ref.current!)
    return () => ro.disconnect()
  }, [])

  const { box, on, jump } = state
  const style: CSSProperties = box
    ? {
        width: box.w,
        height: box.h,
        transform: `translate(${box.x}px, ${box.y}px)`,
        opacity: on ? 1 : 0,
        transition: jump ? 'opacity 150ms' : 'transform 260ms cubic-bezier(0.22,1,0.36,1), width 260ms, height 260ms, opacity 150ms',
      }
    : { opacity: 0 }

  return {
    ref,
    handlers: {
      onPointerOver: target,
      onFocus: target,
      onPointerLeave: settle,
      onBlur: settle,
    },
    style,
  }
}
