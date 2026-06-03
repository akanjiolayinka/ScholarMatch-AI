import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppNav from '../components/AppNav'
import { daysUntil, deadlineTier } from '../lib/scholarships'
import './Tracker.css'

const COLUMNS = [
  { key: 'saved', title: 'Not applied', dot: '#888780' },
  { key: 'applied', title: 'Applied', dot: '#378ADD' },
  { key: 'interview', title: 'Interview', dot: '#7F77DD' },
  { key: 'result', title: 'Result', dot: '#1D9E75' },
]

const INITIAL_CARDS = [
  // saved
  { id: 'mcf', col: 'saved', name: 'MasterCard Foundation Scholars', org: 'MasterCard Foundation', tags: ['Full funding', 'Africa', 'STEM'], deadline: '2026-12-15', match: 98, docsReady: 2, docsTotal: 3, fresh: true },
  { id: 'gates', col: 'saved', name: 'Gates Cambridge Scholarship', org: 'Gates Foundation', tags: ['Full funding', 'UK', 'Research'], deadline: '2026-01-08', match: 82, docsReady: 0, docsTotal: 3 },
  { id: 'mtn', col: 'saved', name: 'MTN Science & Technology', org: 'MTN Foundation', tags: ['₦500k / yr', 'Nigeria'], deadline: '2026-12-20', match: 79, docsReady: 1, docsTotal: 2 },
  { id: 'commonwealth', col: 'saved', name: 'Commonwealth Shared Scholarship', org: 'Commonwealth', tags: ['Full funding', 'UK'], deadline: '2026-02-14', match: 74, docsReady: 0, docsTotal: 3 },

  // applied
  { id: 'chev', col: 'applied', name: 'Chevening Scholarship 2025/26', org: 'UK Government', tags: ['£18k / yr', 'UK', 'Leadership'], deadline: '2025-11-03', submitted: 'Nov 3', match: 91, docsReady: 3, docsTotal: 3 },
  { id: 'daad', col: 'applied', name: 'DAAD Development Postgraduate', org: 'DAAD Germany', tags: ['€934 / mo', 'Germany'], deadline: '2025-10-28', submitted: 'Oct 28', match: 87, docsReady: 3, docsTotal: 3 },

  // interview
  { id: 'nnpc', col: 'interview', name: 'NNPC / SNEPCo National Merit', org: 'NNPC', tags: ['Full funding', 'Nigeria', 'Engineering'], deadline: '2026-12-10', interview: 'Dec 10', match: 88, prepProgress: 55 },

  // result
  { id: 'shell', col: 'result', name: 'Shell Nigeria University Scholarship', org: 'Shell Nigeria', tags: ['₦800k / yr', 'Nigeria', 'STEM'], deadline: '2026-10-12', awarded: 'Oct 12', match: 100, won: true },
]

const REMINDERS = [
  { key: 'w1', label: '1 week before' },
  { key: 'd3', label: '3 days before' },
  { key: 'd1', label: '1 day before' },
]

