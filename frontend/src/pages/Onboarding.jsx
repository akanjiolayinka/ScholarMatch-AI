import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Logo from '../components/Logo'
import { isSupabaseConfigured } from '../lib/supabase'
import './Onboarding.css'

const STEPS = [
  { key: 'basics', label: 'Basics' },
  { key: 'academics', label: 'Academics' },
  { key: 'goals', label: 'Goals' },
  { key: 'background', label: 'Background' },
  { key: 'finances', label: 'Finances' },
  { key: 'documents', label: 'Documents' },
]

// Each question may include chips. `key` stores the answer on the profile.
// `step` maps to STEPS index. `parse` extracts structured fields from text.
const QUESTIONS = [
  {
    key: 'name',
    step: 0,
    ai: "Welcome! I'm Scholar — your personal scholarship guide. I'll ask you a series of questions to understand your background and what you're looking for. Then I'll match you to every scholarship you actually qualify for.\n\nThis takes about 5 minutes. Let's start — what's your full name?",
  },
  {
    key: 'nationality',
    step: 0,
    ai: (p) => `Nice to meet you, ${firstName(p.name) || 'there'}! And what's your nationality? If you hold dual citizenship, mention both — it opens more options.`,
  },
  {
    key: 'studies',
    step: 1,
    ai: (p) => `Great — being ${p.nationality || 'where you are'} opens up a solid range of both local and international scholarships. What are you currently studying? Tell me your degree, your university, and what year or level you're in.`,
  },
  {
    key: 'gpa',
    step: 1,
    ai: "What's your current GPA or grade? Let me know whether it's out of 4.0 or 5.0 — or just describe your performance (first class, second class upper, etc.).",
  },
  {
    key: 'field',
    step: 1,
    ai: (p) => `Within ${p.studies ? shortDegree(p.studies) : 'your degree'}, what specific area interests you most? For example — software, hardware, AI, networks? This helps me find field-specific scholarships.`,
  },
  {
    key: 'goal',
    step: 2,
    ai: 'Are you primarily looking to fund your current undergraduate degree, or are you planning for postgraduate abroad?',
    chips: ['Fund my current degree', 'Study abroad for masters', 'Study abroad for PhD', "Not sure yet — show me everything"],
  },
  {
    key: 'destinations',
    step: 2,
    ai: 'Which countries are you most open to studying in? Pick as many as you like.',
    chips: ['UK', 'USA', 'Germany', 'Canada', 'Netherlands', 'France', 'Australia', 'Nigeria only', 'Open to anywhere'],
    multi: true,
  },
  {
    key: 'needBased',
    step: 4,
    ai: 'Some scholarships prioritise students with demonstrated financial need — they often have less competition too. Would you like me to include those in your matches?',
    chips: ['Yes, include them', 'No, merit-based only', 'Not sure'],
  },
  {
    key: 'extras',
    step: 3,
    ai: 'Tell me a bit about yourself beyond academics. Any leadership roles, clubs, projects, volunteer work, or competitions? Even small things count.',
  },
  {
    key: 'languages',
    step: 3,
    ai: 'Last one — what languages do you speak? English is assumed, so mention any others.',
  },
]

const TOTAL_Q = QUESTIONS.length

function firstName(name) {
  if (!name) return ''
  return name.trim().split(/\s+/)[0]
}

function shortDegree(text) {
  if (!text) return 'your degree'
  const t = text.toLowerCase()
  if (t.includes('engineering')) return 'engineering'
  if (t.includes('computer') || t.includes('cs')) return 'computer science'
  if (t.includes('medicine') || t.includes('med')) return 'medicine'
  if (t.includes('law')) return 'law'
  if (t.includes('business') || t.includes('econ')) return 'business and econ'
  return 'your degree'
}

function progressPct(answered) {
  // Each answered question contributes ~16% (6 sections), capped per step ratio
  return Math.min(100, Math.round((answered / TOTAL_Q) * 100))
}

function activeStepIndex(answered) {
  if (answered >= TOTAL_Q) return STEPS.length - 1
  const q = QUESTIONS[answered]
  return q ? q.step : 0
}

function aiText(q, profile) {
  return typeof q.ai === 'function' ? q.ai(profile) : q.ai
}

