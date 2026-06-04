import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useSession } from '../lib/useSession'
import { setMockSession } from '../lib/mockAuth'
import { useToast } from '../components/Toast'
import Logo from '../components/Logo'
import './Auth.css'

export default function Auth() {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, loading: sessionLoading } = useSession()
  const redirectTo = location.state?.from || '/dashboard'

  useEffect(() => {
    if (!sessionLoading && session) navigate(redirectTo, { replace: true })
  }, [sessionLoading, session, navigate, redirectTo])

  const toast = useToast()
  const [mode, setMode] = useState('signup') // 'signup' | 'login'

  function continueAsDemo() {
    setMockSession(true)
    toast.push('Welcome, Temi! Loading your demo profile…', 'success')
    navigate('/onboarding', { replace: true })
  }
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const isSignup = mode === 'signup'

  function switchMode(next) {
    setMode(next)
    setError('')
    setInfo('')
  }

  async function handleGoogle() {
    setError('')
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
      return
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/onboarding` },
    })
    if (error) setError(error.message)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setInfo('')

    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
      return
    }
    if (isSignup && !name.trim()) {
      setError('Please enter your full name.')
      return
    }

    setLoading(true)
    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name.trim() },
            emailRedirectTo: `${window.location.origin}/onboarding`,
          },
        })
        if (error) throw error
        if (data.session) navigate('/onboarding')
        else setInfo("Check your email to confirm your account, then come back to log in.")
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate(redirectTo)
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleForgot() {
    if (!email) {
      setError('Enter your email first, then click Forgot password.')
      return
    }
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    })
    if (error) setError(error.message)
    else setInfo('Password reset link sent. Check your email.')
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
          {info && <div className="au-alert success" role="status">{info}</div>}

          <button type="button" className="au-demo" onClick={continueAsDemo}>
            <i className="ti ti-sparkles" style={{ fontSize: 14 }} aria-hidden="true" />
            Continue as demo user — no sign-up needed
          </button>
          <div className="au-demo-sub">Explore every feature with a pre-built profile.</div>

          <button type="button" className="au-google" onClick={handleGoogle}>
            <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.87-3.04.87-2.34 0-4.32-1.58-5.03-3.7H.96v2.34A9 9 0 009 18z"/>
              <path fill="#FBBC05" d="M3.97 10.73a5.4 5.4 0 010-3.46V4.93H.96a9 9 0 000 8.14l3.01-2.34z"/>
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.34l2.58-2.58A9 9 0 009 0a9 9 0 00-8.04 4.93l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

          <div className="au-divider"><span>or</span></div>

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
              <div className="au-field-row">
                <label className="au-label" htmlFor="au-password">Password</label>
                {!isSignup && (
                  <button type="button" className="au-forgot" onClick={handleForgot}>Forgot password?</button>
                )}
              </div>
              <input id="au-password" className="au-input" type="password" autoComplete={isSignup ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
            </div>

            <button type="submit" className="au-submit" disabled={loading}>
              {loading && <span className="au-spinner" aria-hidden="true" />}
              {isSignup ? 'Create account' : 'Log in'}
            </button>
          </form>

          {isSignup && (
            <div className="au-legal">
              By signing up, you agree to our <a href="#">Terms of Use</a> and <a href="#">Privacy Policy</a>.
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
