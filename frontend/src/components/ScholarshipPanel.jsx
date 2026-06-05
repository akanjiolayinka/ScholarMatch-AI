import { useEffect, useRef } from 'react'
import { fitReasons, APPLICATION_CHECKLIST } from '../lib/mockData'
import { formatDeadline } from '../lib/scholarships'
import './ScholarshipPanel.css'

// Right-side slide-in panel with overview, eligibility, fit explanation,
// document checklist, and footer actions. Used by Application Assistant
// (View requirements) and Dashboard (Why am I a fit?).
export default function ScholarshipPanel({
  scholarship: s,
  profile,
  scrollToSection,
  onClose,
  onApply,
  onAddToTracker,
}) {
  const whyRef = useRef(null)
  const reasons = fitReasons(profile, s)

  useEffect(() => {
    if (scrollToSection === 'why' && whyRef.current) {
      const id = window.setTimeout(() => whyRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200)
      return () => window.clearTimeout(id)
    }
  }, [scrollToSection])

  // Esc closes the panel.
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="sp-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Scholarship details">
      <aside className="sp-panel" onClick={(e) => e.stopPropagation()}>
        <header className="sp-head">
          <button className="sp-close" onClick={onClose} aria-label="Close panel">
            <i className="ti ti-x" style={{ fontSize: 18 }} aria-hidden="true" />
          </button>
          <div className="sp-org">{s.organization || s.org}</div>
          <h2 className="sp-name">{s.name}</h2>
          <div className="sp-meta">
            <span className="sp-match">{s.match_score || s.match}% match</span>
            <span className="sp-sep">·</span>
            <span className="sp-amount">{s.amount}</span>
            <span className="sp-sep">·</span>
            <span className="sp-funding">{s.funding_type || 'See requirements'}</span>
          </div>
        </header>

        <section className="sp-section">
          <div className="sp-section-title">Overview</div>
          <p className="sp-body">{s.description}</p>
        </section>

        <section className="sp-section">
          <div className="sp-section-title">Eligibility requirements</div>
          <ul className="sp-list">
            <li>✅ <strong>Nationality:</strong> {s.eligible_nationalities || 'See official site'}</li>
            <li>✅ <strong>Level:</strong> {s.level || 'See official site'}</li>
            <li>✅ <strong>Field:</strong> {s.eligible_fields || 'All fields'}</li>
            <li>✅ <strong>GPA minimum:</strong> {s.gpa_min || 'Not specified'}</li>
            <li>✅ <strong>Deadline:</strong> {formatDeadline(s.deadline)}</li>
            <li>✅ <strong>Financial need:</strong> {s.need_based ? 'Yes — required' : 'Not required'}</li>
            {s.official_url && (
              <li>
                🔗 <strong>Official link:</strong>{' '}
                <a href={s.official_url} target="_blank" rel="noreferrer noopener">{s.official_url.replace(/^https?:\/\//, '')}</a>
              </li>
            )}
          </ul>
        </section>

        <section className="sp-section sp-why" ref={whyRef} id="why">
          <div className="sp-section-title">
            <i className="ti ti-star-filled" style={{ color: '#F5A623', fontSize: 16, marginRight: 6 }} aria-hidden="true" />
            Why you qualify
          </div>
          <p className="sp-body sp-why-intro">Based on your profile, here's how you stack up against this scholarship:</p>
          <ul className="sp-fit-list">
            {reasons.length === 0
              ? <li>Add a few more profile details and Scholar will explain your fit here.</li>
              : reasons.map((r, i) => (
                <li key={i} className={r.ok ? 'ok' : 'warn'}>
                  <span className="sp-mark">{r.ok ? '✓' : '⚠'}</span>
                  <span>{r.text}</span>
                </li>
              ))}
          </ul>
        </section>

        <section className="sp-section">
          <div className="sp-section-title">Application checklist</div>
          <ul className="sp-checklist">
            {APPLICATION_CHECKLIST.map((item) => (
              <li key={item}><span className="sp-box" />{item}</li>
            ))}
          </ul>
        </section>

        <footer className="sp-footer">
          <button className="sp-btn sp-btn-outline" onClick={onClose}>Close</button>
          <button className="sp-btn sp-btn-outline" onClick={onAddToTracker}>
            <i className="ti ti-bookmark" style={{ fontSize: 13 }} aria-hidden="true" /> Add to tracker
          </button>
          <button className="sp-btn sp-btn-primary" onClick={onApply}>
            Start my application <i className="ti ti-arrow-right" style={{ fontSize: 13 }} aria-hidden="true" />
          </button>
        </footer>
      </aside>
    </div>
  )
}
