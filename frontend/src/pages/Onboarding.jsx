import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Logo from '../components/Logo'
import { useSession } from '../lib/useSession'
import { useToast } from '../components/Toast'
import {
  getMockUser,
  isOnboardingComplete,
  markOnboardingComplete,
  isMockMode,
} from '../lib/mockAuth'
import { upsertProfile, setUserName, parseStudies, parseGpa } from '../lib/profileApi'
import { isSupabaseConfigured } from '../lib/supabase'
import { useSession } from '../lib/useSession'
import { upsertProfile, setUserName, parseStudies, parseGpa } from '../lib/profileApi'
import './Onboarding.css'

const STEPS = [
  { key: 'basics', label: 'Basics' },
  { key: 'academics', label: 'Academics' },
  { key: 'goals', label: 'Goals' },
  { key: 'background', label: 'Background' },
  { key: 'finances', label: 'Finances' },
  { key: 'wrap', label: 'Wrap up' },
]

// Each question is keyed by its target profile field. `step` indexes STEPS.
// `chips` / `multi` drive the quick-reply UI; `ai` is a string or a function
// of the in-progress profile.
function buildQuestions(signupName) {
  const greetingName = signupName ? signupName.split(' ')[0] : 'there'
  return [
    {
      key: 'name', step: 0,
      ai: `Hi ${greetingName}! I'm Scholar, your personal scholarship guide. I'll ask you a few quick questions to find scholarships you actually qualify for.\n\nLet's start — what should I call you? (You can use a nickname if you prefer.)`,
    },
    {
      key: 'nationality', step: 0,
      ai: (p) => `Nice to meet you, ${firstName(p.name) || greetingName}! What's your nationality? If you hold dual citizenship, mention both — it opens more options.`,
      chips: ['Nigerian', 'Ghanaian', 'Kenyan', 'South African', 'Other African', 'Non-African'],
    },
    {
      key: 'studies', step: 1,
      ai: "What are you currently studying? Tell me your degree, your university, and what year or level you're in.",
    },
    {
      key: 'gpa', step: 1,
      ai: "What's your current GPA or grade? Let me know if it's out of 4.0 or 5.0 — or just tell me your class (First Class, 2:1, etc.)",
    },
    {
      key: 'field', step: 1,
      ai: (p) => `Within ${p.studies ? shortDegree(p.studies) : 'your degree'}, what area interests you most? For example — software, AI, finance, public health, law. This helps me find field-specific scholarships.`,
    },
    {
      key: 'goal', step: 2,
      ai: 'Are you primarily looking to fund your current degree, or are you planning for postgraduate study abroad?',
      chips: [
        'Fund my current undergraduate degree',
        'Study abroad for a Masters',
        'Study abroad for a PhD',
        'Not sure yet — show me everything',
      ],
    },
    {
      key: 'destinations', step: 2,
      ai: 'Which countries are you most open to studying in? Pick as many as you like.',
      chips: ['UK', 'USA', 'Germany', 'Canada', 'Netherlands', 'France', 'Australia', 'Nigeria only', 'Open to anywhere'],
      multi: true,
    },
    {
      key: 'needBased', step: 4,
      ai: 'Some scholarships specifically support students with financial need — they often have less competition too. Would you like me to include those in your matches?',
      chips: ['Yes, include them', 'No, merit-based only', 'Not sure'],
    },
    {
      key: 'extras', step: 3,
      ai: 'Tell me a bit about yourself beyond academics. Any leadership roles, clubs, projects, competitions, or volunteer work? Even small things count — they open up leadership-focused scholarships.',
    },
    {
      key: 'languages', step: 3,
      ai: 'Last one — what languages do you speak? English is assumed, so just mention any others.',
    },
  ]
}

