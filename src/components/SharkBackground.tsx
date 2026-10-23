import { useEffect, useRef } from 'react'
import { OceanEngine, type SharkKind, type SharkSpec } from '../vendor/ascii-sharks'

// Relative odds of each kind filling a random slot. Classics and hammerheads
// (both kinds counted together) are equally common; the rest show up now and then.
const SHARK_WEIGHTS: [SharkKind, number][] = [
  ['classic', 4],
  ['hammerhead', 2],
  ['greathammer', 2],
  ['zebra', 1],
  ['tiger', 1],
  ['mako', 1],
  ['thresher', 1],
  ['nurse', 1],
]

const TOTAL_WEIGHT = SHARK_WEIGHTS.reduce((sum, [, w]) => sum + w, 0)

function pickKind(): SharkKind {
  let r = Math.random() * TOTAL_WEIGHT
  for (const [kind, w] of SHARK_WEIGHTS) {
    r -= w
    if (r < 0) return kind
  }
  return 'classic'
}

// Drawn once per page load: the biggest is always a classic and one is always a
// hammerhead, and the other two are left to the odds above.
function rollSharks(): SharkSpec[] {
  return [
    { kind: 'classic', size: 1 },
    { kind: Math.random() < 0.5 ? 'hammerhead' : 'greathammer', size: 0.84 },
    { kind: pickKind(), size: 0.77 },
    { kind: pickKind(), size: 0.7 },
  ]
}

// Full-window ascii-sharks backdrop (github.com/stackedlol/ascii-sharks).
// The canvas sits behind the page and ignores clicks; the engine listens on
// window, so fish still scatter from the cursor and clicks still splash.
// Dimmed with opacity, and further behind the content column (.shark-sea in
// index.css), so text on top stays readable.
export default function SharkBackground() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const engine = new OceanEngine(ref.current!, rollSharks())
    return () => engine.destroy()
  }, [])

  return <canvas ref={ref} aria-hidden className="shark-sea pointer-events-none fixed inset-0 -z-10 h-dvh w-screen bg-bg font-mono opacity-45" />
}
