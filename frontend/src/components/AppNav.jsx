import { NavLink, Link } from 'react-router-dom'
import Logo from './Logo'
import './AppNav.css'

const LINKS = [
  { to: '/dashboard', label: 'Matches', icon: 'ti-star' },
  { to: '/apply', label: 'Apply', icon: 'ti-file-text' },
  { to: '/tracker', label: 'Tracker', icon: 'ti-layout-kanban' },
  { to: '/profile', label: 'Profile', icon: 'ti-user' },
]

export default function AppNav({ initials = 'TA', notify = true }) {
  return (
    <nav className="app-nav">
      <Link to="/dashboard" aria-label="ScholarMatch AI home"><Logo size={26} textSize={15} /></Link>
      <div className="app-nav-links" role="tablist">
        {LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) => `app-nav-link ${isActive ? 'active' : ''}`}>
            <i className={`ti ${l.icon}`} style={{ fontSize: 14 }} aria-hidden="true" />
            <span>{l.label}</span>
          </NavLink>
        ))}
      </div>
      <div className="app-nav-right">
        <button className="app-notif" aria-label="Notifications">
          <i className="ti ti-bell" style={{ fontSize: 15 }} aria-hidden="true" />
          {notify && <div className="app-notif-dot" />}
        </button>
        <Link to="/profile" className="app-avatar">{initials}</Link>
      </div>
    </nav>
  )
}
