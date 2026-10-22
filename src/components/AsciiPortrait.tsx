import { useEffect, useRef, useState, type ReactNode } from 'react'

// Draws a picture as dense one-colour ASCII on a canvas. Bright areas (skin)
// become heavy glyphs and dark areas (hair, eyes) light ones, so it reads like
// the picture on a dark page; a bright outline traces the silhouette so dark
// hair still has a shape. The backdrop is left blank.
//   1. tone — brightness stretched across the subject and snapped to a short
//      ramp, so flat colours read as even textures; thin ink lines stay gaps
//   2. outline — a Sobel edge on the alpha mask, drawn on top like a pen
//   3. glyphs — rows sit closer than the font is tall, so strokes overlap
//      into a dense, drawn texture
// Each glyph sits on a spring; the cursor pushes glyphs away and they settle.

// Ordered from lightest to heaviest. Short on purpose: a flat cartoon colour
// lands on one glyph and reads as an even texture, so features stand out.
// Starts at ':' so even the darkest parts keep a faint texture.
const RAMP = ':;=+*#%@'
const COLS = 92
const CELL = 0.79 // cell width / height; tighter than the font so rows overlap
const INK_LINES = 0.6 // how much a cell's darkest subpixel (line work) pulls it dark
const LOW = 0.04 // brightness percentiles that map to the ends of the ramp;
const HIGH = 0.995 // high enough that skin sits a step below the teeth
const RADIUS = 46 // px of cursor influence
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
    const ink = css.getPropertyValue('--color-rosewater').trim() || '#f5e0dc'
    // the one spot of colour: the smile
    const lipInk = css.getPropertyValue('--color-red').trim() || '#f38ba8'
    const teethInk = '#ffffff'
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
      // Per cell: coverage, brightness, and the silhouette outline. Brightness
      // leans on the cell's darkest subpixel so thin ink lines (eyes, brows,
      // the mouth) survive as gaps instead of averaging away.
      type Cell = { cover: number; light: number; line: number; rgb: number[] }
      const cells: Cell[] = []
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < COLS; c++) {
          let cover = 0
          let sum = 0
          let darkest = 1
          let line = 0
          const rgb = [0, 0, 0]
          for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
            const x = c * 2 + dx
            const y = r * 2 + dy
            const a = at(alpha, x, y)
            cover += a / 4
            sum += at(lum, x, y) * a
            const p = (Math.min(sh - 1, y) * sw + Math.min(sw - 1, x)) * 4
            for (let k = 0; k < 3; k++) rgb[k] += px[p + k] * a
            if (a > 0.5) darkest = Math.min(darkest, at(lum, x, y))
            // the silhouette, as an outline pen stroke
            line = Math.max(line, Math.min(1, sobel(alpha, x, y) / 1.6))
          }
          const mean = cover > 0 ? sum / (cover * 4) : 0
          if (cover > 0) for (let k = 0; k < 3; k++) rgb[k] /= cover * 4
          cells.push({ cover, light: (1 - INK_LINES) * mean + INK_LINES * Math.min(mean, darkest), line, rgb })
        }
      }

      // Stretch brightness between percentiles of the subject, then snap to
      // the ramp's steps so each flat colour becomes one even texture.
      const sorted = cells.filter((k) => k.cover >= 0.3).map((k) => k.light).sort((x, y) => x - y)
      const lo = sorted[Math.floor(sorted.length * LOW)] ?? 0
      const hi = sorted[Math.floor(sorted.length * HIGH)] ?? 1
      const tone = (l: number) => Math.min(1, Math.max(0, (l - lo) / (hi - lo || 1)))

      const mouth = findMouth(cells.map((k) => (k.cover >= 0.6 ? k.rgb : null)), COLS, rows)

      glyphs = []
      cells.forEach(({ cover, light, line }, i) => {
        if (cover < 0.3 && line < 0.5) return
        const c = i % COLS
        const r = Math.floor(i / COLS)
        const amount = Math.max(tone(light), line)
        const part = mouth[i]
        glyphs.push({
          ch: part === TEETH ? RAMP[RAMP.length - 1] : RAMP[Math.round(amount * (RAMP.length - 1))],
          color: part === TEETH ? teethInk : part === LIPS ? lipInk : ink,
          alpha: part ? 1 : 0.45 + 0.55 * amount,
          hx: (c + 0.5) * cw,
          hy: (r + 0.5) * chh,
          ox: 0,
          oy: 0,
          vx: 0,
          vy: 0,
        })
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

const LIPS = 1
const TEETH = 2

// Picks out the smile by colour so it can be drawn as the portrait's one
// accent. Lips are a redder orange than skin (hue ~10–21° vs ~27°) and a bit
// darker; the mouth is the largest connected patch of them. Teeth are the
// near-white cells inside that patch's box — which keeps a white collar out.
function findMouth(rgb: (number[] | null)[], cols: number, rows: number) {
  const out = new Uint8Array(cols * rows)
  const hsl = rgb.map((v) => (v ? toHsl(v[0], v[1], v[2]) : null))
  const isLip = hsl.map((v) => !!v && v[0] >= 8 && v[0] <= 21 && v[1] > 0.5 && v[2] > 0.55 && v[2] < 0.74)

  // largest 4-connected patch of lip-coloured cells
  const seen = new Uint8Array(cols * rows)
  let best: number[] = []
  for (let i = 0; i < isLip.length; i++) {
    if (!isLip[i] || seen[i]) continue
    const patch: number[] = []
    const stack = [i]
    seen[i] = 1
    while (stack.length) {
      const j = stack.pop()!
      patch.push(j)
      const c = j % cols
      for (const n of [c > 0 ? j - 1 : -1, c < cols - 1 ? j + 1 : -1, j - cols, j + cols]) {
        if (n >= 0 && n < isLip.length && isLip[n] && !seen[n]) {
          seen[n] = 1
          stack.push(n)
        }
      }
    }
    if (patch.length > best.length) best = patch
  }
  if (best.length < 4) return out

  const xs = best.map((j) => j % cols)
  const ys = best.map((j) => Math.floor(j / cols))
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
  for (const j of best) out[j] = LIPS
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const j = y * cols + x
      const v = hsl[j]
      if (v && !out[j] && v[2] > 0.8) out[j] = TEETH
    }
  }
  return out
}

function toHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min
  if (!d) return [0, 0, l]
  const s = d / (1 - Math.abs(2 * l - 1))
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [(h * 60 + 360) % 360, s, l]
}
