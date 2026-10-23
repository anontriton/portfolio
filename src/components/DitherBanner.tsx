import { useEffect, useRef, type ReactNode } from 'react'
import { DitherEngine } from '../vendor/stacked-dither'

// Catppuccin ramp for stacked-dither (github.com/stackedlol/stacked-dither):
// starts on the page's base colour so the panel sits flush, climbs through
// blue, and tops out at lavender/text for the ripple crests.
const MOCHA = ['#1e1e2e', '#232438', '#2a2d47', '#33395a', '#3f4a75', '#5268a0', '#6b8fd4', '#89b4fa', '#b4befe', '#cdd6f4']

// Bordered header panel with the dither field behind its content. The quiet
// well and the left-hand scrim keep the text over it readable; `seed` gives
// each page its own picture.
export default function DitherBanner({ seed = 0, children }: { seed?: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  // A fresh canvas per engine: destroy() loses the WebGL context, and a canvas
  // hands that dead context back to the next engine (StrictMode remounts,
  // moving between posts).
  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.className = 'block h-full w-full'
    ref.current!.append(canvas)
    const engine = new DitherEngine(canvas, { palette: MOCHA, cell: 3, speed: 0.8, well: 0.6, seed })
    return () => {
      engine.destroy()
      canvas.remove()
    }
  }, [seed])

  return (
    <div className="relative overflow-hidden rounded-[4px] border border-line">
      <div ref={ref} aria-hidden className="absolute inset-0" />
      <div className="relative bg-gradient-to-r from-bg/90 via-bg/65 to-bg/15 px-5 py-8 sm:px-7 sm:py-10">{children}</div>
    </div>
  )
}

// Stable per-string seed, so a post keeps its picture across visits.
export function seedFrom(s: string) {
  let h = 0
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0
  return (h % 1000) / 10
}
