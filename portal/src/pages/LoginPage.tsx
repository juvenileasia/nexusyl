import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'
import { ROLE_DASHBOARD, type UserRole } from '../types/database'

const ROLES: Record<
  UserRole,
  {
    title: string
    subtitle: string
    badge: string
    colour: string
    icon: string
    btnLabel: string
    demoEmail: string
    demoPass: string
  }
> = {
  admin: {
    title: 'Admin Login',
    subtitle: 'Full CRM Control Panel',
    badge: 'Admin',
    colour: '#E8211A',
    icon: 'fa-shield-halved',
    btnLabel: 'Access Admin Panel',
    demoEmail: 'admin@nexusyl.co.uk',
    demoPass: 'nexusyl2026',
  },
  employee: {
    title: 'Employee Login',
    subtitle: 'LMS Access & DBS Vetting Portal',
    badge: 'Employee',
    colour: '#3b82f6',
    icon: 'fa-briefcase',
    btnLabel: 'Access Employee Dashboard',
    demoEmail: 'sarah.thompson@nexusyl.co.uk',
    demoPass: 'employee2026',
  },
  student: {
    title: 'Student / Newcomer Login',
    subtitle: 'Document Upload & Visa Tracker',
    badge: 'Student',
    colour: '#22c55e',
    icon: 'fa-graduation-cap',
    btnLabel: 'Access Student Portal',
    demoEmail: 'jordan.singh@student.ac.uk',
    demoPass: 'student2026',
  },
  supplier: {
    title: 'Supplier / Partner Login',
    subtitle: 'B2B Pipeline Tracking Dashboard',
    badge: 'Supplier/Partner',
    colour: '#eab308',
    icon: 'fa-handshake',
    btnLabel: 'Access Partner Dashboard',
    demoEmail: 'contact@globaltalent.co.uk',
    demoPass: 'supplier2026',
  },
}

const ROLE_ORDER: UserRole[] = ['admin', 'employee', 'student', 'supplier']
const MARKETING_URL = import.meta.env.VITE_MARKETING_URL || 'http://localhost:8080'

export function LoginPage() {
  const navigate = useNavigate()
  const { session, profile, signIn } = useAuth()
  const [params] = useSearchParams()
  const initialRole = (params.get('role') as UserRole) || 'admin'
  const [role, setRole] = useState<UserRole>(
    ROLE_ORDER.includes(initialRole) ? initialRole : 'admin',
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const cfg = ROLES[role]

  useEffect(() => {
    setEmail('')
    setPassword('')
    setError('')
  }, [role])

  useEffect(() => {
    if (session && profile) {
      navigate(ROLE_DASHBOARD[profile.role], { replace: true })
    }
  }, [session, profile, navigate])

  if (session && profile) {
    return (
      <div className="loading-screen">
        <i className="fa-solid fa-spinner fa-spin" />
        <span>Opening {profile.role} dashboard…</span>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Add credentials to portal/.env.local')
      return
    }

    if (!email.trim() || !password) {
      setError('Please enter your email address and password.')
      return
    }

    setSubmitting(true)
    const { error: signInError } = await signIn(email.trim().toLowerCase(), password)
    setSubmitting(false)

    if (signInError) {
      setError(signInError)
      return
    }
  }

  return (
    <div className="login-page">
      <div className="grid-bg" />
      <div className="radial-glow" />

      <div className="login-wrap">
        <a href={MARKETING_URL} className="login-brand">
          <span className="brand-mark">N</span>
          <div>
            <strong>Nexusyl Portal</strong>
            <span>Secure multi-tenant access</span>
          </div>
        </a>

        {!isSupabaseConfigured && (
          <div className="config-banner">
            <i className="fa-solid fa-circle-info" />
            Local dev: copy <code>portal/.env.example</code> to <code>portal/.env.local</code> and add your Supabase keys.
          </div>
        )}

        <div className="role-tabs">
          {ROLE_ORDER.map((r) => (
            <button
              key={r}
              type="button"
              className={`role-tab ${role === r ? 'active' : ''}`}
              onClick={() => setRole(r)}
            >
              <span className="icon" style={role === r ? { background: `${ROLES[r].colour}33` } : undefined}>
                <i className={`fa-solid ${ROLES[r].icon}`} style={{ color: role === r ? ROLES[r].colour : undefined }} />
              </span>
              <span className="label">{ROLES[r].badge}</span>
            </button>
          ))}
        </div>

        <div className="login-card">
          <div className="role-bar" style={{ background: cfg.colour }} />
          <div className="login-card-body">
            <div className="login-head">
              <span className={`role-badge badge-${role}`}>
                <i className={`fa-solid ${cfg.icon}`} /> {cfg.badge}
              </span>
              <h1>{cfg.title}</h1>
              <p>{cfg.subtitle}</p>
            </div>

            <form onSubmit={handleSubmit}>
              <label className="lbl">Email address</label>
              <input
                className="inp"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={cfg.demoEmail}
              />

              <label className="lbl" style={{ marginTop: 14 }}>
                Password
              </label>
              <div className="pass-wrap">
                <input
                  className="inp"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
                <button type="button" className="pass-toggle" onClick={() => setShowPass((v) => !v)}>
                  <i className={`fa-solid ${showPass ? 'fa-eye-slash' : 'fa-eye'}`} />
                </button>
              </div>

              {error && (
                <div className="err-box">
                  <i className="fa-solid fa-circle-exclamation" />
                  <span>{error}</span>
                </div>
              )}

              <button className="btn-login" type="submit" disabled={submitting} style={{ marginTop: 18 }}>
                {submitting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" /> Authenticating…
                  </>
                ) : (
                  <>
                    <i className={`fa-solid ${cfg.icon}`} /> {cfg.btnLabel}
                  </>
                )}
              </button>
            </form>

            <p className="demo-hint">
              <span>Demo email:</span> <code>{cfg.demoEmail}</code>
              <span>Password:</span> <code>{cfg.demoPass}</code>
            </p>
          </div>
        </div>

        <p className="login-footer">
          <a href={MARKETING_URL}>← Back to Nexusyl website</a>
        </p>
      </div>
    </div>
  )
}
