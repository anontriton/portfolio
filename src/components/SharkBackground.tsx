import { useEffect, useRef } from 'react'
import { OceanEngine } from '../vendor/ascii-kanji-sharks/engine'

// Full-window kanji-shark backdrop (github.com/michikusa404/ascii-kanji-sharks).
// The canvas sits behind the page and ignores clicks; the engine listens on
// window, so fish still scatter from the cursor and clicks still splash.
// Dimmed with opacity, and further behind the content column (.shark-sea in
// index.css), so text on top stays readable.
export default function SharkBackground() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const engine = new OceanEngine(ref.current!)
    return () => engine.destroy()
  }, [])

  return <canvas ref={ref} aria-hidden className="shark-sea pointer-events-none fixed inset-0 -z-10 h-dvh w-screen bg-bg opacity-45" />
}
