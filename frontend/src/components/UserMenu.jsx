import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSession, signOut } from '../lib/useSession'
import './UserMenu.css'

function initialsFrom(user) {
  const name = user?.user_metadata?.full_name || user?.email || ''
  const parts = name.split(/[\s@]+/).filter(Boolean)
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('') || 'TA'
}

export default function UserMenu() {
  const navigate = useNavigate()
  const { user } = useSession()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onDoc(e) {
      if (open && ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const initials = initialsFrom(user)
  const name = user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'You')
  const email = user?.email || ''

  async function handleSignOut() {
    setOpen(false)
    await signOut()
    navigate('/')
  }

  return (
    <div className="um-wrap" ref={ref}>
      <button className="um-trigger" onClick={() => setOpen((v) => !v)} aria-label="Account menu" aria-expanded={open}>
        {initials}
      </button>
      {open && (
        <div className="um-menu" role="menu">
          <div className="um-id">
            <div className="um-id-name">{name}</div>
            {email && <div className="um-id-email">{email}</div>}
          </div>
          <div className="um-sep" />
          <Link to="/profile" className="um-item" onClick={() => setOpen(false)}>
            <i className="ti ti-user" style={{ fontSize: 14 }} aria-hidden="true" /> Profile
          </Link>
          <Link to="/tracker" className="um-item" onClick={() => setOpen(false)}>
            <i className="ti ti-layout-kanban" style={{ fontSize: 14 }} aria-hidden="true" /> Tracker
          </Link>
          <div className="um-sep" />
          <button className="um-item danger" onClick={handleSignOut} role="menuitem">
            <i className="ti ti-logout" style={{ fontSize: 14 }} aria-hidden="true" /> Sign out
          </button>
        </div>
      )}
    </div>
  )
}

export { initialsFrom }
