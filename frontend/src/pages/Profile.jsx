import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppNav from '../components/AppNav'
import './Profile.css'

const GOALS = ['Fund undergrad', 'Postgrad abroad', 'PhD', 'All']
const DESTINATIONS = ['UK', 'USA', 'Germany', 'Canada', 'Netherlands', 'France', 'Australia', 'Nigeria', 'Open to anywhere']

const INITIAL = {
  name: 'Temi Adeyemi',
  university: 'University of Lagos',
  degree: 'Computer Engineering',
  level: '300 level',
  gpa: '4.3',
  gpaScale: '5',
  field: 'Software engineering',
  nationality: 'Nigerian',
  dob: '',
  languages: 'English, Yoruba',
  goal: 'Postgrad abroad',
  destinations: ['UK', 'Germany'],
  extras: 'Technical lead, UNILAG Faculty Innovation Club. Mentored 12 juniors in programming.',
  projects: 'NFC Smart Attendance System (deployed across 3 departments). Budget Tracker App (200+ active users).',
  needBased: true,
  email: 'dolapo.icon@gmail.com',
  newMatches: true,
  deadlines: true,
  weeklyDigest: false,
}

const REQUIRED = ['name', 'university', 'degree', 'gpa', 'field', 'nationality', 'goal', 'extras']

function computeCompletion(p) {
  let filled = 0
  for (const k of REQUIRED) {
    const v = p[k]
    if (typeof v === 'string' ? v.trim() : v) filled += 1
  }
  if (p.destinations && p.destinations.length) filled += 1
  if (p.languages && p.languages.trim()) filled += 1
  const total = REQUIRED.length + 2
  return Math.round((filled / total) * 100)
}

function initialsFrom(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
}

