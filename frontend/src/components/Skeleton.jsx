import { useEffect, useState } from 'react'
import './Skeleton.css'

export function Skeleton({ width, height = 14, radius = 6, style }) {
  return <span className="sk-bar" style={{ width, height, borderRadius: radius, ...style }} />
}

export function SkeletonCard() {
  return (
    <div className="sk-card">
      <div className="sk-row" style={{ justifyContent: 'space-between' }}>
        <Skeleton width="60%" />
        <Skeleton width="48px" height={20} radius={10} />
      </div>
      <Skeleton width="80%" height={16} style={{ marginTop: 10 }} />
      <Skeleton width="40%" height={22} style={{ marginTop: 14 }} />
      <div className="sk-row" style={{ marginTop: 12, gap: 6 }}>
        <Skeleton width="56px" height={16} radius={10} />
        <Skeleton width="44px" height={16} radius={10} />
        <Skeleton width="60px" height={16} radius={10} />
      </div>
      <div className="sk-row" style={{ marginTop: 16, justifyContent: 'space-between' }}>
        <Skeleton width="80px" />
        <Skeleton width="72px" height={28} radius={8} />
      </div>
    </div>
  )
}

// Hook that flips to false after `ms` so a parent component can show
// skeletons on first mount.
export function useFirstMountLoading(ms = 1500) {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), ms)
    return () => window.clearTimeout(id)
  }, [ms])
  return loading
}
