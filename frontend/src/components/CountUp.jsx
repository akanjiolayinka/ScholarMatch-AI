import { useEffect, useRef, useState } from 'react'

// Animate a number from 0 to `target` over `duration` ms, but only after the
// element scrolls into view. Honours prefers-reduced-motion.
export default function CountUp({ target, duration = 1500, format = (n) => Math.round(n).toLocaleString(), suffix = '', prefix = '', className }) {
  const ref = useRef(null)
  const [value, setValue] = useState(0)
  const startedRef = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setValue(target)
      return
    }
    const obs = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting || startedRef.current) continue
        startedRef.current = true
        const start = performance.now()
        function frame(now) {
          const t = Math.min(1, (now - start) / duration)
          // ease-out cubic
          const eased = 1 - Math.pow(1 - t, 3)
          setValue(target * eased)
          if (t < 1) requestAnimationFrame(frame)
        }
        requestAnimationFrame(frame)
      }
    }, { threshold: 0.4 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [target, duration])

  return <span ref={ref} className={className}>{prefix}{format(value)}{suffix}</span>
}
