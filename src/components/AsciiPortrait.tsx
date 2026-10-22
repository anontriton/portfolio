import { useEffect, useRef, useState, type ReactNode } from 'react'

// Draws a picture as dense one-colour ASCII on a canvas. Bright areas (skin)
// become heavy glyphs and dark areas (hair, eyes) light ones, so it reads like
// the picture on a dark page; a bright outline traces the silhouette so dark
// hair still has a shape. The backdrop is left blank.
//   1. tone — brightness, contrast-stretched so flat cartoon shading reads
//      as clean steps rather than mush
//   2. outline — a Sobel edge on the alpha mask, drawn on top like a pen
//   3. glyphs — tone picks from a ~60-step ramp; rows sit closer than the
//      font is tall, so strokes overlap into a dense, drawn texture
// Each glyph sits on a spring; the cursor pushes glyphs away and they settle.

// Ordered from lightest to heaviest. Starts at ':' so even the darkest parts
// of the subject keep a faint texture inside the silhouette.
const RAMP = ':;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$'
const COLS = 92
const CELL = 0.79 // cell width / height; tighter than the font so rows overlap
const LIGHT = 0.85 // brightness at or above this gets the heaviest glyph
const DARK = 0.18 // brightness at or below this gets the lightest
const RADIUS = 46 // px of cursor influence
const PUSH = 2600
const SPRING = 90
const DAMP = 11

type Glyph = { ch: string; alpha: number; hx: number; hy: number; ox: number; oy: number; vx: number; vy: number }

