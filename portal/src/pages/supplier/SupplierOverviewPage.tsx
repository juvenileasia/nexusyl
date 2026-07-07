import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useProfileDetails } from '../../hooks/useProfileDetails'
import { useSupplierStats } from '../../hooks/useSupplierData'

export function SupplierOverviewPage() {
  const { profile } = useAuth()
  const { details } = useProfileDetails()
  const { stats, loading } = useSupplierStats()

  return (
    <div>
      <div className="crm-sec-lbl portal-accent-supplier">Partner Portal</div>
      <h2 className="crm-page-title">{details?.organisation ?? profile?.full_name ?? 'Partner'} Dashboard</h2>

      {loading ? (
        <div className="crm-empty"><i className="fa-solid fa-spinner fa-spin" /></div>
      ) : (
        <div className="crm-stat-grid crm-stat-grid-4">
          <div className="crm-stat-card">
            <div className="crm-stat-label">Students in Pipeline</div>
            <div className="crm-stat-value">{stats.pipeline}</div>
          </div>
          <div className="crm-stat-card">
            <div className="crm-stat-label">Under Review</div>
            <div className="crm-stat-value" style={{ color: '#eab308' }}>{stats.inReview}</div>
          </div>
          <div className="crm-stat-card">
            <div className="crm-stat-label">Approved / Arrived</div>
            <div className="crm-stat-value" style={{ color: '#22c55e' }}>{stats.approved}</div>
          </div>
          <div className="crm-stat-card">
            <div className="crm-stat-label">Students Supplied</div>
            <div className="crm-stat-value">{details?.students_supplied ?? 0}</div>
          </div>
        </div>
      )}

      <div className="crm-enrol-grid">
        <Link to="/dashboard-supplier/students" className="crm-card lms-quick-action">
          <i className="fa-solid fa-graduation-cap" />
          <strong>Student Pipeline</strong>
          <span>Track referred students</span>
        </Link>
        <Link to="/dashboard-supplier/employees" className="crm-card lms-quick-action">
          <i className="fa-solid fa-briefcase" />
          <strong>Employee Training</strong>
          <span>Read-only training overview</span>
        </Link>
      </div>
    </div>
  )
}
