import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import RotatingText from '../components/RotatingText'
import CountUp from '../components/CountUp'
import { useToast } from '../components/Toast'
import './Landing.css'

const ROTATING_LINES = [
  'Tell us about yourself once. We find the rest.',
  'Matched to your GPA, field, nationality and goals.',
  'Over ₦8 billion in funding — waiting for the right student.',
  'From Lagos to London. From UNILAG to Oxford.',
  'No forms. No guessing. Just your next opportunity.',
]

const CAROUSEL = [
  { org: 'MasterCard Foundation', name: 'Scholars Program', amount: 'Full funding', flag: '🌍', region: 'Africa', match: 98, deadline: 'Dec 15, 2025' },
  { org: 'UK Government', name: 'Chevening Scholarship', amount: '£18,000 / yr', flag: '🇬🇧', region: 'UK', match: 91, deadline: 'Nov 5, 2026' },
  { org: 'DAAD Germany', name: 'Development Postgraduate', amount: '€934 / month', flag: '🇩🇪', region: 'Germany', match: 87, deadline: 'Oct 31, 2026' },
  { org: 'Gates Foundation', name: 'Gates Cambridge', amount: 'Full funding', flag: '🇬🇧', region: 'UK', match: 85, deadline: 'Jan 8, 2026' },
  { org: 'MTN Foundation', name: 'Science & Technology', amount: '₦500,000 / yr', flag: '🇳🇬', region: 'Nigeria', match: 79, deadline: 'Dec 20, 2025' },
  { org: 'Commonwealth', name: 'Shared Scholarship', amount: 'Full funding', flag: '🇬🇧', region: 'UK', match: 76, deadline: 'Feb 14, 2026' },
  { org: 'Tony Elumelu Foundation', name: 'Entrepreneurship', amount: '$5,000', flag: '🌍', region: 'Africa', match: 88, deadline: 'Mar 1, 2026' },
  { org: 'European Commission', name: 'Erasmus Mundus', amount: '€1,400 / month', flag: '🇪🇺', region: 'Europe', match: 82, deadline: 'Jan 15, 2026' },
  { org: 'NNPC / SNEPCo', name: 'Merit Award', amount: 'Full funding', flag: '🇳🇬', region: 'Nigeria', match: 90, deadline: 'Dec 10, 2025' },
  { org: 'Shell Nigeria', name: 'University Scholarship', amount: '₦800,000 / yr', flag: '🇳🇬', region: 'Nigeria', match: 83, deadline: 'Oct 12, 2026' },
]

function matchClass(m) {
  if (m >= 95) return 'gold'
  if (m >= 85) return 'green'
  return 'blue'
}

const FEATURES = [
  { icon: 'ti-brain', bg: '#E6F1FB', color: '#185FA5', title: 'AI profile interview', desc: 'A natural conversation that learns your academic background, goals, and strengths. No long forms. No guessing. Just talk.' },
  { icon: 'ti-target', bg: '#FAEEDA', color: '#854F0B', title: 'Precision matching', desc: 'We score every scholarship in our database against your actual profile — nationality, GPA, field, goals — and rank them by fit.' },
  { icon: 'ti-file-text', bg: '#E1F5EE', color: '#0F6E56', title: 'Application drafts', desc: 'One click generates a tailored personal statement, CV, or cover letter for any scholarship. Scholar knows your profile — so it writes like you.' },
  { icon: 'ti-layout-kanban', bg: '#EEEDFE', color: '#534AB7', title: 'Application tracker', desc: 'A clean kanban board to track every application from saved to result. Deadline reminders built in so you never miss a close date.' },
]

const STEPS = [
  { title: 'Tell us about yourself', desc: 'Chat with Scholar — our AI — for about 5 minutes. It asks about your academics, goals, nationality, and what kind of opportunity you’re looking for. No forms. Just conversation.' },
  { title: 'See your matched scholarships', desc: 'We instantly scan thousands of scholarships and rank them by how well they match your actual profile. You see a fit score, funding amount, and deadline for every one.' },
  { title: 'Apply with AI support', desc: 'Pick any scholarship and Scholar drafts your personal statement, CV, and cover letter in seconds — tailored specifically to that scholarship’s requirements and values.' },
]

const ABOUT_STATS = [
  { emoji: '🌍', num: '54', label: 'African countries covered' },
  { emoji: '🎓', num: '2,400+', label: 'Scholarships tracked' },
  { emoji: '⚡', num: '94%', label: 'Average match accuracy' },
]

