import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppNav from '../components/AppNav'
import {
  SCHOLARSHIPS,
  daysUntil,
  formatDeadline,
  matchTier,
  deadlineTier,
} from '../lib/scholarships'
import { useSession } from '../lib/useSession'
import { saveApplication, deleteApplication } from '../lib/applicationsApi'
import { useToast } from '../components/Toast'
import { isMockMode, hasMockSession } from '../lib/mockAuth'
import { SkeletonCard, useFirstMountLoading } from '../components/Skeleton'
import './Dashboard.css'

const CATEGORIES = [
  { key: 'all', label: 'All matches', icon: 'ti-list', count: 247 },
  { key: 'abroad', label: 'Study abroad', icon: 'ti-plane', count: 89 },
  { key: 'local', label: 'Local funding', icon: 'ti-building', count: 74 },
  { key: 'merit', label: 'Merit-based', icon: 'ti-award', count: 63 },
  { key: 'need', label: 'Need-based', icon: 'ti-heart', count: 21 },
]

const DEADLINES = [
  { key: 'd30', label: 'Within 30 days', count: 12 },
  { key: 'd90', label: '1–3 months', count: 58 },
  { key: 'd90plus', label: '3+ months', count: 177 },
]

const DESTINATIONS = ['UK', 'Germany', 'USA', 'Canada', 'Netherlands', 'France', 'Nigeria', 'Australia']

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useSession()
  const toast = useToast()
  const useMock = isMockMode() || hasMockSession()
  const loading = useFirstMountLoading(1500)
  const [category, setCategory] = useState('all')
  const [deadlineFilter, setDeadlineFilter] = useState(null)
  const [destinations, setDestinations] = useState(['UK', 'Germany'])
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('match')
  const [saved, setSaved] = useState(() => new Set())

  function toggleDestination(d) {
    setDestinations((arr) => arr.includes(d) ? arr.filter((x) => x !== d) : [...arr, d])
  }

  function toggleSaved(scholarship) {
    const id = scholarship.id
    setSaved((s) => {
      const next = new Set(s)
      if (next.has(id)) {
        next.delete(id)
        if (user?.id && !useMock) deleteApplication(user.id, id)
        toast.push('Removed from tracker', 'info')
      } else {
        next.add(id)
        if (user?.id && !useMock) saveApplication(user.id, id, scholarship.match)
        toast.push('Added to tracker', 'success')
      }
      return next
    })
  }

  function applyTo(scholarship) {
    if (user?.id && !useMock) saveApplication(user.id, scholarship.id, scholarship.match)
    navigate(`/apply/${scholarship.id}`)
  }

  const filtered = useMemo(() => {
    let list = SCHOLARSHIPS.slice()
    if (category !== 'all') list = list.filter((s) => s.category === category)
    if (deadlineFilter) {
      list = list.filter((s) => {
        const days = daysUntil(s.deadline)
        if (deadlineFilter === 'd30') return days >= 0 && days <= 30
        if (deadlineFilter === 'd90') return days > 30 && days <= 90
        if (deadlineFilter === 'd90plus') return days > 90
        return true
      })
    }
    if (destinations.length) {
      list = list.filter((s) => destinations.includes(s.destination))
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((s) =>
        s.name.toLowerCase().includes(q) ||
        s.org.toLowerCase().includes(q) ||
        s.destination.toLowerCase().includes(q),
      )
    }
    if (sort === 'match') list.sort((a, b) => b.match - a.match)
    if (sort === 'deadline') list.sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline))
    if (sort === 'amount') list.sort((a, b) => (b.amount.includes('Full') ? 1 : 0) - (a.amount.includes('Full') ? 1 : 0))
    return list
  }, [category, deadlineFilter, destinations, search, sort])

  // Up to 3 truly-fresh items, scoped to the filtered list so the row never
  // duplicates a card that already appears below.
  const freshIds = new Set(SCHOLARSHIPS.filter((s) => s.fresh || s.is_new).slice(0, 3).map((s) => s.id))
  const freshOnes = filtered.filter((s) => freshIds.has(s.id)).slice(0, 3)
  const freshIdSet = new Set(freshOnes.map((s) => s.id))
  const mainGrid = filtered.filter((s) => !freshIdSet.has(s.id))
  const urgent = filtered.filter((s) => {
    const d = daysUntil(s.deadline)
    return d >= 0 && d <= 30
  })
  const soonest = urgent[0]

  function clearFilters() {
    setCategory('all')
    setDeadlineFilter(null)
    setDestinations([])
    setSearch('')
  }

  function doRefresh() {
    setRefreshKey((k) => k + 1)
    toast.push(`Refreshed — ${SCHOLARSHIPS.length} matches updated`, 'success')
  }

  return (
    <PullToRefresh onRefresh={doRefresh}>
    <div className="db-root">
      <AppNav initials="TA" />

      <div className="db-main">
        <aside className="db-sidebar">
          <div className="db-profile-mini">
            <div className="db-profile-avatar">TA</div>
            <div className="db-profile-name">Temi Adeyemi</div>
            <div className="db-profile-sub">Computer Eng · UNILAG · GPA 4.3</div>
            <div className="db-completion">
              <div className="db-completion-label"><span>Profile complete</span><span>72%</span></div>
              <div className="db-comp-bar"><div className="db-comp-fill" style={{ width: '72%' }} /></div>
              <button className="db-comp-nudge" onClick={() => navigate('/profile')}>+ Complete your profile to unlock 80 more matches</button>
            </div>
          </div>

          <div className="db-filter-section">
            <div className="db-filter-title">Category</div>
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                className={`db-filter-item ${category === c.key ? 'active' : ''}`}
                onClick={() => setCategory(c.key)}
              >
                <span><i className={`ti ${c.icon}`} style={{ fontSize: 13 }} aria-hidden="true" />{c.label}</span>
                <span className="db-filter-count">{c.count}</span>
              </button>
            ))}
          </div>

          <div className="db-filter-section">
            <div className="db-filter-title">Deadline</div>
            {DEADLINES.map((d) => (
              <button
                key={d.key}
                className={`db-filter-item ${deadlineFilter === d.key ? 'active' : ''}`}
                onClick={() => setDeadlineFilter(deadlineFilter === d.key ? null : d.key)}
              >
                <span>{d.label}</span>
                <span className="db-filter-count">{d.count}</span>
              </button>
            ))}
          </div>

          <div className="db-filter-section">
            <div className="db-filter-title">Destination</div>
            <div className="db-tag-row">
              {DESTINATIONS.map((d) => (
                <button
                  key={d}
                  className={`db-tag ${destinations.includes(d) ? 'on' : ''}`}
                  onClick={() => toggleDestination(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="db-content">
          {soonest && (
            <div className="db-alert">
              <span>
                <strong>{soonest.name}</strong> closes in {daysUntil(soonest.deadline)} days — don't miss it.
              </span>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate(`/apply/${soonest.id}`) }}>View →</a>
            </div>
          )}

          <div className="db-header">
            <div>
              <div className="db-title">
                {firstName ? `Welcome back, ${firstName}` : 'Your matches'} <span className="db-title-count">{filtered.length}</span>
              </div>
              <div className="db-subtitle">Ranked by how well they fit you — updated automatically</div>
            </div>
            <div className="db-header-right">
              <RefreshButton onRefresh={() => { setRefreshKey((k) => k + 1); toast.push(`Refreshed — ${SCHOLARSHIPS.length} matches updated`, 'success') }} />
              <label className="db-search">
                <i className="ti ti-search" style={{ fontSize: 14, color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search by name, country, or organisation..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search scholarships"
                />
              </label>
              <select className="db-sort" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort by">
                <option value="match">Best match first</option>
                <option value="deadline">Deadline soonest</option>
                <option value="amount">Highest amount</option>
              </select>
            </div>
          </div>

          <div className="db-stats-row">
            <div className="db-stat-card">
              <div className="db-stat-num">{filtered.length}</div>
              <div className="db-stat-lbl">Total matches found</div>
            </div>
            <div className="db-stat-card">
              <div className="db-stat-num"><span>₦</span>12B+</div>
              <div className="db-stat-lbl">Combined funding available</div>
            </div>
            <div className="db-stat-card">
              <div className="db-stat-num">
                {urgent.length}<span className={urgent.length ? 'red' : ''} style={{ fontSize: 14, marginLeft: 6, color: urgent.length ? '#A32D2D' : 'var(--color-text-tertiary)' }}> {urgent.length ? 'urgent' : ''}</span>
              </div>
              <div className="db-stat-lbl">Closing within 30 days</div>
            </div>
          </div>

          {freshOnes.length > 0 && !loading && (
            <div className="db-fresh-section">
              <div className="db-fresh-label">Fresh for you — <span>{freshOnes.length} new since your last visit</span></div>
              <div className="db-cards">
                {freshOnes.map((s) => (
                  <Card
                    key={s.id}
                    s={s}
                    fresh
                    saved={saved.has(s.id)}
                    onSave={() => toggleSaved(s)}
                    onApply={() => applyTo(s)}
                  />
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div className="db-cards">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length > 0 ? (
            <div className="db-cards">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : mainGrid.length > 0 ? (
            <div className="db-cards">
              {mainGrid.map((s) => (
                <Card
                  key={s.id}
                  s={s}
                  saved={saved.has(s.id)}
                  onSave={() => toggleSaved(s)}
                  onApply={() => applyTo(s)}
                />
              ))}
            </div>
          ) : (
            <div className="db-empty">
              <div className="db-empty-icon"><i className="ti ti-search-off" aria-hidden="true" /></div>
              <div className="db-empty-title">No matches found for these filters</div>
              <div className="db-empty-body">Try adjusting your filters, or complete more of your profile to unlock additional results.</div>
              <button className="db-apply-btn" onClick={clearFilters}>Clear filters</button>
            </div>
          )}
        </main>
      </div>

      {panelFor && (
        <ScholarshipPanel
          scholarship={panelFor.scholarship}
          scrollToSection={panelFor.scrollTo}
          profile={storedProfile}
          onClose={() => setPanelFor(null)}
          onApply={() => { applyTo(panelFor.scholarship); setPanelFor(null) }}
          onAddToTracker={() => { toggleSaved(panelFor.scholarship); setPanelFor(null) }}
        />
      )}
    </div>
    </PullToRefresh>
  )
}

function Card({ s, saved, onSave, onApply, onWhy, fresh = false }) {
  const days = daysUntil(s.deadline)
  const dlTier = deadlineTier(days)
  return (
    <article
      className={`db-card ${s.featured ? 'featured' : ''} ${fresh ? 'fresh' : ''}`}
      onClick={onApply}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onApply() }}
    >
      {s.featured && <div className="db-featured-badge"><i className="ti ti-sparkles" style={{ fontSize: 10 }} aria-hidden="true" />Top match</div>}
      {fresh && !s.featured && <div className="db-fresh-badge">NEW</div>}
      <div className="db-card-header">
        <div className="db-card-org"><i className="ti ti-building" style={{ fontSize: 11 }} aria-hidden="true" />{s.org}</div>
        <div className={`db-match ${matchTier(s.match)}`}>{s.match}% match</div>
      </div>
      <div className="db-card-name">{s.name}</div>
      <div className="db-card-amount">{s.amount}</div>
      <div className="db-card-tags">
        {s.tags.map((t) => <span key={t} className="db-card-tag">{t}</span>)}
      </div>
      <div className="db-card-footer">
        <div className={`db-deadline ${dlTier === 'urgent' ? 'urgent' : dlTier === 'warn' ? 'warn' : ''}`}>
          <i className="ti ti-clock" style={{ fontSize: 11 }} aria-hidden="true" />{formatDeadline(s.deadline)}
        </div>
        <div className="db-card-actions">
          <button
            className={`db-saved-btn ${saved ? 'on' : ''}`}
            onClick={(e) => { e.stopPropagation(); onSave() }}
            aria-label={saved ? 'Remove from saved' : 'Save for later'}
          >
            <i className={`ti ${saved ? 'ti-bookmark-filled' : 'ti-bookmark'}`} style={{ fontSize: 12 }} aria-hidden="true" />
          </button>
          <button className="db-why-btn" onClick={(e) => { e.stopPropagation(); onWhy?.() }} aria-label="Why am I a fit?">
            <i className="ti ti-sparkles" style={{ fontSize: 11 }} aria-hidden="true" /> Why fit?
          </button>
          <button className="db-apply-btn" onClick={(e) => { e.stopPropagation(); onApply() }}>
            Apply <i className="ti ti-arrow-right" style={{ fontSize: 11 }} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  )
}
