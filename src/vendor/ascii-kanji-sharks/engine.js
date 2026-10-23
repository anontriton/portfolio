/**
 * Not upstream: written for iversonlai.dev in place of upstream's main.js,
 * which drives a whole page from the URL and keyboard. This wires Ocean +
 * Painter to one canvas with a teardown, and keeps upstream's loop: fixed
 * timestep, resize, pointer input, prefers-reduced-motion. It also pauses
 * while the canvas is off-screen.
 */
import { loadFont } from "./glyphs.js";
import { Ocean, SPECIES } from "./ocean.js";
import { Painter } from "./painter.js";
import { clamp, makeRandom } from "./util.js";

const STEP = 1 / 60;
const MAX_STEPS = 4;

export class OceanEngine {
  constructor(canvas, sharks = 4) {
    this.canvas = canvas;
    this.ocean = new Ocean(makeRandom(Math.floor(Math.random() * 1e9)), sharks);
    this.painter = null;
    this.raf = 0;
    this.last = 0;
    this.acc = 0;
    this.visible = true;
    this.disposed = false;
    this.reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.intersectionObserver = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      this.schedule();
    });
    this.reducedMotion.addEventListener("change", this.onMotionPreference);
    addEventListener("pointermove", this.onPointerMove, { passive: true });
    addEventListener("pointerdown", this.onPointerDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", this.onPointerLeave);
    addEventListener("blur", this.onPointerLeave);

    // The ink ramp is measured from whatever font rendered, so the painter
    // waits for the web font (or its fallback).
    loadFont(SPECIES.map((s) => s.glyph)).then(() => {
      if (this.disposed) return;
      this.painter = new Painter(canvas, "night");
      this.painter.setBackground(getComputedStyle(canvas).backgroundColor);
      this.resizeObserver.observe(canvas);
      this.intersectionObserver.observe(canvas);
      this.resize();
      this.schedule();
    });
  }

  destroy() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    this.intersectionObserver.disconnect();
    this.reducedMotion.removeEventListener("change", this.onMotionPreference);
    removeEventListener("pointermove", this.onPointerMove);
    removeEventListener("pointerdown", this.onPointerDown);
    document.documentElement.removeEventListener("pointerleave", this.onPointerLeave);
    removeEventListener("blur", this.onPointerLeave);
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    if (!this.painter || rect.width < 1 || rect.height < 1) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const cell = clamp(Math.round(Math.min(rect.width, rect.height) / 56), 12, 24);
    this.painter.resize(rect.width, rect.height, cell, dpr);
    this.ocean.resize(rect.width, rect.height, cell);
    if (this.reducedMotion.matches) this.drawStill();
  }

  schedule() {
    cancelAnimationFrame(this.raf);
    if (this.disposed || !this.painter || !this.visible || this.reducedMotion.matches) return;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  frame = (now) => {
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    this.acc += dt;
    let steps = 0;
    while (this.acc >= STEP && steps < MAX_STEPS) {
      this.ocean.step(STEP);
      this.acc -= STEP;
      steps++;
    }
    if (steps === MAX_STEPS) this.acc = 0;
    this.painter.render(this.ocean, dt);
    this.raf = requestAnimationFrame(this.frame);
  };

  /** Reduced motion: let the schools form, then show a single frame. */
  drawStill() {
    while (this.ocean.time < 4) this.ocean.step(STEP);
    this.painter.render(this.ocean, STEP);
  }

  onMotionPreference = () => {
    if (!this.painter) return;
    if (this.reducedMotion.matches) {
      cancelAnimationFrame(this.raf);
      this.drawStill();
    } else {
      this.schedule();
    }
  };

  localPoint(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };
  }

  onPointerMove = (e) => {
    const p = this.localPoint(e);
    Object.assign(this.ocean.pointer, { x: p.x, y: p.y, active: p.inside && e.pointerType !== "touch" });
  };

  onPointerDown = (e) => {
    const p = this.localPoint(e);
    if (p.inside && !this.reducedMotion.matches) this.ocean.splash(p.x, p.y);
  };

  onPointerLeave = () => {
    this.ocean.pointer.active = false;
  };
}
