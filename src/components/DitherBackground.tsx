import { useEffect, useRef } from 'react'
import { DitherEngine } from '../vendor/stacked-dither'

// Catppuccin ramp for stacked-dither (github.com/stackedlol/stacked-dither):
// starts on the page's base colour, climbs through blue, and tops out at
// lavender/text for the ripple crests.
const MOCHA = ['#1e1e2e', '#232438', '#2a2d47', '#33395a', '#3f4a75', '#5268a0', '#6b8fd4', '#89b4fa', '#b4befe', '#cdd6f4']

// Full-window dither field behind the 404 page, which hides the shark
// backdrop while it's up (useOffMap in Layout).
export default function DitherBackground() {
  const ref = useRef<HTMLDivElement>(null)

  // A fresh canvas per engine: destroy() loses the WebGL context, and a canvas
  // hands that dead context back to the next engine (StrictMode remounts).
  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.className = 'block h-full w-full'
    ref.current!.append(canvas)
    const engine = new DitherEngine(canvas, { palette: MOCHA, cell: 3, speed: 0.8 })
    return () => {
      engine.destroy()
      canvas.remove()
    }
  }, [])

  // The scrim dims the field so the footer, which sits straight on it, stays
  // readable.
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-[5] h-dvh w-screen">
      <div ref={ref} className="absolute inset-0" />
      <div className="absolute inset-0 bg-bg/45" />
    </div>
  )
}