function firstName(name) {
  if (!name) return ''
  return String(name).trim().split(/\s+/)[0]
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

// Map a profile shape (keyed by question keys) → the Supabase profiles row.
function profilePatchFor(key, value) {
  switch (key) {
    case 'name': return null
    case 'nationality': return { nationality: value }
    case 'studies': return parseStudies(value)
    case 'gpa': return parseGpa(value)
    case 'field': return { field: value }
    case 'goal': return { goal: value }
    case 'destinations': return { destinations: Array.isArray(value) ? value : [value] }
    case 'needBased': return { need_based: /^yes/i.test(String(value)) }
    case 'extras': return { extras: value }
    case 'languages': return { languages: String(value).split(/[,;]+/).map((s) => s.trim()).filter(Boolean) }
    default: return null
  }
}

// Mock-mode profile shape persisted to localStorage as sm_mock_profile.
function profileToStorageShape(profile, signupUser) {
  return {
    name: profile.name || signupUser?.name || '',
    email: signupUser?.email || '',
    nationality: profile.nationality || '',
    studies: profile.studies || '',
    university: parseStudies(profile.studies || '').university || '',
    degree: parseStudies(profile.studies || '').degree || profile.studies || '',
    level: parseStudies(profile.studies || '').level || '',
    gpa: parseGpa(profile.gpa || '').gpa || '',
    gpaScale: parseGpa(profile.gpa || '').gpa_scale || 5,
    field: profile.field || '',
    goal: profile.goal || '',
    destinations: Array.isArray(profile.destinations) ? profile.destinations : (profile.destinations ? [profile.destinations] : []),
    needBased: /^yes/i.test(String(profile.needBased || '')),
    extras: profile.extras || '',
    languages: profile.languages || '',
    newMatches: true,
    deadlines: true,
    weeklyDigest: false,
  }
}

// Map an in-memory question key to the matching `public.profiles` columns.
// Returns an object that can be passed directly to upsertProfile.
function profilePatchFor(key, value) {
  switch (key) {
    case 'name':
      return null // handled separately (writes to users.name)
    case 'nationality':
      return { nationality: value }
    case 'studies':
      return parseStudies(value)
    case 'gpa':
      return parseGpa(value)
    case 'field':
      return { field: value }
    case 'goal':
      return { goal: value }
    case 'destinations':
      return { destinations: Array.isArray(value) ? value : [value] }
    case 'needBased':
      return { need_based: /^yes/i.test(String(value)) }
    case 'extras':
      return { extras: value }
    case 'languages':
      return { languages: String(value).split(/[,;]+/).map((s) => s.trim()).filter(Boolean) }
    default:
      return null
  }
}

export default function Onboarding() {
  const navigate = useNavigate()
  const { user } = useSession()
  const bodyRef = useRef(null)
  const inputRef = useRef(null)

  // Pull the signup name so Scholar can greet by name from message 1.
  const signupUser = (isMockMode() || !user?.email) ? getMockUser() : user
  const QUESTIONS = useRef(buildQuestions(signupUser?.name || user?.user_metadata?.full_name || '')).current

  const [messages, setMessages] = useState(() => [
    { role: 'ai', text: typeof QUESTIONS[0].ai === 'string' ? QUESTIONS[0].ai : QUESTIONS[0].ai({}), qKey: QUESTIONS[0].key },
  ])
  const [profile, setProfile] = useState({})
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(false)
  const [multiSelection, setMultiSelection] = useState([])
  const [finished, setFinished] = useState(false)

  // Already onboarded? Don't re-run the flow — push straight to dashboard.
  useEffect(() => {
    if (isOnboardingComplete()) navigate('/dashboard', { replace: true })
  }, [navigate])

  const answered = Object.keys(profile).length
  const TOTAL_Q = QUESTIONS.length
  const pct = finished ? 100 : Math.min(100, Math.round((answered / TOTAL_Q) * 100))
  const stepIdx = answered >= TOTAL_Q ? STEPS.length - 1 : (QUESTIONS[answered]?.step ?? 0)

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

  function pushUser(text) { setMessages((m) => [...m, { role: 'user', text }]) }
  function pushAi(text, extras = {}) { setMessages((m) => [...m, { role: 'ai', text, ...extras }]) }

  function lockLastChips() {
    setMessages((m) => {
      const next = [...m]
      for (let i = next.length - 1; i >= 0; i--) {
        if (next[i].chips && !next[i].locked) { next[i] = { ...next[i], locked: true }; break }
      }
      return next
    })
  }

  async function finish(nextProfile) {
    const name = firstName(nextProfile.name) || firstName(signupUser?.name) || 'there'
    pushAi(`Perfect, ${name} — I have everything I need. Here's your profile.`, { snapshot: nextProfile })
    await wait(900)
    pushAi(`I'm scanning 2,400+ scholarships against your profile now...`)
    await wait(1500)
    const matches = 40 + Math.floor(Math.random() * 141) // 40–180
    pushAi(`Done! I found ${matches} scholarships that fit your profile. Let's go see them. 🎓`, {
      cta: { label: 'See my matches', to: '/dashboard' },
    })

    // Persist mock profile + flip the onboarding flag so the dashboard is unblocked.
    const stored = profileToStorageShape(nextProfile, signupUser)
    markOnboardingComplete(stored)

    // If a real Supabase user is signed in, also persist upstream.
    if (!isMockMode() && isSupabaseConfigured && user?.id) {
      if (nextProfile.name) setUserName(user.id, nextProfile.name)
      const patches = ['nationality', 'studies', 'gpa', 'field', 'goal', 'destinations', 'needBased', 'extras', 'languages']
      for (const k of patches) {
        const patch = profilePatchFor(k, nextProfile[k])
        if (patch) upsertProfile(user.id, patch)
      }
    }

    setFinished(true)
    toast.push(`Welcome aboard, ${name}!`, 'success')
    window.setTimeout(() => navigate('/dashboard'), 2400)
  }

  async function advance(answerText, value) {
    const currentIdx = answered
    const currentQ = QUESTIONS[currentIdx]
    if (!currentQ) return

    lockLastChips()
    pushUser(answerText)

    const finalValue = value ?? answerText
    const nextProfile = { ...profile, [currentQ.key]: finalValue }
    setProfile(nextProfile)

    // Persist immediately so the user can leave mid-onboarding and pick up
    // exactly where they were.
    if (user?.id) {
      if (currentQ.key === 'name') {
        setUserName(user.id, finalValue)
      } else {
        const patch = profilePatchFor(currentQ.key, finalValue)
        if (patch) upsertProfile(user.id, patch)
      }
    }

    const nextIdx = currentIdx + 1
    setTyping(true)
    await wait(900 + Math.random() * 400)
    setTyping(false)

    if (nextIdx < QUESTIONS.length) {
      const nextQ = QUESTIONS[nextIdx]
      const text = typeof nextQ.ai === 'function' ? nextQ.ai(nextProfile) : nextQ.ai
      pushAi(text, { qKey: nextQ.key, chips: nextQ.chips, multi: nextQ.multi })
      setMultiSelection([])
    } else {
      await finish(nextProfile)
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
    advance(multiSelection.join(', '), multiSelection.slice())
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
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

function Message({ msg, idx, multiSelection, onChip, onMultiConfirm, onCta }) {
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
                <button key={c} className={`ob-chip ${selected ? 'selected' : ''}`} onClick={() => onChip(idx, c)} disabled={msg.locked}>
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
      </div>
    </div>
  )
}

function wait(ms) { return new Promise((r) => window.setTimeout(r, ms)) }
