import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import './Landing.css'

const SAMPLE_MATCHES = [
  {
    org: 'MasterCard Foundation',
    name: 'Scholars Program — African Universities',
    amount: 'Full funding',
    match: '98% match',
    deadline: 'Dec 15, 2025',
  },
  {
    org: 'UK Government',
    name: 'Chevening Scholarship 2025/26',
    amount: '£18,000 / yr',
    match: '91% match',
    deadline: 'Nov 5, 2025',
  },
  {
    org: 'DAAD Germany',
    name: 'Development-Related Postgraduate Courses',
    amount: '€934 / month',
    match: '87% match',
    deadline: 'Oct 31, 2025',
  },
]

const FEATURES = [
  {
    icon: 'ti-brain',
    bg: '#E6F1FB',
    color: '#185FA5',
    title: 'AI profile interview',
    desc: 'A natural conversation that learns your academic background, goals, and strengths. No long forms. No guessing. Just talk.',
  },
  {
    icon: 'ti-target',
    bg: '#FAEEDA',
    color: '#854F0B',
    title: 'Precision matching',
    desc: 'We score every scholarship in our database against your actual profile — nationality, GPA, field, goals — and rank them by fit.',
  },
  {
    icon: 'ti-file-text',
    bg: '#E1F5EE',
    color: '#0F6E56',
    title: 'Application drafts',
    desc: 'One click generates a tailored personal statement, CV, or cover letter for any scholarship. Scholar knows your profile — so it writes like you.',
  },
  {
    icon: 'ti-layout-kanban',
    bg: '#EEEDFE',
    color: '#534AB7',
    title: 'Application tracker',
    desc: 'A clean kanban board to track every application from saved to result. Deadline reminders built in so you never miss a close date.',
  },
]

const STEPS = [
  {
    title: 'Tell us about yourself',
    desc: 'Chat with Scholar — our AI — for about 5 minutes. It asks about your academics, goals, nationality, and what kind of opportunity you’re looking for. No forms. Just conversation.',
  },
  {
    title: 'See your matched scholarships',
    desc: 'We instantly scan thousands of scholarships and rank them by how well they match your actual profile. You see a fit score, funding amount, and deadline for every one.',
  },
  {
    title: 'Apply with AI support',
    desc: 'Pick any scholarship and Scholar drafts your personal statement, CV, and cover letter in seconds — tailored specifically to that scholarship’s requirements and values.',
  },
]

