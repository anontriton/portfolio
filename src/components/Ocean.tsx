import { useEffect, useRef } from 'react'

// A small ASCII reef: schools of fish flock (boids — separation, alignment,
// cohesion), scatter from the cursor and from a cruising shark, and the shark
// steers toward whichever school is nearest. Click to splash.

const FONT = 13 // px
const STEP = 1 / 60

type Fish = { x: number; y: number; vx: number; vy: number; school: number; big: boolean; gone: number }

// Drawn facing right; mirrored for the swim back.
const SHARK = [
  '           /|        ',
  ' \\ __.---\'\'  `\'\'--._  ',
  ' >=     ))))     o  >',
  ' / `--..___   __..-\'  ',
  '            \\/        ',
]
const MIRROR: Record<string, string> = { '/': '\\', '\\': '/', '(': ')', ')': '(', '<': '>', '>': '<', '`': "'", "'": '`' }
const SHARK_LEFT = SHARK.map((row) =>
  [...row]
    .reverse()
    .map((c) => MIRROR[c] ?? c)
    .join(''),
)

const SCHOOL_COLORS = ['--color-cyan', '--color-amber', '--color-blue', '--color-purple']

export default function Ocean() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const css = getComputedStyle(document.documentElement)
    const color = (v: string) => css.getPropertyValue(v).trim()
    const palette = {
      fish: SCHOOL_COLORS.map(color),
      shark: color('--color-fg-dim'),
      kelp: color('--color-green'),
      sand: color('--color-amber'),
      water: color('--color-blue'),
      faint: color('--color-muted'),
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')

    let W = 0
    let H = 0
    let cw = 8
    let time = 0
    let raf = 0
    let last = 0
    let acc = 0
    let visible = true
    let fish: Fish[] = []
    let kelp: { x: number; h: number; phase: number }[] = []
    const bubbles: { x: number; y: number; vy: number; life: number }[] = []
    const shark = { x: -200, y: 60, vx: 40, vy: 0, facing: 1, lastBite: 0 }
    const pointer = { x: 0, y: 0, active: false }

    const rand = (a: number, b: number) => a + Math.random() * (b - a)
    const floor = () => H - FONT * 1.6 // sand line
    const sharkW = () => SHARK[0].length * cw

    function populate() {
      fish = []
      const schools = Math.max(2, Math.min(4, Math.round(W / 220)))
      for (let s = 0; s < schools; s++) {
        const cx = rand(W * 0.1, W * 0.9)
        const cy = rand(H * 0.2, H * 0.65)
        const n = Math.round(rand(10, 18))
        const heading = Math.random() < 0.5 ? -1 : 1
        for (let i = 0; i < n; i++) {
          fish.push({ x: cx + rand(-30, 30), y: cy + rand(-14, 14), vx: heading * rand(20, 35), vy: rand(-5, 5), school: s, big: i === 0, gone: 0 })
        }
      }
    }

    function plantKelp() {
      kelp = []
      for (let x = rand(10, 40); x < W - 10; x += rand(50, 130)) kelp.push({ x, h: Math.round(rand(2, 6)), phase: rand(0, 6) })
    }

    function resize() {
      const r = canvas.getBoundingClientRect()
      if (r.width < 1) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const firstRun = W === 0
      W = r.width
      H = r.height
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.font = `500 ${FONT}px 'JetBrains Mono', ui-monospace, monospace`
      ctx.textBaseline = 'top'
      cw = ctx.measureText('M').width
      if (firstRun) populate()
      plantKelp()
      if (reduce.matches) still()
    }

    function flee(f: Fish, x: number, y: number, radius: number, strength: number) {
      const dx = f.x - x
      const dy = f.y - y
      const d = Math.hypot(dx, dy)
      if (d < radius && d > 0.1) {
        const k = (strength * (1 - d / radius)) / d
        f.vx += dx * k * STEP
        f.vy += dy * k * STEP
      }
    }

    function step() {
      time += STEP
      const top = FONT
      const bottom = floor() - FONT * 1.5
      const sharkMouth = { x: shark.x + (shark.facing > 0 ? sharkW() - cw * 2 : cw * 2), y: shark.y + FONT * 2 }

      for (const f of fish) {
        if (f.gone > 0) {
          // eaten: respawn from the edge after a while
          f.gone -= STEP
          if (f.gone <= 0) {
            const mate = fish.find((m) => m.school === f.school && m.gone <= 0) ?? f
            f.x = mate.vx > 0 ? -10 : W + 10
            f.y = mate.y + rand(-10, 10)
            f.vx = mate.vx
            f.vy = 0
          }
          continue
        }
        let sx = 0, sy = 0, ax = 0, ay = 0, cx = 0, cy = 0, n = 0
        for (const o of fish) {
          if (o === f || o.gone > 0 || o.school !== f.school) continue
          const dx = o.x - f.x
          const dy = o.y - f.y
          const d2 = dx * dx + dy * dy
          if (d2 > 70 * 70) continue
          n++
          ax += o.vx
          ay += o.vy
          cx += dx
          cy += dy
          // keep a glyph's width apart so fish don't overprint each other
          if (Math.abs(dx) < cw * 2 && Math.abs(dy) < FONT * 1.1) {
            sx -= dx
            sy -= dy * 2
          }
        }
        if (n) {
          f.vx += ((ax / n - f.vx) * 1.2 + cx / n * 0.6 + sx * 6) * STEP
          f.vy += ((ay / n - f.vy) * 1.2 + cy / n * 0.6 + sy * 6) * STEP
        }
        // wander, stay level, stay in the water
        f.vx += rand(-20, 20) * STEP
        f.vy += rand(-20, 20) * STEP - f.vy * 1.2 * STEP
        if (f.y < top) f.vy += 60 * STEP
        if (f.y > bottom) f.vy -= 60 * STEP

        flee(f, sharkMouth.x, sharkMouth.y, 120, 2600)
        if (pointer.active) flee(f, pointer.x, pointer.y, 80, 3200)

        const speed = Math.hypot(f.vx, f.vy)
        const max = f.big ? 70 : 90
        if (speed > max) {
          f.vx *= max / speed
          f.vy *= max / speed
        } else if (speed < 14) {
          f.vx += Math.sign(f.vx || 1) * 8 * STEP
        }
        f.x += f.vx * STEP
        f.y += f.vy * STEP
        // swim off one side, come back on the other
        if (f.x < -30) f.x = W + 20
        if (f.x > W + 30) f.x = -20

        if (Math.abs(f.x - sharkMouth.x) < cw * 1.5 && Math.abs(f.y - sharkMouth.y) < FONT && time - shark.lastBite > 1.5) {
          f.gone = rand(4, 8)
          shark.lastBite = time
          for (let i = 0; i < 4; i++) bubbles.push({ x: f.x + rand(-6, 6), y: f.y, vy: rand(-30, -18), life: 3 })
        }
      }

      // shark: steer toward the nearest school's centre, slowly
      let tx = shark.facing > 0 ? W + 300 : -300
      let ty = H / 2
      let best = Infinity
      const sx = shark.x + sharkW() / 2
      for (const f of fish) {
        if (f.gone > 0) continue
        const d = Math.hypot(f.x - sx, f.y - shark.y)
        if (d < best && Math.sign(f.x - sx) === shark.facing) {
          best = d
          tx = f.x
          ty = f.y - FONT * 2
        }
      }
      const cruise = best < 160 ? 70 : 42
      shark.vx += (Math.sign(tx - sx) * cruise - shark.vx) * 0.6 * STEP
      shark.vy += ((ty - shark.y) * 0.4 - shark.vy) * 0.8 * STEP
      shark.x += shark.vx * STEP
      shark.y = Math.max(top, Math.min(bottom - FONT * 3, shark.y + shark.vy * STEP))
      // turn around only once fully off-screen, so it never flips mid-view
      if (shark.facing > 0 && shark.x > W + 40) {
        shark.facing = -1
        shark.vx = -30
        shark.y = rand(top, bottom - FONT * 3)
      } else if (shark.facing < 0 && shark.x < -sharkW() - 40) {
        shark.facing = 1
        shark.vx = 30
        shark.y = rand(top, bottom - FONT * 3)
      }

      if (Math.random() < 0.02) {
        const k = kelp[Math.floor(Math.random() * kelp.length)]
        if (k) bubbles.push({ x: k.x, y: floor() - k.h * FONT, vy: rand(-25, -12), life: 6 })
      }
      for (const b of bubbles) {
        b.y += b.vy * STEP
        b.x += Math.sin(time * 3 + b.y * 0.05) * 0.3
        b.life -= STEP
      }
      for (let i = bubbles.length - 1; i >= 0; i--) if (bubbles[i].life <= 0 || bubbles[i].y < 0) bubbles.splice(i, 1)
    }

    // Snap to the character grid so everything reads as terminal output.
    const gx = (x: number) => Math.round(x / cw) * cw
    const gy = (y: number) => Math.round(y / FONT) * FONT
    // One glyph at a time: JetBrains Mono would otherwise ligate "><>", "--", etc.
    const text = (str: string, x: number, y: number) => {
      for (let i = 0; i < str.length; i++) if (str[i] !== ' ') ctx.fillText(str[i], x + i * cw, y)
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)

      ctx.fillStyle = palette.water
      ctx.globalAlpha = 0.18
      const surf = '~ ~  ~   ~ ~'.repeat(Math.ceil(W / cw / 12) + 1)
      const shift = Math.floor(time * 2) % 12
      text(surf.slice(shift), 0, 0)

      ctx.globalAlpha = 0.5
      ctx.fillStyle = palette.sand
      const sand = '_.,_ ._,.__ ,_.'.repeat(Math.ceil(W / cw / 15) + 1)
      text(sand, 0, gy(floor()))

      ctx.fillStyle = palette.kelp
      ctx.globalAlpha = 0.55
      for (const k of kelp) {
        for (let i = 1; i <= k.h; i++) {
          const sway = Math.sin(time * 1.2 + k.phase + i * 0.6)
          ctx.fillText(sway > 0 ? ')' : '(', gx(k.x + Math.round(sway) * cw * 0.5), gy(floor() - i * FONT))
        }
      }

      ctx.fillStyle = palette.faint
      for (const b of bubbles) {
        ctx.globalAlpha = Math.min(0.8, b.life / 2)
        ctx.fillText(b.life > 2 ? 'o' : '°', gx(b.x), gy(b.y))
      }

      ctx.globalAlpha = 0.9
      for (const f of fish) {
        if (f.gone > 0) continue
        ctx.fillStyle = palette.fish[f.school % palette.fish.length]
        const right = f.vx >= 0
        text(f.big ? (right ? '><>' : '<><') : right ? '>' : '<', gx(f.x), gy(f.y))
      }

      ctx.fillStyle = palette.shark
      ctx.globalAlpha = 0.85
      const sprite = shark.facing > 0 ? SHARK : SHARK_LEFT
      sprite.forEach((row, i) => text(row, gx(shark.x), gy(shark.y) + i * FONT))
      ctx.globalAlpha = 1
    }

    function frame(now: number) {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      // fixed timestep keeps the flocking stable on any refresh rate
      acc += dt
      while (acc >= STEP) {
        step()
        acc -= STEP
      }
      draw()
      raf = requestAnimationFrame(frame)
    }

    function schedule() {
      cancelAnimationFrame(raf)
      raf = 0
      if (!visible || reduce.matches) return
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }

    function still() {
      shark.x = W * 0.55
      for (let i = 0; i < 120; i++) step()
      draw()
    }

    const local = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onMove = (e: PointerEvent) => {
      Object.assign(pointer, local(e), { active: e.pointerType === 'mouse' })
    }
    const onLeave = () => {
      pointer.active = false
    }
    const onDown = (e: PointerEvent) => {
      const p = local(e)
      for (const f of fish) flee(f, p.x, p.y, 140, 40000)
      for (let i = 0; i < 8; i++) bubbles.push({ x: p.x + rand(-14, 14), y: p.y + rand(-6, 6), vy: rand(-45, -20), life: 2.5 })
      if (reduce.matches) draw()
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      schedule()
    })
    io.observe(canvas)
    reduce.addEventListener('change', schedule)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerleave', onLeave)
    canvas.addEventListener('pointerdown', onDown)
    document.fonts?.ready.then(resize)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      reduce.removeEventListener('change', schedule)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('pointerdown', onDown)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-label="An animated ASCII reef: schools of fish flocking while a shark cruises past"
      role="img"
      className="block h-[240px] w-full cursor-crosshair touch-pan-y sm:h-[260px]"
    />
  )
}