export default function Onboarding() {
  const navigate = useNavigate()
  const bodyRef = useRef(null)
  const inputRef = useRef(null)

  // messages: { role: 'ai'|'user', text, chips?, multi?, qKey?, locked? }
  const [messages, setMessages] = useState(() => [
    { role: 'ai', text: aiText(QUESTIONS[0], {}), qKey: QUESTIONS[0].key },
  ])
  const [profile, setProfile] = useState({})
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(false)
  const [multiSelection, setMultiSelection] = useState([])
  const [finished, setFinished] = useState(false)

  const answered = Object.keys(profile).length
  const pct = finished ? 100 : progressPct(answered)
  const stepIdx = activeStepIndex(answered)

  useEffect(() => {
    const el = bodyRef.current
    if (!el) return
    const id = window.setTimeout(() => { el.scrollTop = el.scrollHeight }, 60)
    return () => window.clearTimeout(id)
  }, [messages, typing])

  function autoResize(el) {
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 140) + 'px'
  }

  function pushUser(text) {
    setMessages((m) => [...m, { role: 'user', text }])
  }

  function pushAi(text, extras = {}) {
    setMessages((m) => [...m, { role: 'ai', text, ...extras }])
  }

  function lockLastChips() {
    setMessages((m) => {
      const next = [...m]
      for (let i = next.length - 1; i >= 0; i--) {
        if (next[i].chips && !next[i].locked) {
          next[i] = { ...next[i], locked: true }
          break
        }
      }
      return next
    })
  }

  async function advance(answerText, value) {
    const currentIdx = answered
    const currentQ = QUESTIONS[currentIdx]
    if (!currentQ) return

    lockLastChips()
    pushUser(answerText)

    const nextProfile = { ...profile, [currentQ.key]: value ?? answerText }
    setProfile(nextProfile)

    const nextIdx = currentIdx + 1
    setTyping(true)
    await wait(900 + Math.random() * 400)
    setTyping(false)

    if (nextIdx < QUESTIONS.length) {
      const nextQ = QUESTIONS[nextIdx]
      pushAi(aiText(nextQ, nextProfile), {
        qKey: nextQ.key,
        chips: nextQ.chips,
        multi: nextQ.multi,
      })
      setMultiSelection([])
    } else {
      // Completion sequence
      const name = firstName(nextProfile.name) || 'there'
      pushAi(`Perfect, ${name} — I have everything I need. Here's your profile snapshot.`, { snapshot: nextProfile })
      await wait(1400)
      setTyping(true)
      await wait(1600)
      setTyping(false)
      const matches = 200 + Math.floor(Math.random() * 80)
      pushAi(`Done. I found ${matches} scholarships that match your profile. Let's go see them.`, {
        cta: { label: 'See my matches', to: '/dashboard' },
      })
      setFinished(true)
      // Auto-redirect after a beat
      window.setTimeout(() => navigate('/dashboard'), 2400)
    }
  }

  function handleSend() {
    const text = draft.trim()
    if (!text || typing || finished) return
    setDraft('')
    if (inputRef.current) inputRef.current.style.height = 'auto'
    advance(text, text)
  }

  function handleChip(msgIdx, value) {
    const msg = messages[msgIdx]
    if (!msg || msg.locked || typing || finished) return
    if (msg.multi) {
      setMultiSelection((sel) => sel.includes(value) ? sel.filter((v) => v !== value) : [...sel, value])
      return
    }
    advance(value, value)
  }

  function handleMultiConfirm() {
    if (multiSelection.length === 0 || typing || finished) return
    const text = multiSelection.join(', ')
    advance(text, multiSelection.slice())
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="ob-root">
      <h2 className="sr-only">ScholarMatch AI onboarding — building your profile</h2>

      <div className="ob-topbar">
        <Link to="/" aria-label="Home"><Logo size={28} textSize={15} /></Link>
        <div className="ob-progress-wrap">
          <div className="ob-progress-label">
            <span>Building your profile</span>
            <span>{pct}%</span>
          </div>
          <div className="ob-progress-bar"><div className="ob-progress-fill" style={{ width: `${pct}%` }} /></div>
        </div>
        <div className="ob-save">
          <i className="ti ti-device-floppy" style={{ fontSize: 14 }} aria-hidden="true" /> Auto-saved
        </div>
      </div>

      {!isSupabaseConfigured && (
        <div className="ob-banner">
          Supabase isn't configured — your answers stay in this tab only. Add <code>VITE_SUPABASE_URL</code> + <code>VITE_SUPABASE_ANON_KEY</code> to persist.
        </div>
      )}

      <div className="ob-steps" role="tablist" aria-label="Onboarding sections">
        {STEPS.map((s, i) => {
          const cls = i < stepIdx ? 'done' : i === stepIdx ? 'active' : ''
          return (
            <button key={s.key} className={`ob-step ${cls}`} role="tab" aria-selected={i === stepIdx}>
              <span className="ob-step-dot">
                {i < stepIdx ? <i className="ti ti-check" style={{ fontSize: 10 }} aria-hidden="true" /> : i + 1}
              </span>
              {s.label}
            </button>
          )
        })}
      </div>

      <div className="ob-body" ref={bodyRef}>
        {messages.map((m, i) => (
          <Message
            key={i}
            msg={m}
            idx={i}
            profile={profile}
            multiSelection={multiSelection}
            onChip={handleChip}
            onMultiConfirm={handleMultiConfirm}
            onCta={(to) => navigate(to)}
          />
        ))}
        {typing && (
          <div className="ob-msg">
            <div className="ob-avatar">S</div>
            <div className="ob-typing" aria-label="Scholar is typing">
              <div className="ob-dot" /><div className="ob-dot" /><div className="ob-dot" />
            </div>
          </div>
        )}
      </div>

      <div className="ob-hint">
        {finished ? 'Redirecting to your matches…' : 'Choose an option above or type your answer below'}
      </div>
      <div className="ob-input-row">
        <div className="ob-input-inner">
          <textarea
            ref={inputRef}
            className="ob-input"
            rows={1}
            placeholder="Type your answer or choose an option above"
            value={draft}
            onChange={(e) => { setDraft(e.target.value); autoResize(e.target) }}
            onKeyDown={handleKey}
            disabled={typing || finished}
            aria-label="Your answer"
          />
          <button className="ob-send" onClick={handleSend} disabled={typing || finished || !draft.trim()} aria-label="Send">
            <i className="ti ti-send" style={{ fontSize: 16, color: '#F5A623' }} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}

