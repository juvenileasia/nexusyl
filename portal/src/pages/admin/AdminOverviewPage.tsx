import { Link } from 'react-router-dom'
import { useAdminStats } from '../../hooks/useAdminStats'
import type { UserRole } from '../../types/database'

const rolePillClass: Record<UserRole, string> = {
  admin: 'pill-r',
  employee: 'pill-b',
  student: 'pill-g',
  supplier: 'pill-y',
}

export function AdminOverviewPage() {
  const { stats, loading, error } = useAdminStats()

  if (loading) {
    return (
      <div className="loading-screen" style={{ minHeight: 320 }}>
        <i className="fa-solid fa-spinner fa-spin" />
        <span>Loading dashboard…</span>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <div className="crm-sec-lbl">Overview</div>
      <h2 className="crm-page-title">Global CRM Dashboard</h2>

      {error && <div className="err-box" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="crm-stat-grid">
        <div className="crm-stat">
          <span>Courses</span>
          <strong>{stats.courses}</strong>
        </div>
        <div className="crm-stat">
          <span>Students</span>
          <strong>{stats.students}</strong>
        </div>
        <div className="crm-stat">
          <span>Employees</span>
          <strong>{stats.employees}</strong>
        </div>
        <div className="crm-stat">
          <span>Suppliers</span>
          <strong>{stats.suppliers}</strong>
        </div>
      </div>

      <div className="crm-grid-2">
        <div className="crm-card">
          <div className="crm-card-hd">
            <span>Recent Courses</span>
            <Link to="/dashboard-admin/courses" style={{ fontSize: '0.68rem', color: '#ccc', textDecoration: 'none', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: 2 }}>
              <i className="fa-solid fa-plus" /> New Course
            </Link>
          </div>
          {stats.recentCourses.length === 0 ? (
            <div className="crm-empty">
              <i className="fa-solid fa-book-open" />
              No courses yet — run supabase/seed.sql
            </div>
          ) : (
            stats.recentCourses.map((c) => (
              <div key={c.id} className="crm-list-row">
                <span className="crm-dot" style={{ background: c.colour ?? '#E8211A' }} />
                <div className="crm-list-body">
                  <strong>{c.title}</strong>
                  <small>
                    {c.course_modules?.[0]?.count ?? 0} modules · {c.category ?? 'General'}
                  </small>
                </div>
                <span className={`crm-pill pill-b`}>{c.published ? 'Live' : 'Draft'}</span>
              </div>
            ))
          )}
        </div>

        <div className="crm-card">
          <div className="crm-card-hd">
            <span>Recent People</span>
            <Link to="/dashboard-admin/students" style={{ color: '#888', fontSize: '0.75rem' }}>
              View all
            </Link>
          </div>
          {stats.recentPeople.length === 0 ? (
            <div className="crm-empty">
              <i className="fa-solid fa-users" />
              No people yet — run seed_demo_users.sql
            </div>
          ) : (
            stats.recentPeople.map((p) => (
              <div key={p.id} className="crm-list-row">
                <span className="crm-avatar" style={{ width: 28, height: 28, fontSize: '0.65rem' }}>
                  {p.full_name
                    .split(' ')
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </span>
                <div className="crm-list-body">
                  <strong>{p.full_name}</strong>
                  <small>{p.email}</small>
                </div>
                <span className={`crm-pill ${rolePillClass[p.role]}`}>{p.role}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
