import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useMyEnrollments } from '../../hooks/useMyEnrollments'
import { useProfileDetails } from '../../hooks/useProfileDetails'
import { supabase } from '../../lib/supabase'
import { useEffect, useState } from 'react'
import type { DbsCheck } from '../../types/database'

export function EmployeeOverviewPage() {
  const { profile } = useAuth()
  const { courses, avgProgress, completedCount } = useMyEnrollments()
  const { details } = useProfileDetails()
  const [dbsCheck, setDbsCheck] = useState<DbsCheck | null>(null)

  useEffect(() => {
    if (!profile) return
    void supabase
      .from('dbs_checks')
      .select('*')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setDbsCheck(data as DbsCheck | null))
  }, [profile])

  const firstName = profile?.full_name.split(' ')[0] ?? 'there'
  const dbsStatus = details?.dbs_status ?? 'Not Submitted'

  return (
    <div>
      <div className="crm-sec-lbl">Employee Portal</div>
      <h2 className="crm-page-title">Welcome back, {firstName}.</h2>

      <div className="crm-stat-grid crm-stat-grid-4">
        <div className="crm-stat-card">
          <div className="crm-stat-label">Assigned Courses</div>
          <div className="crm-stat-value">{courses.length}</div>
        </div>
        <div className="crm-stat-card">
          <div className="crm-stat-label">Completed</div>
          <div className="crm-stat-value" style={{ color: '#22c55e' }}>{completedCount}</div>
        </div>
        <div className="crm-stat-card">
          <div className="crm-stat-label">DBS Status</div>
          <div className="crm-stat-value" style={{ fontSize: '1rem', color: dbsStatus === 'Cleared' ? '#22c55e' : dbsStatus === 'Processing' ? '#eab308' : '#f87171' }}>
            {dbsStatus}
          </div>
        </div>
        <div className="crm-stat-card">
          <div className="crm-stat-label">Training Progress</div>
          <div className="crm-stat-value" style={{ color: '#3b82f6' }}>{avgProgress}%</div>
        </div>
      </div>

      <div className="crm-card">
        <div className="crm-card-title">My Courses</div>
        {courses.length === 0 ? (
          <div className="crm-empty">No courses assigned yet.</div>
        ) : (
          courses.map((c) => (
            <Link key={c.id} to={`/dashboard-employee/courses/${c.id}`} className="lms-home-course-row">
              <div>
                <strong>{c.title}</strong>
                <div className="crm-pb" style={{ marginTop: 6 }}>
                  <div className={`crm-pb-fill${c.enrollment.completed ? ' crm-pb-fill-done' : ''}`} style={{ width: `${c.enrollment.progress}%`, background: '#3b82f6' }} />
                </div>
              </div>
              <span style={{ color: c.enrollment.completed ? '#22c55e' : '#3b82f6', fontWeight: 700 }}>{c.enrollment.progress}%</span>
            </Link>
          ))
        )}
      </div>

      {dbsCheck && (
        <div className="crm-card" style={{ marginTop: 16 }}>
          <div className="crm-card-title">DBS Update</div>
          <p className="crm-lms-muted">Stage: <strong style={{ color: 'var(--white)' }}>{dbsCheck.stage}</strong></p>
          <Link to="/dashboard-employee/dbs" className="crm-btn crm-btn-s" style={{ marginTop: 10 }}>
            View DBS Pipeline
          </Link>
        </div>
      )}
    </div>
  )
}