export default function Tracker() {
  const navigate = useNavigate()
  const [cards, setCards] = useState(INITIAL_CARDS)
  const [draggedId, setDraggedId] = useState(null)
  const [overCol, setOverCol] = useState(null)
  const [reminderFor, setReminderFor] = useState(null)
  const popoverRef = useRef(null)

  const stats = useMemo(() => {
    const c = { saved: 0, applied: 0, interview: 0, result: 0, won: 0, urgent: 0 }
    for (const card of cards) {
      c[card.col] += 1
      if (card.won) c.won += 1
      if (deadlineTier(daysUntil(card.deadline)) === 'urgent' && card.col !== 'result') c.urgent += 1
    }
    return c
  }, [cards])

  function onDragStart(e, id) {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = 'move'
    try { e.dataTransfer.setData('text/plain', id) } catch (_) {}
  }
  function onDragEnd() {
    setDraggedId(null)
    setOverCol(null)
  }
  function onDragOver(e, colKey) {
    e.preventDefault()
    if (overCol !== colKey) setOverCol(colKey)
  }
  function onDragLeave(colKey) {
    if (overCol === colKey) setOverCol(null)
  }
  function onDrop(e, colKey) {
    e.preventDefault()
    const id = draggedId || e.dataTransfer.getData('text/plain')
    if (!id) return
    setCards((arr) => arr.map((c) => c.id === id ? { ...c, col: colKey, won: colKey === 'result' ? true : c.won } : c))
    setDraggedId(null)
    setOverCol(null)
  }

  function toggleReminder(card, value) {
    setCards((arr) => arr.map((c) => c.id === card.id ? { ...c, reminder: value } : c))
    setReminderFor(null)
  }

  return (
    <div className="tr-root">
      <AppNav initials="TA" />

      <div className="tr-header">
        <div>
          <div className="tr-title">Application tracker</div>
          <div className="tr-sub">Track every scholarship from saved to result</div>
        </div>
        <div className="tr-header-right">
          <button className="tr-btn-outline"><i className="ti ti-filter" style={{ fontSize: 13 }} aria-hidden="true" /> Filter</button>
          <button className="tr-btn-primary" onClick={() => navigate('/dashboard')}>
            <i className="ti ti-plus" style={{ fontSize: 13 }} aria-hidden="true" /> Add scholarship
          </button>
        </div>
      </div>

      <div className="tr-stats">
        <Stat icon="ti-bookmark" bg="#E6F1FB" color="#185FA5" num={stats.saved} label="Saved" />
        <Stat icon="ti-send" bg="#FAEEDA" color="#854F0B" num={stats.applied} label="Applied" />
        <Stat icon="ti-microphone" bg="#EEEDFE" color="#534AB7" num={stats.interview} label="Interview" />
        <Stat icon="ti-trophy" bg="#E1F5EE" color="#0F6E56" num={stats.won} label="Won" numColor="#1D9E75" />
        <Stat icon="ti-clock" bg="#FCEBEB" color="#A32D2D" num={stats.urgent} label="Urgent deadlines" numColor={stats.urgent ? '#A32D2D' : undefined} />
      </div>

      <div className="tr-board">
        {COLUMNS.map((col) => {
          const items = cards.filter((c) => c.col === col.key)
          return (
            <section
              key={col.key}
              className={`tr-col ${overCol === col.key ? 'over' : ''}`}
              onDragOver={(e) => onDragOver(e, col.key)}
              onDragLeave={() => onDragLeave(col.key)}
              onDrop={(e) => onDrop(e, col.key)}
              aria-label={`${col.title} column`}
            >
              <header className="tr-col-header">
                <div className="tr-col-title"><span className="tr-col-dot" style={{ background: col.dot }} />{col.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="tr-col-count">{items.length}</span>
                  <button className="tr-col-add" onClick={() => navigate('/dashboard')} aria-label={`Add to ${col.title}`}>+</button>
                </div>
              </header>
              <div className="tr-cards">
                {items.length === 0 ? (
                  <div className="tr-empty">
                    <i className="ti ti-inbox" aria-hidden="true" />
                    No applications here yet — drag a card over or add one from your matches.
                  </div>
                ) : items.map((card) => (
                  <Card
                    key={card.id}
                    card={card}
                    dragging={draggedId === card.id}
                    onDragStart={(e) => onDragStart(e, card.id)}
                    onDragEnd={onDragEnd}
                    onClick={() => navigate(`/apply/${card.id}`)}
                    onBell={() => setReminderFor(reminderFor === card.id ? null : card.id)}
                    reminderOpen={reminderFor === card.id}
                    onReminder={(v) => toggleReminder(card, v)}
                    popoverRef={popoverRef}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

function Stat({ icon, bg, color, num, label, numColor }) {
  return (
    <div className="tr-stat">
      <div className="tr-stat-icon" style={{ background: bg }}><i className={`ti ${icon}`} style={{ color }} aria-hidden="true" /></div>
      <div>
        <div className="tr-stat-num" style={numColor ? { color: numColor } : undefined}>{num}</div>
        <div className="tr-stat-lbl">{label}</div>
      </div>
    </div>
  )
}

function Card({ card, dragging, onDragStart, onDragEnd, onClick, onBell, reminderOpen, onReminder, popoverRef }) {
  const days = daysUntil(card.deadline)
  const tier = deadlineTier(days)
  const cls = ['tr-card']
  if (dragging) cls.push('dragging')
  if (card.won) cls.push('won')
  if (card.fresh) cls.push('fresh')

  let deadlineEl
  if (card.won) deadlineEl = <span className="tr-deadline ok"><i className="ti ti-check" style={{ fontSize: 10 }} aria-hidden="true" />Awarded {card.awarded}</span>
  else if (card.submitted) deadlineEl = <span className="tr-deadline warn"><i className="ti ti-check" style={{ fontSize: 10 }} aria-hidden="true" />Submitted {card.submitted}</span>
  else if (card.interview) deadlineEl = <span className="tr-deadline urgent"><i className="ti ti-microphone" style={{ fontSize: 10 }} aria-hidden="true" />Interview {card.interview}</span>
  else if (tier === 'past') deadlineEl = <span className="tr-deadline past"><i className="ti ti-clock" style={{ fontSize: 10 }} aria-hidden="true" />Deadline passed</span>
  else if (tier === 'urgent') deadlineEl = <span className="tr-deadline urgent"><i className="ti ti-clock" style={{ fontSize: 10 }} aria-hidden="true" />{days} days left</span>
  else if (tier === 'warn') deadlineEl = <span className="tr-deadline warn"><i className="ti ti-clock" style={{ fontSize: 10 }} aria-hidden="true" />{days} days left</span>
  else deadlineEl = <span className="tr-deadline ok"><i className="ti ti-clock" style={{ fontSize: 10 }} aria-hidden="true" />{new Date(card.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>

  return (
    <article
      className={cls.join(' ')}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      {card.won && <div className="tr-won-badge"><i className="ti ti-trophy" style={{ fontSize: 10 }} aria-hidden="true" />Won</div>}
      {card.fresh && !card.won && <div className="tr-new-badge">New</div>}
      <div className="tr-card-top">
        <div className="tr-card-name">{card.name}</div>
        <button className="tr-card-menu" onClick={(e) => e.stopPropagation()} aria-label="Card menu"><i className="ti ti-dots" aria-hidden="true" /></button>
      </div>
      <div className="tr-card-org"><i className="ti ti-building" style={{ fontSize: 10 }} aria-hidden="true" />{card.org}</div>
      <div className="tr-card-tags">{card.tags.map((t) => <span key={t} className="tr-tag">{t}</span>)}</div>
      <div className="tr-card-footer">
        {deadlineEl}
        <span className={`tr-match ${card.won ? 'active' : ''}`}>{card.won ? 'Active' : `${card.match}% match`}</span>
      </div>

      {typeof card.docsReady === 'number' && (
        <div className="tr-progress">
          <div className="tr-prog-label">
            <span>{card.submitted ? 'Application complete' : 'Documents ready'}</span>
            <span>{card.docsReady} / {card.docsTotal}</span>
          </div>
          <div className="tr-prog-bar">
            <div
              className="tr-prog-fill"
              style={{
                width: `${(card.docsReady / card.docsTotal) * 100}%`,
                background: card.docsReady === card.docsTotal ? '#1D9E75' : '#F5A623',
              }}
            />
          </div>
        </div>
      )}
      {typeof card.prepProgress === 'number' && (
        <div className="tr-progress">
          <div className="tr-prog-label"><span>Interview prep</span><span>In progress</span></div>
          <div className="tr-prog-bar"><div className="tr-prog-fill" style={{ width: `${card.prepProgress}%`, background: '#7F77DD' }} /></div>
        </div>
      )}

      <div className="tr-card-row" style={{ position: 'relative' }}>
        <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>
          {card.reminder ? `Reminder: ${REMINDERS.find((r) => r.key === card.reminder)?.label || card.reminder}` : ' '}
        </span>
        <button
          className={`tr-bell ${card.reminder ? 'on' : ''}`}
          onClick={(e) => { e.stopPropagation(); onBell() }}
          aria-label="Set reminder"
        >
          <i className={`ti ${card.reminder ? 'ti-bell-filled' : 'ti-bell'}`} style={{ fontSize: 14 }} aria-hidden="true" />
        </button>
        {reminderOpen && (
          <div
            ref={popoverRef}
            className="tr-reminder-popover"
            style={{ right: 0, top: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            {REMINDERS.map((r) => (
              <button key={r.key} onClick={() => onReminder(r.key)}>{r.label}</button>
            ))}
            <div className="sep" />
            <button onClick={() => onReminder(null)} style={{ color: 'var(--color-text-tertiary)' }}>Cancel</button>
          </div>
        )}
      </div>
    </article>
  )
}
