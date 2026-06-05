import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSession } from '../lib/useSession'
import {
  isMockMode,
  signUpMock,
  logInMock,
  getMockUser,
  isOnboardingComplete,
} from '../lib/mockAuth'
import { useToast } from '../components/Toast'
import Logo from '../components/Logo'
import './Auth.css'

export default function Auth() {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, loading: sessionLoading } = useSession()
  const redirectTo = location.state?.from || (isOnboardingComplete() ? '/dashboard' : '/onboarding')
  const toast = useToast()

  useEffect(() => {
    if (!sessionLoading && session) navigate(redirectTo, { replace: true })
  }, [sessionLoading, session, navigate, redirectTo])

  const [mode, setMode] = useState('signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isSignup = mode === 'signup'

  function switchMode(next) {
    setMode(next)
    setError('')
  }

  function validate() {
    if (isSignup && !name.trim()) return 'Please enter your full name.'
    if (!email.trim() || !email.includes('@')) return 'Please enter a valid email address.'
    if (isSignup && password.length < 8) return 'Password must be at least 8 characters.'
    if (!password) return 'Please enter your password.'
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    setLoading(true)

    if (isSignup) {
      // Mock signup: store user + start session, then send to onboarding.
      await wait(1000)
      signUpMock(name.trim(), email.trim())
      toast.push('Account created. Let\'s build your profile.', 'success')
      navigate('/onboarding', { replace: true })
    } else {
      await wait(800)
      const existing = getMockUser()
      if (!existing) {
        setLoading(false)
        toast.push('No account found. Sign up first.', 'error')
        return
      }
      const user = logInMock(email.trim())
      if (!user) {
        setLoading(false)
        toast.push('Email doesn\'t match the account on this device.', 'error')
        return
      }
      toast.push(`Welcome back, ${user.name.split(' ')[0]}!`, 'success')
      navigate(isOnboardingComplete() ? '/dashboard' : '/onboarding', { replace: true })
    }
  }

  return (
    <div className="au-wrap">
      <h2 className="sr-only">{isSignup ? 'Create your account' : 'Log in'} — ScholarMatch AI</h2>

      <aside className="au-left">
        <button type="button" className="au-back" onClick={() => navigate('/')}>
          <i className="ti ti-arrow-left" style={{ fontSize: 13 }} aria-hidden="true" /> Back to home
        </button>
        <div className="au-left-top au-left-logo">
          <Link to="/"><Logo size={32} textSize={17} /></Link>
        </div>
        <div className="au-quote-wrap">
          <div className="au-quote-mark">“</div>
          <div className="au-quote">I found the Chevening scholarship through ScholarMatch and got in. I had never even heard of it before.</div>
          <div className="au-attr">
            — <strong>Adaeze O.</strong>, University of Lagos → University of Edinburgh 2024
          </div>
        </div>
        <div className="au-left-bottom">
          <i className="ti ti-users" style={{ fontSize: 16 }} aria-hidden="true" />
          Join <strong>12,000+</strong> students already matched
        </div>
      </aside>

      <main className="au-right">
        <button type="button" className="au-back-mobile" onClick={() => navigate('/')}>
          <i className="ti ti-arrow-left" style={{ fontSize: 13 }} aria-hidden="true" /> Back to home
        </button>
        <div className="au-form">
          <div className="au-tabs" role="tablist">
            <button className={`au-tab ${isSignup ? 'active' : ''}`} onClick={() => switchMode('signup')} role="tab" aria-selected={isSignup}>Sign up</button>
            <button className={`au-tab ${!isSignup ? 'active' : ''}`} onClick={() => switchMode('login')} role="tab" aria-selected={!isSignup}>Log in</button>
          </div>

          <div className="au-h1">{isSignup ? 'Create your account' : 'Welcome back'}</div>
          <div className="au-sub">{isSignup ? 'Start finding scholarships in 5 minutes' : 'Your matches are waiting'}</div>

          {error && <div className="au-alert" role="alert">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            {isSignup && (
              <div className="au-field">
                <label className="au-label" htmlFor="au-name">Full name</label>
                <input id="au-name" className="au-input" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            )}
            <div className="au-field">
              <label className="au-label" htmlFor="au-email">Email address</label>
              <input id="au-email" className="au-input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="au-field">
              <label className="au-label" htmlFor="au-password">Password</label>
              <input
                id="au-password"
                className="au-input"
                type="password"
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={isSignup ? 8 : 1}
                required
                placeholder={isSignup ? 'At least 8 characters' : ''}
              />
            </div>

            <button type="submit" className="au-submit" disabled={loading}>
              {loading && <span className="au-spinner" aria-hidden="true" />}
              {loading ? (isSignup ? 'Creating account…' : 'Logging in…') : (isSignup ? 'Create account' : 'Log in')}
            </button>
          </form>

          {isMockMode() && (
            <div className="au-legal">
              Demo mode — your account stays on this device. No emails sent.
            </div>
          )}

          <div className="au-switch">
            {isSignup ? (
              <>Already have an account? <button onClick={() => switchMode('login')}>Log in</button></>
            ) : (
              <>Don't have an account? <button onClick={() => switchMode('signup')}>Sign up</button></>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function wait(ms) { return new Promise((r) => setTimeout(r, ms)) }