export default function Landing() {
  const navigate = useNavigate()
  const goAuth = () => navigate('/auth')

  return (
    <div className="sm-wrap">
      <h2 className="sr-only">ScholarMatch AI — find scholarships that fit you</h2>

      <nav className="sm-nav">
        <Logo size={32} textSize={17} />
        <div className="sm-nav-links">
          <span>How it works</span>
          <span>Scholarships</span>
          <span>About</span>
        </div>
        <button className="sm-nav-cta" onClick={goAuth}>Get started free</button>
      </nav>

      <section className="sm-hero">
        <div className="sm-badge">
          <i className="ti ti-sparkles" style={{ fontSize: 13 }} aria-hidden="true" />
          AI-powered scholarship matching
        </div>
        <h1 className="sm-h1">Find scholarships that <span>actually fit you</span></h1>
        <p className="sm-sub">
          Tell us about yourself once. Our AI matches you to scholarships you qualify for —
          then helps you write the CV, personal statement, and cover letter to win them.
        </p>
        <div className="sm-cta-row">
          <button className="sm-btn-primary" onClick={goAuth}>
            Start my profile — it's free
            <i className="ti ti-arrow-right" style={{ fontSize: 15 }} aria-hidden="true" />
          </button>
          <button className="sm-btn-secondary">See how it works</button>
        </div>
        <div className="sm-cta-note">No credit card. Takes 5 minutes.</div>
      </section>

      <div className="sm-stats">
        <div className="sm-stat"><div className="sm-stat-num">2,400<span>+</span></div><div className="sm-stat-label">Scholarships in database</div></div>
        <div className="sm-stat"><div className="sm-stat-num">₦<span>8B+</span></div><div className="sm-stat-label">Total funding available</div></div>
        <div className="sm-stat"><div className="sm-stat-num">94<span>%</span></div><div className="sm-stat-label">Match accuracy rate</div></div>
        <div className="sm-stat"><div className="sm-stat-num">12k<span>+</span></div><div className="sm-stat-label">Students matched</div></div>
      </div>

      <div className="sm-divider" />

      <section className="sm-cards-section">
        <div className="sm-section-label">Sample matches — based on a Nigerian engineering student</div>
        <div className="sm-cards">
          {SAMPLE_MATCHES.map((s) => (
            <div className="sm-card" key={s.name} onClick={goAuth} role="button" tabIndex={0}>
              <div className="sm-card-top">
                <div className="sm-card-org">{s.org}</div>
                <div className="sm-match-badge">{s.match}</div>
              </div>
              <div className="sm-card-name">{s.name}</div>
              <div className="sm-card-amount">{s.amount}</div>
              <div className="sm-card-footer">
                <div className="sm-card-deadline">
                  <i className="ti ti-clock" style={{ fontSize: 12 }} aria-hidden="true" /> {s.deadline}
                </div>
                <div className="sm-card-apply">
                  Apply <i className="ti ti-arrow-right" style={{ fontSize: 11 }} aria-hidden="true" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="sm-features">
        <div className="sm-section-title">Everything you need to win a scholarship</div>
        <div className="sm-section-sub">From discovery to submitted application — all in one place.</div>
        <div className="sm-features-grid">
          {FEATURES.map((f) => (
            <div className="sm-feature" key={f.title}>
              <div className="sm-feature-icon" style={{ background: f.bg }}>
                <i className={`ti ${f.icon}`} style={{ color: f.color, fontSize: 18 }} aria-hidden="true" />
              </div>
              <div className="sm-feature-title">{f.title}</div>
              <div className="sm-feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="sm-how">
        <div className="sm-section-title">Three steps from sign-up to application-ready</div>
        <div className="sm-section-sub">Most students are fully matched within 10 minutes of signing up.</div>
        <div className="sm-how-grid">
          <div>
            {STEPS.map((step, i) => (
              <div className="sm-step" key={step.title}>
                <div className="sm-step-num">{i + 1}</div>
                <div>
                  <div className="sm-step-title">{step.title}</div>
                  <div className="sm-step-desc">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="sm-chat-preview">
              <div className="sm-msg">
                <div className="sm-avatar">S</div>
                <div className="sm-bubble ai">Hi! I'm Scholar. I'll ask you a few quick questions to find your best matches. What's your name?</div>
              </div>
              <div className="sm-msg user">
                <div className="sm-bubble user">Temi Adeyemi</div>
              </div>
              <div className="sm-msg">
                <div className="sm-avatar">S</div>
                <div className="sm-bubble ai">Great to meet you, Temi! What are you currently studying and where?</div>
              </div>
              <div className="sm-msg user">
                <div className="sm-bubble user">Computer Engineering at UNILAG. 300 level, GPA 4.3.</div>
              </div>
              <div className="sm-msg">
                <div className="sm-avatar">S</div>
                <div className="sm-bubble ai">Strong foundation — that opens up a good range of options. Are you primarily looking to study abroad for postgrad, or fund your current degree?</div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <div className="sm-avatar">S</div>
                <div className="sm-typing"><div className="sm-dot" /><div className="sm-dot" /><div className="sm-dot" /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sm-final-cta">
        <div className="sm-final-title">Ready to find your scholarship?</div>
        <div className="sm-final-sub">Thousands of Nigerian students have already found funding they didn't know existed. Your match is in there.</div>
        <button className="sm-btn-primary" onClick={goAuth}>
          <i className="ti ti-sparkles" style={{ fontSize: 14 }} aria-hidden="true" />
          Start for free — takes 5 minutes
        </button>
        <div className="sm-signin-link">
          Already have an account? <Link to="/auth">Sign in</Link>
        </div>
      </section>

      <footer className="sm-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Logo size={24} textSize={14} />
          <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>Built for African students.</span>
        </div>
        <div className="sm-footer-copy">© 2025 ScholarMatch AI. All rights reserved.</div>
        <div className="sm-footer-links">
          <span>Privacy Policy</span>
          <span>Terms of Use</span>
          <span>Contact</span>
          <span>About</span>
        </div>
      </footer>
    </div>
  )
}
