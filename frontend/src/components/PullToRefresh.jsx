import { useEffect, useRef, useState } from 'react'
import './PullToRefresh.css'

// Mobile-only pull-to-refresh wrapper. Tracks touch deltas relative to the
// document scroll; when the user pulls down 60+ pixels while at the top of
// the page, releasing triggers `onRefresh()` and shows a spinner for 800ms.
export default function PullToRefresh({ onRefresh, children }) {
  const startY = useRef(null)
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    function onStart(e) {
      if (window.scrollY > 0) return
      startY.current = e.touches?.[0]?.clientY ?? null
    }
    function onMove(e) {
      if (startY.current == null) return
      const dy = (e.touches?.[0]?.clientY ?? 0) - startY.current
      if (dy > 0 && window.scrollY === 0) {
        setPullDistance(Math.min(dy * 0.6, 96))
      }
    }
    function onEnd() {
      if (pullDistance >= 60 && !refreshing) {
        setRefreshing(true)
        window.setTimeout(() => {
          setRefreshing(false)
          setPullDistance(0)
          onRefresh?.()
        }, 800)
      } else {
        setPullDistance(0)
      }
      startY.current = null
    }
    document.addEventListener('touchstart', onStart, { passive: true })
    document.addEventListener('touchmove', onMove, { passive: true })
    document.addEventListener('touchend', onEnd, { passive: true })
    return () => {
      document.removeEventListener('touchstart', onStart)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onEnd)
    }
  }, [pullDistance, refreshing, onRefresh])

  const visible = pullDistance > 0 || refreshing
  return (
    <>
      {visible && (
        <div className="ptr-indicator" style={{ transform: `translateY(${Math.min(pullDistance, 60)}px)` }}>
          <div className={`ptr-spinner ${refreshing ? 'spin' : ''}`}>
            <i className="ti ti-refresh" style={{ fontSize: 18 }} aria-hidden="true" />
          </div>
        </div>
      )}
      {children}
    </>
  )
}
