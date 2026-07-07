import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { UserRole } from '../types/database'
import '../styles/dashboard.css'

export interface NavItem {
  to: string
  label: string
  icon: string
  badge?: number
  end?: boolean
}

interface DashboardLayoutProps {
  brand: string
  brandSub: string
  roleLabel: string
  rolePillClass: string
  navSections: { title: string; items: NavItem[] }[]
}

function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const rolePill: Record<UserRole, string> = {
  admin: 'pill-r',
  employee: 'pill-b',
  student: 'pill-g',
  supplier: 'pill-y',
}

export function DashboardLayout({
  brand,
  brandSub,
  roleLabel,
  rolePillClass,
  navSections,
}: DashboardLayoutProps) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="crm-shell">
      <aside className="crm-sidebar">
        <div className="crm-logo">
          <span className="crm-logo-mark">N</span>
          <div>
            <strong>{brand}</strong>
            <span>{brandSub}</span>
          </div>
        </div>

        <nav className="crm-nav">
          {navSections.map((section) => (
            <div key={section.title}>
              <div className="crm-nav-sec">{section.title}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `crm-nav-link${isActive ? ' active' : ''}`}
                >
                  <i className={`fa-solid ${item.icon}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="crm-badge">{item.badge}</span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="crm-sidebar-foot">
          <div className="crm-user-chip">
            <span className="crm-avatar">{initials(profile?.full_name ?? 'A')}</span>
            <div className="crm-user-meta">
              <strong>{profile?.full_name}</strong>
              <span>{roleLabel}</span>
            </div>
          </div>
          <button type="button" className="crm-signout" onClick={() => void handleSignOut()}>
            <i className="fa-solid fa-right-from-bracket" /> Sign out
          </button>
        </div>
      </aside>

      <div className="crm-main-wrap">
        <header className="crm-topbar">
          <div className="crm-breadcrumb">
            <span>Nexusyl CRM</span>
            <i className="fa-solid fa-chevron-right" />
            <strong>{brandSub}</strong>
          </div>
          <span className={`crm-pill ${rolePillClass || rolePill[profile?.role ?? 'admin']}`}>
            <i className="fa-solid fa-shield-halved" /> {roleLabel}
          </span>
        </header>

        <main className="crm-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