export default function AsciiPortrait({ src, alt, fallback }: { src: string; alt: string; fallback: ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const css = getComputedStyle(document.documentElement)
    const ink = css.getPropertyValue('--color-rosewater').trim() || '#f5e0dc'
    const accent = css.getPropertyValue('--color-blue').trim() || '#89b4fa'
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let glyphs: Glyph[] = []
    let cw = 0
    let chh = 0
    let raf = 0
    let last = 0
    const pointer = { x: 0, y: 0, active: false }
    const img = new Image()

    function build() {
      const width = canvas.clientWidth
      if (!width || !img.naturalWidth) return
      cw = width / COLS
      chh = cw / CELL
      const rows = Math.round(COLS * (img.naturalHeight / img.naturalWidth) * CELL)
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(rows * chh * dpr)
      canvas.style.height = `${rows * chh}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // glyph width fills the cell (mono glyphs are ~0.6 as wide as tall)
      ctx.font = `500 ${cw / 0.6}px 'JetBrains Mono', ui-monospace, monospace`
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'

      // Sample at 2× so lines land inside a cell rather than between cells.
      const sw = COLS * 2
      const sh = rows * 2
      const sample = document.createElement('canvas')
      sample.width = sw
      sample.height = sh
      const sctx = sample.getContext('2d', { willReadFrequently: true })!
      sctx.drawImage(img, 0, 0, sw, sh)
      const px = sctx.getImageData(0, 0, sw, sh).data
      const backdrop = keyBackdrop(px, sw, sh)

      const alpha = new Float32Array(sw * sh)
      const lum = new Float32Array(sw * sh)
      for (let i = 0; i < sw * sh; i++) {
        alpha[i] = backdrop[i] ? 0 : px[i * 4 + 3] / 255
        lum[i] = (0.2126 * px[i * 4] + 0.7152 * px[i * 4 + 1] + 0.0722 * px[i * 4 + 2]) / 255
      }

      const at = (f: Float32Array, x: number, y: number) => f[Math.min(sh - 1, Math.max(0, y)) * sw + Math.min(sw - 1, Math.max(0, x))]
      const sobel = (f: Float32Array, x: number, y: number) => {
        const gx = at(f, x + 1, y - 1) + 2 * at(f, x + 1, y) + at(f, x + 1, y + 1) - at(f, x - 1, y - 1) - 2 * at(f, x - 1, y) - at(f, x - 1, y + 1)
        const gy = at(f, x - 1, y + 1) + 2 * at(f, x, y + 1) + at(f, x + 1, y + 1) - at(f, x - 1, y - 1) - 2 * at(f, x, y - 1) - at(f, x + 1, y - 1)
        return Math.hypot(gx, gy)
      }
      const smooth = (t: number) => t * t * (3 - 2 * t)

      glyphs = []
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < COLS; c++) {
          let cover = 0
          let tone = 0
          let line = 0
          for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
            const x = c * 2 + dx
            const y = r * 2 + dy
            const a = at(alpha, x, y)
            cover += a / 4
            tone += (smooth(Math.min(1, Math.max(0, (at(lum, x, y) - DARK) / (LIGHT - DARK)))) * a) / 4
            // the silhouette, as an outline pen stroke
            const outline = Math.min(1, sobel(alpha, x, y) / 1.6)
            line = Math.max(line, outline)
          }
          if (cover < 0.3 && line < 0.5) continue
          const amount = Math.max(tone, line * 0.92)
          glyphs.push({
            ch: RAMP[Math.round(amount * (RAMP.length - 1))],
            alpha: 0.45 + 0.55 * amount,
            hx: (c + 0.5) * cw,
            hy: (r + 0.5) * chh,
            ox: 0,
            oy: 0,
            vx: 0,
            vy: 0,
          })
        }
      }
      draw()
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const g of glyphs) {
        const moved = Math.min(1, Math.hypot(g.ox, g.oy) / 10)
        ctx.globalAlpha = Math.max(g.alpha, moved)
        ctx.fillStyle = moved > 0.15 ? accent : ink
        ctx.fillText(g.ch, g.hx + g.ox, g.hy + g.oy)
      }
      ctx.globalAlpha = 1
    }

    // Returns true while anything is still moving.
    function step(dt: number) {
      let moving = false
      for (const g of glyphs) {
        let ax = -SPRING * g.ox - DAMP * g.vx
        let ay = -SPRING * g.oy - DAMP * g.vy
        if (pointer.active) {
          const dx = g.hx + g.ox - pointer.x
          const dy = g.hy + g.oy - pointer.y
          const d = Math.hypot(dx, dy)
          if (d < RADIUS && d > 0.01) {
            const f = PUSH * (1 - d / RADIUS) ** 2
            ax += (dx / d) * f
            ay += (dy / d) * f
          }
        }
        g.vx += ax * dt
        g.vy += ay * dt
        g.ox += g.vx * dt
        g.oy += g.vy * dt
        if (Math.abs(g.ox) + Math.abs(g.oy) + Math.abs(g.vx) + Math.abs(g.vy) > 0.05) moving = true
      }
      return moving || pointer.active
    }

    function frame(now: number) {
      const dt = Math.min(1 / 30, (now - last) / 1000)
      last = now
      const moving = step(dt)
      draw()
      raf = moving ? requestAnimationFrame(frame) : 0
    }

    function wake() {
      if (still || raf) return
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }

    function locate(e: PointerEvent) {
      const r = canvas.getBoundingClientRect()
      pointer.x = e.clientX - r.left
      pointer.y = e.clientY - r.top
    }
    const onMove = (e: PointerEvent) => {
      locate(e)
      pointer.active = true
      wake()
    }
    const onLeave = () => {
      pointer.active = false
    }
    // Taps on touch screens: a short burst instead of hover.
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return
      onMove(e)
      setTimeout(onLeave, 180)
    }

    img.onload = build
    img.onerror = () => setFailed(true)
    img.src = src
    document.fonts?.ready.then(build)
    const ro = new ResizeObserver(build)
    ro.observe(canvas)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerleave', onLeave)
    canvas.addEventListener('pointerdown', onDown)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('pointerdown', onDown)
    }
  }, [src])

  if (failed) return <>{fallback}</>
  return <canvas ref={canvasRef} role="img" aria-label={alt} className="block w-full touch-pan-y" />
}

// Marks the plain backdrop of an opaque photo so it renders blank instead of
// as a solid block: flood-fills inward from the edges through cells close to
// the colour of the top corners. Pictures that already have transparency are
// left alone.
function keyBackdrop(px: Uint8ClampedArray, cols: number, rows: number) {
  const out = new Uint8Array(cols * rows)
  for (let i = 3; i < px.length; i += 4) if (px[i] < 250) return out

  const corner = (i: number) => [px[i * 4], px[i * 4 + 1], px[i * 4 + 2]]
  const [a, b] = [corner(0), corner(cols - 1)]
  const bg = a.map((v, k) => (v + b[k]) / 2)
  const near = (i: number) => Math.hypot(px[i * 4] - bg[0], px[i * 4 + 1] - bg[1], px[i * 4 + 2] - bg[2]) < 48

  const stack: number[] = []
  for (let c = 0; c < cols; c++) stack.push(c, (rows - 1) * cols + c)
  for (let r = 0; r < rows; r++) stack.push(r * cols, r * cols + cols - 1)
  while (stack.length) {
    const i = stack.pop()!
    if (out[i] || !near(i)) continue
    out[i] = 1
    const c = i % cols
    if (c > 0) stack.push(i - 1)
    if (c < cols - 1) stack.push(i + 1)
    if (i >= cols) stack.push(i - cols)
    if (i < (rows - 1) * cols) stack.push(i + cols)
  }
  return out
}