function smoothScrollTo(id) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function Landing() {
  const navigate = useNavigate()
  const toast = useToast()
  const [menuOpen, setMenuOpen] = useState(false)
  const goAuth = () => navigate('/auth')

  function handleApplyClick() {
    toast.push('Sign up to apply for this scholarship', 'info')
    navigate('/auth')
  }
  function scrollTo(id) {
    setMenuOpen(false)
    smoothScrollTo(id)
  }

  return (
    <div className="sm-wrap">
      <h2 className="sr-only">ScholarMatch AI — find scholarships that fit you</h2>

      <nav className="sm-nav">
        <Logo size={32} textSize={17} />
        <div className="sm-nav-links">
          <button onClick={() => scrollTo('how-it-works')}>How it works</button>
          <button onClick={() => scrollTo('scholarships')}>Scholarships</button>
          <button onClick={() => scrollTo('about')}>About</button>
        </div>
        <button className="sm-nav-cta" onClick={goAuth}>Get started free</button>
        <button className="sm-burger" onClick={() => setMenuOpen((v) => !v)} aria-label="Open menu" aria-expanded={menuOpen}>
          <i className={`ti ${menuOpen ? 'ti-x' : 'ti-menu-2'}`} style={{ fontSize: 22 }} aria-hidden="true" />
        </button>
        {menuOpen && (
          <div className="sm-mobile-menu open">
            <button onClick={() => scrollTo('how-it-works')}>How it works</button>
            <button onClick={() => scrollTo('scholarships')}>Scholarships</button>
            <button onClick={() => scrollTo('about')}>About</button>
            <button className="cta" onClick={() => { setMenuOpen(false); navigate('/auth') }}>Get started free</button>
          </div>
        )}
      </nav>

      <section className="sm-hero">
        <div className="sm-hero-blob-1" />
        <div className="sm-hero-blob-2" />
        <div className="sm-hero-inner">
          <div className="sm-badge">
            <i className="ti ti-sparkles" style={{ fontSize: 13 }} aria-hidden="true" />
            AI-powered scholarship matching
          </div>
          <h1 className="sm-h1">Find scholarships that <span>actually fit you</span></h1>
          <RotatingText className="sm-rotating" lines={ROTATING_LINES} interval={3000} />
          <p className="sm-sub">
            Tell us about yourself once. Our AI matches you to scholarships you qualify for —
            then helps you write the CV, personal statement, and cover letter to win them.
          </p>
          <div className="sm-cta-row">
            <button className="sm-btn-primary" onClick={goAuth}>
              Start my profile — it's free
              <i className="ti ti-arrow-right" style={{ fontSize: 15 }} aria-hidden="true" />
            </button>
            <button className="sm-btn-secondary" onClick={() => scrollTo('how-it-works')}>See how it works</button>
          </div>
          <div className="sm-cta-note">No credit card. Takes 5 minutes.</div>
        </div>
      </section>

      <div className="sm-stats">
        <div className="sm-stat"><div className="sm-stat-num"><CountUp target={2400} duration={1500} /><span>+</span></div><div className="sm-stat-label">Scholarships in database</div></div>
        <div className="sm-stat"><div className="sm-stat-num">₦<CountUp target={8} duration={1200} /><span>B+</span></div><div className="sm-stat-label">Total funding available</div></div>
        <div className="sm-stat"><div className="sm-stat-num"><CountUp target={94} duration={1500} /><span>%</span></div><div className="sm-stat-label">Match accuracy rate</div></div>
        <div className="sm-stat"><div className="sm-stat-num"><CountUp target={12000} duration={1500} format={(n) => Math.round(n / 1000) + 'k'} /><span>+</span></div><div className="sm-stat-label">Students matched</div></div>
      </div>

      <section className="sm-carousel-wrap" id="scholarships">
        <div className="sm-section-label">Live scholarship feed</div>
        <div className="sm-carousel">
          {[...CAROUSEL, ...CAROUSEL].map((s, i) => (
            <div className="sm-ccard" key={i} onClick={handleApplyClick} role="button" tabIndex={0}>
              <div className="sm-ccard-top">
                <div>
                  <div className="sm-ccard-org">{s.org}</div>
                  <div className={`sm-match-badge ${matchClass(s.match)}`} style={{ marginTop: 4 }}>{s.match}% match</div>
                </div>
                <div className="sm-ccard-flag" title={s.region}>{s.flag}</div>
              </div>
              <div className="sm-ccard-name">{s.name}</div>
              <div className="sm-ccard-amount">{s.amount}</div>
              <div className="sm-ccard-foot">
                <div className="sm-ccard-deadline"><i className="ti ti-clock" style={{ fontSize: 11 }} aria-hidden="true" /> {s.deadline}</div>
                <button className="sm-ccard-apply" onClick={(e) => { e.stopPropagation(); handleApplyClick() }}>Apply →</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="sm-grad-divider" />

      <section className="sm-features">
        <div className="sm-section-title">Everything you need to win a scholarship</div>
        <div className="sm-section-sub">From discovery to submitted application — all in one place.</div>
        <div className="sm-features-grid">
          {FEATURES.map((f) => (
            <div className="sm-feature" key={f.title}>
              <div className="sm-feature-icon" style={{ background: f.bg }}>
                <i className={`ti ${f.icon}`} style={{ color: f.color, fontSize: 20 }} aria-hidden="true" />
              </div>
              <div className="sm-feature-title">{f.title}</div>
              <div className="sm-feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <button className="sm-btn-primary" onClick={goAuth}>
            <i className="ti ti-sparkles" style={{ fontSize: 14 }} aria-hidden="true" />
            Get matched in 5 minutes
          </button>
        </div>
      </section>

      <section className="sm-bg-features">
        <div className="sm-bg-inner">
          <div className="sm-section-title sm-bg-title">How ScholarMatch works for you — even when you're offline</div>
          <div className="sm-section-sub sm-bg-sub">Four things running in the background so you never miss an opportunity.</div>
          <div className="sm-bg-grid">
            <div className="sm-bg-card">
              <div className="sm-bg-icon" style={{ background: 'rgba(226,75,74,0.16)', color: '#FCA5A5' }}><span style={{ fontSize: 22 }}>🔔</span></div>
              <div className="sm-bg-card-title">Deadline reminders</div>
              <p className="sm-bg-card-desc">Set a reminder on any scholarship with one tap. We'll email you 14 days, 7 days, and 1 day before it closes. The bell turns gold when active. You'll never miss a close date again.</p>
              <div className="sm-bg-tag">Built into the tracker</div>
            </div>
            <div className="sm-bg-card">
              <div className="sm-bg-icon" style={{ background: 'rgba(29,158,117,0.16)', color: '#6FE9C5' }}><span style={{ fontSize: 22 }}>✨</span></div>
              <div className="sm-bg-card-title">Silent re-matching</div>
              <p className="sm-bg-card-desc">Every night, Scholar re-scans our entire database against your saved profile. New scholarships that match you appear automatically the next time you log in — no action needed.</p>
              <div className="sm-bg-tag">Runs automatically</div>
            </div>
            <div className="sm-bg-card">
              <div className="sm-bg-icon" style={{ background: 'rgba(59,130,246,0.16)', color: '#93C5FD' }}><span style={{ fontSize: 22 }}>📡</span></div>
              <div className="sm-bg-card-title">Live scholarship feed</div>
              <p className="sm-bg-card-desc">Our database updates continuously. When a new scholarship is added that matches your profile, it silently drops into your tracker with a "New" badge. New opportunities find you — not the other way around.</p>
              <div className="sm-bg-tag">Always updating</div>
            </div>
            <div className="sm-bg-card">
              <div className="sm-bg-icon" style={{ background: 'rgba(127,119,221,0.18)', color: '#C9C4FF' }}><span style={{ fontSize: 22 }}>📁</span></div>
              <div className="sm-bg-card-title">Document vault</div>
              <p className="sm-bg-card-desc">Upload your transcript, WAEC results, passport, and recommendation letters once. Scholar references them automatically when drafting any application. One upload — used forever.</p>
              <div className="sm-bg-tag">Inside the Apply tab</div>
            </div>
          </div>
        </div>
      </section>

      <section className="sm-how" id="how-it-works">
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
          <div className="sm-chat-preview">
            <div className="sm-msg"><div className="sm-avatar">S</div><div className="sm-bubble ai">Hi! I'm Scholar. I'll ask you a few quick questions to find your best matches. What's your name?</div></div>
            <div className="sm-msg user"><div className="sm-bubble user">Temi Adeyemi</div></div>
            <div className="sm-msg"><div className="sm-avatar">S</div><div className="sm-bubble ai">Great to meet you, Temi! What are you currently studying and where?</div></div>
            <div className="sm-msg user"><div className="sm-bubble user">Computer Engineering at UNILAG. 300 level, GPA 4.3.</div></div>
            <div className="sm-msg"><div className="sm-avatar">S</div><div className="sm-bubble ai">Strong foundation — that opens up a good range of options. Are you primarily looking to study abroad for postgrad, or fund your current degree?</div></div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <div className="sm-avatar">S</div>
              <div className="sm-typing"><div className="sm-dot" /><div className="sm-dot" /><div className="sm-dot" /></div>
            </div>
          </div>
        </div>
      </section>

      <section className="sm-about" id="about">
        <div className="sm-about-headline">Built for African students. Powered by AI.</div>
        <p className="sm-about-body">
          ScholarMatch AI was built because too many talented African students miss out on
          life-changing scholarships — not because they don't qualify, but because they never
          find them. We built ScholarMatch AI to change that.
        </p>
        <div className="sm-about-stats">
          {ABOUT_STATS.map((s) => (
            <div className="sm-about-stat" key={s.label}>
              <div className="sm-about-stat-emoji">{s.emoji}</div>
              <div className="sm-about-stat-num">{s.num}</div>
              <div className="sm-about-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="sm-about-team"><strong>Built by students, for students.</strong> 🇳🇬</div>
      </section>

      <section className="sm-final-cta">
        <i className="ti ti-sparkles sm-sparkle" style={{ top: 60, left: '14%', fontSize: 28 }} aria-hidden="true" />
        <i className="ti ti-star sm-sparkle" style={{ top: 120, right: '18%', fontSize: 16 }} aria-hidden="true" />
        <i className="ti ti-sparkles sm-sparkle" style={{ bottom: 60, right: '12%', fontSize: 22 }} aria-hidden="true" />
        <i className="ti ti-star sm-sparkle" style={{ bottom: 100, left: '20%', fontSize: 12 }} aria-hidden="true" />

        <div className="sm-final-title">Ready to find your scholarship?</div>
        <div className="sm-final-sub">Thousands of Nigerian students have already found funding they didn't know existed. Your match is in there.</div>
        <button className="sm-btn-primary" onClick={goAuth}>
          <i className="ti ti-sparkles" style={{ fontSize: 14 }} aria-hidden="true" />
          Start for free — takes 5 minutes
        </button>
        <div className="sm-signin-link">Already have an account? <Link to="/auth">Sign in</Link></div>
      </section>

      <footer className="sm-footer">
        <div className="sm-footer-grid">
          <div className="sm-footer-brand">
            <Logo size={28} textSize={16} />
            <p>Find scholarships that actually fit you.<br />Built for African students. 🇳🇬</p>

          </div>
          <div className="sm-footer-col">
            <h4>Product</h4>
            <ul>
              <li><button onClick={() => scrollTo('how-it-works')}>How it works</button></li>
              <li><button onClick={() => scrollTo('scholarships')}>Scholarships</button></li>
              <li><button onClick={() => toast.push('Match calculator coming soon', 'info')}>Match calculator</button></li>
              <li><button onClick={() => toast.push('Success stories coming soon', 'info')}>Success stories</button></li>
            </ul>
          </div>
          <div className="sm-footer-col">
            <h4>Support</h4>
            <ul>
              <li><button onClick={() => scrollTo('about')}>About us</button></li>
              <li><button onClick={() => toast.push('Email us at hello@scholarmatch.ai', 'info')}>Contact us</button></li>
              <li><button onClick={() => toast.push('Privacy policy coming soon', 'info')}>Privacy policy</button></li>
              <li><button onClick={() => toast.push('Terms of use coming soon', 'info')}>Terms of use</button></li>
            </ul>
          </div>
          <div className="sm-footer-col">
            <h4>Connect</h4>
            <ul>
              <li><a href="https://twitter.com" target="_blank" rel="noreferrer noopener"><i className="ti ti-brand-x" aria-hidden="true" /> Twitter / X</a></li>
              <li><a href="https://linkedin.com" target="_blank" rel="noreferrer noopener"><i className="ti ti-brand-linkedin" aria-hidden="true" /> LinkedIn</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noreferrer noopener"><i className="ti ti-brand-instagram" aria-hidden="true" /> Instagram</a></li>
            </ul>
          </div>
        </div>
        <div className="sm-footer-bottom">
          <span>© 2025 ScholarMatch AI. All rights reserved.</span>
          <span>Made with ❤️ for African students</span>
        </div>
      </footer>
    </div>
  )
}