function Message({ msg, idx, profile, multiSelection, onChip, onMultiConfirm, onCta }) {
  if (msg.role === 'user') {
    return (
      <div className="ob-msg user">
        <div className="ob-avatar user"><i className="ti ti-user" style={{ fontSize: 14 }} aria-hidden="true" /></div>
        <div className="ob-bubble-wrap"><div className="ob-bubble user">{msg.text}</div></div>
      </div>
    )
  }
  return (
    <div className="ob-msg">
      <div className="ob-avatar">S</div>
      <div className="ob-bubble-wrap">
        <div className="ob-bubble-name">Scholar</div>
        <div className="ob-bubble ai">{msg.text}</div>

        {msg.chips && (
          <div className="ob-chips">
            {msg.chips.map((c) => {
              const selected = msg.multi ? multiSelection.includes(c) : false
              return (
                <button
                  key={c}
                  className={`ob-chip ${selected ? 'selected' : ''}`}
                  onClick={() => onChip(idx, c)}
                  disabled={msg.locked}
                >
                  {c}
                </button>
              )
            })}
            {msg.multi && !msg.locked && (
              <button
                className="ob-chip"
                onClick={onMultiConfirm}
                disabled={multiSelection.length === 0}
                style={{ background: '#0A0E2A', color: '#F5A623', borderColor: '#0A0E2A' }}
              >
                Continue ({multiSelection.length})
                <i className="ti ti-arrow-right" style={{ fontSize: 12 }} aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        {msg.snapshot && <Snapshot profile={msg.snapshot} />}

        {msg.cta && (
          <div className="ob-chips">
            <button className="ob-chip" onClick={() => onCta(msg.cta.to)} style={{ background: '#0A0E2A', color: '#F5A623', borderColor: '#0A0E2A' }}>
              {msg.cta.label}
              <i className="ti ti-sparkles" style={{ fontSize: 12 }} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Snapshot({ profile }) {
  const dest = Array.isArray(profile.destinations) ? profile.destinations.join(', ') : (profile.destinations || '—')
  const rows = [
    ['Name', profile.name || '—'],
    ['Nationality', profile.nationality || '—'],
    ['Degree & university', profile.studies || '—'],
    ['GPA', profile.gpa || '—'],
    ['Field of focus', profile.field || '—'],
    ['Goal', profile.goal || '—'],
    ['Destinations', dest],
    ['Financial need', profile.needBased || '—'],
    ['Languages', profile.languages || '—'],
  ]
  return (
    <div className="ob-card-insight">
      <div className="ob-card-insight-title">
        <i className="ti ti-user-check" style={{ fontSize: 13 }} aria-hidden="true" /> Profile snapshot
      </div>
      <div className="ob-insight-rows">
        {rows.map(([k, v]) => (
          <div className="ob-insight-row" key={k}>
            <span className="ob-insight-key">{k}</span>
            <span className="ob-insight-val">{v}</span>
          </div>
        ))}
        <div className="ob-insight-row">
          <span className="ob-insight-key">Potential matches</span>
          <span className="ob-insight-val calc">Calculating…</span>
        </div>
      </div>
    </div>
  )
}

function wait(ms) { return new Promise((r) => window.setTimeout(r, ms)) }
