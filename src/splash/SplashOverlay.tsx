import { useEffect, useRef } from 'react'
import './SplashOverlay.css'

const HOLD_MS = 900
const LOGO_EXIT_MS = 320
const GAP_MS = 40
const PANEL_EXIT_MS = 480
const EASE_IN = 'cubic-bezier(0.42, 0, 1, 1)'

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('aborted', 'AbortError'))
      return
    }
    const id = window.setTimeout(resolve, ms)
    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(id)
        reject(new DOMException('aborted', 'AbortError'))
      },
      { once: true },
    )
  })
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve())
  })
}

async function waitForImage(image: HTMLImageElement, signal: AbortSignal): Promise<void> {
  if (!image.complete) {
    await new Promise<void>((resolve, reject) => {
      const done = () => resolve()
      image.addEventListener('load', done, { once: true })
      image.addEventListener('error', done, { once: true })
      signal.addEventListener(
        'abort',
        () => reject(new DOMException('aborted', 'AbortError')),
        { once: true },
      )
    })
  }
  await image.decode().catch(() => undefined)
}

export function SplashOverlay({ onFinished }: { onFinished: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLImageElement>(null)
  const onFinishedRef = useRef(onFinished)
  onFinishedRef.current = onFinished

  useEffect(() => {
    const panel = panelRef.current
    const logo = logoRef.current
    if (!panel || !logo) return

    const controller = new AbortController()
    const { signal } = controller
    const animations: Animation[] = []

    const play = async () => {
      await waitForImage(logo, signal)
      await nextFrame()
      await nextFrame()
      document.getElementById('boot-splash')?.remove()

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      await delay(HOLD_MS, signal)
      if (reduced) {
        onFinishedRef.current()
        return
      }

      const easing =
        getComputedStyle(document.documentElement).getPropertyValue('--ease-in-cubic').trim() ||
        'cubic-bezier(0.32, 0, 0.67, 0)'

      const logoExit = logo.animate(
        [
          { opacity: 1, transform: 'translateY(0) scale(1)' },
          { opacity: 0, transform: 'translateY(-14%) scale(0.94)' },
        ],
        { duration: LOGO_EXIT_MS, easing, fill: 'forwards' },
      )
      animations.push(logoExit)
      await logoExit.finished
      logo.style.visibility = 'hidden'

      await delay(GAP_MS, signal)

      const slide = panel.animate(
        [{ transform: 'translateY(0)' }, { transform: 'translateY(-106%)' }],
        { duration: PANEL_EXIT_MS, easing, fill: 'forwards' },
      )
      const fade = panel.animate([{ opacity: 1 }, { opacity: 0.15 }], {
        duration: PANEL_EXIT_MS * 0.6,
        delay: PANEL_EXIT_MS * 0.4,
        easing: EASE_IN,
        fill: 'forwards',
      })
      animations.push(slide, fade)
      await Promise.all([slide.finished, fade.finished])
      onFinishedRef.current()
    }

    void play().catch((error: unknown) => {
      if (signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) return
      document.getElementById('boot-splash')?.remove()
      onFinishedRef.current()
    })

    return () => {
      controller.abort()
      for (const animation of animations) animation.cancel()
    }
  }, [])

  return (
    <div className="splash" ref={panelRef}>
      <img
        ref={logoRef}
        className="splash__logo"
        src="/images/R2S_logo-removebg.png"
        alt=""
        width={248}
      />
    </div>
  )
}
