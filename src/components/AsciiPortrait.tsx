import { useEffect, useRef, useState, type ReactNode } from 'react'

// Turns a picture into cartoon-style ASCII on a canvas:
//   1. regions — backdrop, dark areas (hair, brows, eyes) and the rest
//   2. outlines — a one-cell | / - \ stroke wherever two regions meet,
//      following the boundary's direction
//   3. fill — dark areas solid, the rest posterised into flat tones
//   4. colour — each glyph takes the picture's colour, lifted toward the
//      page's text colour so dark areas such as hair still read on a dark page
// Each glyph sits on a spring; the cursor pushes glyphs away and they settle.

// Flat cartoon tones for the lit areas, darkest to lightest.
const TONES = [':', '+', '*', '#']
const DARK = 0.2 // darkest fifth of the subject counts as "dark" (hair, brows, eyes)
const FEATURE = 0.09 // …as does anything this much darker than its surroundings
const COLS = 76
const RADIUS = 48 // px of cursor influence
const PUSH = 2600
const SPRING = 90
const DAMP = 11

type Glyph = { ch: string; color: string; alpha: number; hx: number; hy: number; ox: number; oy: number; vx: number; vy: number }

export default function AsciiPortrait({ src, alt, fallback }: { src: string; alt: string; fallback: ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const css = getComputedStyle(document.documentElement)
    const ink = hexRgb(css.getPropertyValue('--color-fg').trim() || '#cdd6f4')
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
      chh = cw / 0.6 // monospace glyphs are ~0.6 as wide as tall
      const rows = Math.round(COLS * (img.naturalHeight / img.naturalWidth) * 0.6)
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(rows * chh * dpr)
      canvas.style.height = `${rows * chh}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.font = `600 ${chh * 0.95}px 'JetBrains Mono', ui-monospace, monospace`
      ctx.textBaseline = 'top'

      // Sample at 2× so edges land inside a cell, not just between cells.
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

      // Collapse 2×2 subpixels into cells (colour averaged over coverage).
      type Cell = { a: number; l: number; r: number; g: number; b: number }
      const cells: Cell[] = []
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < COLS; c++) {
          const cell: Cell = { a: 0, l: 0, r: 0, g: 0, b: 0 }
          let weight = 0
          for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
            const i = (r * 2 + dy) * sw + c * 2 + dx
            const a = alpha[i]
            cell.a += a / 4
            weight += a
            cell.l += lum[i] * a
            cell.r += px[i * 4] * a
            cell.g += px[i * 4 + 1] * a
            cell.b += px[i * 4 + 2] * a
          }
          if (weight > 0) {
            cell.l /= weight
            cell.r /= weight
            cell.g /= weight
            cell.b /= weight
          }
          cells.push(cell)
        }
      }

      // Rank tones within the subject, so thresholds adapt to the picture.
      const tones = cells.filter((k) => k.a >= 0.4).map((k) => k.l).sort((x, y) => x - y)
      const rank = (l: number) => {
        let lo = 0
        let hi = tones.length
        while (lo < hi) {
          const mid = (lo + hi) >> 1
          if (tones[mid] < l) lo = mid + 1
          else hi = mid
        }
        return lo / (tones.length || 1)
      }

      // Local mean brightness (7×7, subject only), so features that are only
      // darker than the skin around them — eyes, brows, lips — still count.
      const local = cells.map((_, i) => {
        const c0 = i % COLS
        const r0 = Math.floor(i / COLS)
        let sum = 0
        let n = 0
        for (let r = Math.max(0, r0 - 3); r <= Math.min(rows - 1, r0 + 3); r++) {
          for (let c = Math.max(0, c0 - 3); c <= Math.min(COLS - 1, c0 + 3); c++) {
            const k = cells[r * COLS + c]
            if (k.a < 0.4) continue
            sum += k.l
            n++
          }
        }
        return n ? sum / n : 0
      })

      // Regions: 0 backdrop, 1 dark (hair, brows, eyes), 2 everything else.
      const region = cells.map((k, i) => (k.a < 0.4 ? 0 : rank(k.l) < DARK || k.l < local[i] - FEATURE ? 1 : 2))
      // Off-canvas counts as more of the nearest cell, so a picture cropped at
      // the shoulders doesn't get boxed in by an outline along the crop.
      const get = (f: ArrayLike<number>, c: number, r: number) =>
        f[Math.min(rows - 1, Math.max(0, r)) * COLS + Math.min(COLS - 1, Math.max(0, c))]

      // Outline a cell when it sits on the inside of a boundary: subject next
      // to backdrop (the silhouette), or dark next to light (hair, features).
      // Its stroke follows the boundary's direction, from a Sobel on the mask.
      function outline(c: number, r: number) {
        const own = region[r * COLS + c]
        if (own === 0) return null
        const mask = (cc: number, rr: number) => {
          const k = get(region, cc, rr)
          return own === 1 ? (k === 1 ? 1 : 0) : k > 0 ? 1 : 0
        }
        const n4 = [mask(c - 1, r), mask(c + 1, r), mask(c, r - 1), mask(c, r + 1)]
        if (n4.every(Boolean)) return null
        const gx = mask(c + 1, r - 1) + 2 * mask(c + 1, r) + mask(c + 1, r + 1) - mask(c - 1, r - 1) - 2 * mask(c - 1, r) - mask(c - 1, r + 1)
        const gy = mask(c - 1, r + 1) + 2 * mask(c, r + 1) + mask(c + 1, r + 1) - mask(c - 1, r - 1) - 2 * mask(c, r - 1) - mask(c + 1, r - 1)
        // A one-cell-thick line has outside on both sides, so its gradient
        // cancels out; orient it by which sides are open instead.
        if (Math.abs(gx) + Math.abs(gy) < 1.5) return !n4[2] || !n4[3] ? Math.PI / 2 : 0
        // aspect: cells are taller than wide, so scale y to screen proportions
        return Math.atan2(gy / 0.6, gx)
      }

      glyphs = []
      cells.forEach((k, i) => {
        if (region[i] === 0) return
        const c = i % COLS
        const r = Math.floor(i / COLS)
        const hx = c * cw
        const hy = r * chh
        const edge = outline(c, r)
        if (edge !== null) {
          glyphs.push({ ch: stroke(edge), color: rgb(ink), alpha: 1, hx, hy, ox: 0, oy: 0, vx: 0, vy: 0 })
          return
        }
        // lift colours toward the ink so they read on a dark page; dark
        // regions get a dense glyph so hair is a solid shape, not a hole
        const dark = region[i] === 1
        const lift = dark ? 0.32 : 0.18
        const color = rgb([k.r + (ink[0] - k.r) * lift, k.g + (ink[1] - k.g) * lift, k.b + (ink[2] - k.b) * lift])
        if (dark) {
          glyphs.push({ ch: '%', color, alpha: 0.8, hx, hy, ox: 0, oy: 0, vx: 0, vy: 0 })
          return
        }
        const t = Math.min(TONES.length - 1, Math.floor(((rank(k.l) - DARK) / (1 - DARK)) * TONES.length))
        glyphs.push({ ch: TONES[t], color, alpha: 0.6 + 0.4 * (t / (TONES.length - 1)), hx, hy, ox: 0, oy: 0, vx: 0, vy: 0 })
      })
      draw()
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const g of glyphs) {
        const moved = Math.min(1, Math.hypot(g.ox, g.oy) / 10)
        ctx.globalAlpha = Math.max(g.alpha, moved)
        ctx.fillStyle = moved > 0.15 ? accent : g.color
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
          const dx = g.hx + g.ox + cw / 2 - pointer.x
          const dy = g.hy + g.oy + chh / 2 - pointer.y
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

// Edge glyph for a gradient angle (radians, y down). The stroke runs across
// the gradient: a horizontal gradient is a vertical edge, and so on.
function stroke(angle: number) {
  const a = ((angle * 180) / Math.PI + 180) % 180
  if (a < 22.5 || a >= 157.5) return '|'
  if (a < 67.5) return '\\'
  if (a < 112.5) return '-'
  return '/'
}

function hexRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgb([r, g, b]: number[]) {
  return `rgb(${Math.round(r)} ${Math.round(g)} ${Math.round(b)})`
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
