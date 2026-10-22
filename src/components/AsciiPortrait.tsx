import { useEffect, useRef, useState, type ReactNode } from 'react'

// Turns a photo into ASCII on a canvas. Each glyph sits on a spring anchored
// to its home cell; the cursor pushes glyphs away and they settle back.
// Transparent pixels become blank, so a cut-out PNG reads best.

const RAMP = ' .:-=+*#%@'
const COLS = 56
const RADIUS = 46 // px of cursor influence
const PUSH = 2600
const SPRING = 90
const DAMP = 11

type Glyph = { ch: string; hx: number; hy: number; ox: number; oy: number; vx: number; vy: number; lum: number }

export default function AsciiPortrait({ src, alt, fallback }: { src: string; alt: string; fallback: ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const css = getComputedStyle(document.documentElement)
    const base = css.getPropertyValue('--color-fg-dim').trim() || '#a9b1d6'
    const accent = css.getPropertyValue('--color-blue').trim() || '#7aa2f7'
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
      ctx.font = `500 ${chh * 0.92}px 'JetBrains Mono', ui-monospace, monospace`
      ctx.textBaseline = 'top'

      // Downsample to one pixel per cell, then stretch contrast.
      const sample = document.createElement('canvas')
      sample.width = COLS
      sample.height = rows
      const sctx = sample.getContext('2d', { willReadFrequently: true })!
      sctx.drawImage(img, 0, 0, COLS, rows)
      const px = sctx.getImageData(0, 0, COLS, rows).data
      const lum: number[] = []
      let lo = 1
      let hi = 0
      for (let i = 0; i < COLS * rows; i++) {
        const a = px[i * 4 + 3] / 255
        const l = ((0.2126 * px[i * 4] + 0.7152 * px[i * 4 + 1] + 0.0722 * px[i * 4 + 2]) / 255) * a
        lum.push(a < 0.1 ? -1 : l)
        if (a >= 0.1) {
          lo = Math.min(lo, l)
          hi = Math.max(hi, l)
        }
      }

      glyphs = []
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < COLS; c++) {
          const l = lum[r * COLS + c]
          if (l < 0) continue
          const n = Math.pow((l - lo) / (hi - lo || 1), 0.85)
          const ch = RAMP[Math.min(RAMP.length - 1, Math.floor(n * RAMP.length))]
          if (ch === ' ') continue
          glyphs.push({ ch, hx: c * cw, hy: r * chh, ox: 0, oy: 0, vx: 0, vy: 0, lum: n })
        }
      }
      draw()
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const g of glyphs) {
        const moved = Math.min(1, Math.hypot(g.ox, g.oy) / 10)
        ctx.globalAlpha = 0.3 + 0.7 * Math.max(g.lum, moved)
        ctx.fillStyle = moved > 0.15 ? accent : base
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
