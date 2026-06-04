import { useEffect, useState } from 'react'

// Fade-swap loop through a list of strings. Crossfade duration 0.4s,
// hold each line for `interval` ms (default 3000).
export default function RotatingText({ lines, interval = 3000, className = '', style = {} }) {
  const [idx, setIdx] = useState(0)
  const [opacity, setOpacity] = useState(1)

  useEffect(() => {
    if (!lines || lines.length < 2) return
    let cancelled = false
    const cycle = () => {
      setOpacity(0)
      const next = window.setTimeout(() => {
        if (cancelled) return
        setIdx((i) => (i + 1) % lines.length)
        setOpacity(1)
      }, 400)
      return next
    }
    const tick = window.setInterval(cycle, interval)
    return () => {
      cancelled = true
      window.clearInterval(tick)
    }
  }, [lines, interval])

  return (
    <div className={className} style={{ transition: 'opacity 0.4s ease', opacity, ...style }}>
      {lines[idx]}
    </div>
  )
}