export default function Profile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(INITIAL)
  const [dirty, setDirty] = useState(false)
  const [toast, setToast] = useState('')

  const completion = useMemo(() => computeCompletion(profile), [profile])
  const initials = useMemo(() => initialsFrom(profile.name) || 'TA', [profile.name])

  function update(k, v) {
    setProfile((p) => ({ ...p, [k]: v }))
    setDirty(true)
  }
  function toggleDest(d) {
    setProfile((p) => ({
      ...p,
      destinations: p.destinations.includes(d) ? p.destinations.filter((x) => x !== d) : [...p.destinations, d],
    }))
    setDirty(true)
  }
  function setGoal(g) {
    setProfile((p) => ({ ...p, goal: g }))
    setDirty(true)
  }

  function showToast(msg) {
    setToast(msg)
    window.setTimeout(() => setToast(''), 2400)
  }

  function save() {
    // Persist to Supabase: supabase.from('profiles').upsert({ user_id, ...profile })
    setDirty(false)
    showToast('Profile saved — re-running your matches now.')
  }

  function saveNotifs() {
    setDirty(false)
    showToast('Preferences saved.')
  }

  return (
    <div className="pf-root">
      <AppNav initials={initials} />

      <header className="pf-header">
        <div className="pf-avatar">{initials}</div>
        <div className="pf-header-info">
          <div className="pf-name">
            {profile.name}
            <button className="pf-name-edit" aria-label="Edit name"><i className="ti ti-pencil" style={{ fontSize: 14 }} aria-hidden="true" /></button>
          </div>
          <div className="pf-sub">{profile.university} · {profile.degree} · Joined June 2026</div>
        </div>
        <div className="pf-completion">
          <div className="pf-completion-label"><span>Profile {completion}% complete</span></div>
          <div className="pf-comp-bar"><div className="pf-comp-fill" style={{ width: `${completion}%` }} /></div>
          {completion < 100 && (
            <button className="pf-comp-nudge" onClick={() => document.getElementById('pf-academics')?.scrollIntoView({ behavior: 'smooth' })}>
              Complete your profile to unlock more matches →
            </button>
          )}
        </div>
      </header>

      <div className="pf-body">
        <section className="pf-section" id="pf-academics">
          <div className="pf-section-title">Academic details</div>
          <div className="pf-section-sub">What you're studying — used to find field-specific scholarships.</div>
          <div className="pf-grid">
            <Field label="University">
              <input className="pf-input" value={profile.university} onChange={(e) => update('university', e.target.value)} />
            </Field>
            <Field label="Degree">
              <input className="pf-input" value={profile.degree} onChange={(e) => update('degree', e.target.value)} />
            </Field>
            <Field label="Level / Year">
              <input className="pf-input" value={profile.level} onChange={(e) => update('level', e.target.value)} />
            </Field>
            <Field label="Field of study">
              <input className="pf-input" value={profile.field} onChange={(e) => update('field', e.target.value)} placeholder="Software, AI, hardware..." />
            </Field>
            <Field label="GPA">
              <input className="pf-input" value={profile.gpa} onChange={(e) => update('gpa', e.target.value)} />
            </Field>
            <Field label="GPA scale">
              <select className="pf-select" value={profile.gpaScale} onChange={(e) => update('gpaScale', e.target.value)}>
                <option value="4">Out of 4.0</option>
                <option value="5">Out of 5.0</option>
              </select>
            </Field>
          </div>
        </section>

        <section className="pf-section">
          <div className="pf-section-title">Personal details</div>
          <div className="pf-section-sub">Used to verify eligibility — never shared publicly.</div>
          <div className="pf-grid">
            <Field label="Full name">
              <input className="pf-input" value={profile.name} onChange={(e) => update('name', e.target.value)} />
            </Field>
            <Field label="Nationality">
              <input className="pf-input" value={profile.nationality} onChange={(e) => update('nationality', e.target.value)} />
            </Field>
            <Field label="Date of birth (optional)">
              <input className="pf-input" type="date" value={profile.dob} onChange={(e) => update('dob', e.target.value)} />
            </Field>
            <Field label="Languages spoken">
              <input className="pf-input" value={profile.languages} onChange={(e) => update('languages', e.target.value)} placeholder="English, Yoruba..." />
            </Field>
          </div>
        </section>

        <section className="pf-section">
          <div className="pf-section-title">Goals & destinations</div>
          <div className="pf-section-sub">What you're aiming for — used to rank matches.</div>
          <Field label="Scholarship goal">
            <div className="pf-chips">
              {GOALS.map((g) => (
                <button key={g} className={`pf-chip ${profile.goal === g ? 'on' : ''}`} onClick={() => setGoal(g)} type="button">{g}</button>
              ))}
            </div>
          </Field>
          <div style={{ height: 14 }} />
          <Field label="Preferred destinations">
            <div className="pf-chips">
              {DESTINATIONS.map((d) => (
                <button key={d} className={`pf-chip ${profile.destinations.includes(d) ? 'on' : ''}`} onClick={() => toggleDest(d)} type="button">{d}</button>
              ))}
            </div>
          </Field>
        </section>

        <section className="pf-section">
          <div className="pf-section-title">Background</div>
          <div className="pf-section-sub">The things that make you stand out beyond grades.</div>
          <div className="pf-grid">
            <Field label="Extracurricular activities & leadership" className="full">
              <textarea className="pf-textarea" rows={3} value={profile.extras} onChange={(e) => update('extras', e.target.value)} />
            </Field>
            <Field label="Notable projects or achievements" className="full">
              <textarea className="pf-textarea" rows={3} value={profile.projects} onChange={(e) => update('projects', e.target.value)} />
            </Field>
            <Field label="Financial need" className="full">
              <div className="pf-bool-row">
                <button type="button" className={`pf-bool ${profile.needBased === true ? 'on' : ''}`} onClick={() => update('needBased', true)}>Yes — include need-based scholarships</button>
                <button type="button" className={`pf-bool ${profile.needBased === false ? 'on' : ''}`} onClick={() => update('needBased', false)}>No — merit-based only</button>
              </div>
            </Field>
          </div>
        </section>

        <section className="pf-section">
          <div className="pf-section-title">Notification preferences</div>
          <div className="pf-section-sub">Choose what Scholar sends you and where.</div>

          <Field label="Email address">
            <input className="pf-input" type="email" value={profile.email} onChange={(e) => update('email', e.target.value)} />
          </Field>

          <div style={{ marginTop: 12 }}>
            <Toggle
              title="New match alerts"
              desc="Get notified when new scholarships match your profile."
              checked={profile.newMatches}
              onChange={(v) => update('newMatches', v)}
            />
            <Toggle
              title="Deadline reminders"
              desc="We'll remind you 14 days and 3 days before each deadline."
              checked={profile.deadlines}
              onChange={(v) => update('deadlines', v)}
            />
            <Toggle
              title="Weekly digest"
              desc="A summary of your top matches and upcoming deadlines every Monday."
              checked={profile.weeklyDigest}
              onChange={(v) => update('weeklyDigest', v)}
            />
          </div>

          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="pf-btn-outline" onClick={saveNotifs}>Save preferences</button>
          </div>
        </section>
      </div>

      <div className="pf-save-bar">
        <div className="pf-save-info">
          {dirty ? <><strong>Unsaved changes.</strong> Saving will re-run your matches.</> : <>All changes saved.</>}
        </div>
        <div className="pf-save-actions">
          <button className="pf-btn-outline" onClick={() => navigate('/dashboard')}>Back to matches</button>
          <button className="pf-btn-primary" onClick={save} disabled={!dirty}>
            <i className="ti ti-device-floppy" style={{ fontSize: 14 }} aria-hidden="true" />
            Save & re-run matching
          </button>
        </div>
      </div>

      {toast && (
        <div className="pf-toast" role="status">
          <i className="ti ti-check" aria-hidden="true" /> {toast}
        </div>
      )}
    </div>
  )
}

function Field({ label, children, className = '' }) {
  return (
    <label className={`pf-field ${className}`}>
      <span className="pf-label">{label}</span>
      {children}
    </label>
  )
}

function Toggle({ title, desc, checked, onChange }) {
  return (
    <div className="pf-toggle-row">
      <div className="pf-toggle-info">
        <div className="pf-toggle-title">{title}</div>
        <div className="pf-toggle-desc">{desc}</div>
      </div>
      <label className="pf-toggle">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="pf-toggle-slider" />
      </label>
    </div>
  )
}
