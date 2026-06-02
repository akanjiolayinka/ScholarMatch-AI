export default function Logo({ size = 32, showText = true, textSize = 17 }) {
  const radius = size === 24 ? 6 : 8
  return (
    <div className="sm-logo" style={{ fontSize: textSize }}>
      <div className="sm-logo-icon" style={{ width: size, height: size, borderRadius: radius }}>
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <circle cx="9" cy="9" r="7" stroke="#F5A623" strokeWidth="1.5" />
          <line x1="9" y1="2" x2="9" y2="5" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="9" y1="13" x2="9" y2="16" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="2" y1="9" x2="5" y2="9" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="13" y1="9" x2="16" y2="9" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="9" cy="9" r="2" fill="#F5A623" />
        </svg>
      </div>
      {showText && <span>ScholarMatch AI</span>}
    </div>
  )
}
