import { useState } from 'react'
import './RefreshButton.css'

// Small circular spinning ↻ button. Shows the spinner for 800ms and then
// calls `onRefresh()`.
export default function RefreshButton({ onRefresh, label = 'Refresh' }) {
  const [spinning, setSpinning] = useState(false)

  function handleClick() {
    if (spinning) return
    setSpinning(true)
    window.setTimeout(() => {
      setSpinning(false)
      onRefresh?.()
    }, 800)
  }

  return (
    <button className={`rf-btn ${spinning ? 'spin' : ''}`} onClick={handleClick} aria-label={label} title={label}>
      <i className="ti ti-refresh" style={{ fontSize: 14 }} aria-hidden="true" />
    </button>
  )
}
