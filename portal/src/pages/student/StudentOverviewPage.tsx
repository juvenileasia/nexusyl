import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useMyEnrollments } from '../../hooks/useMyEnrollments'
import { useMyApplication, TRACKER_STAGES } from '../../hooks/useMyApplication'

export function StudentOverviewPage() {
  const { profile } = useAuth()
  const { avgProgress } = useMyEnrollments()
  const { application, currentStage } = useMyApplication()

  const stageLabel = application ? TRACKER_STAGES[currentStage] ?? application.status : 'Not started'
  const visaStatus = application?.status === 'approved' || application?.status === 'arrived'
    ? 'Approved'
    : application ? 'In Progress' : 'Awaiting Upload'

  return (
    <div>
      <div className="crm-sec-lbl portal-accent-student">Student Portal</div>
      <h2 className="crm-page-title">Your UK Journey Dashboard</h2>

      <div className="crm-stat-grid crm-stat-grid-4">
        <div className="crm-stat-card">
          <div className="crm-stat-label">Application Stage</div>
          <div className="crm-stat-value" style={{ fontSize: '1rem', color: 'var(--red)' }}>{stageLabel}</div>
        </div>
        <div className="crm-stat-card">
          <div className="crm-stat-label">Visa Status</div>
          <div className="crm-stat-value" style={{ fontSize: '1rem', color: '#eab308' }}>{visaStatus}</div>
        </div>
        <div className="crm-stat-card">
          <div className="crm-stat-label">Academy Progress</div>
          <div className="crm-stat-value" style={{ color: '#22c55e' }}>{avgProgress}%</div>
        </div>
      </div>

      <div className="crm-enrol-grid">
        <Link to="/dashboard-student/upload" className="crm-card lms-quick-action">
          <i className="fa-solid fa-cloud-arrow-up" />
          <strong>Upload Documents</strong>
          <span>Offer letter & supporting docs</span>
        </Link>
        <Link to="/dashboard-student/courses" className="crm-card lms-quick-action">
          <i className="fa-solid fa-play-circle" />
          <strong>My Courses</strong>
          <span>Academy training modules</span>
        </Link>
      </div>

      {application && (
        <div className="crm-card" style={{ marginTop: 16 }}>
          <div className="crm-card-title">{application.title}</div>
          <p className="crm-lms-muted">{application.notes ?? 'Your application is being processed.'}</p>
          <Link to="/dashboard-student/tracker" className="crm-btn crm-btn-p" style={{ marginTop: 12 }}>
            View Application Tracker
          </Link>
        </div>
      )}

      {!application && (
        <div className="crm-card" style={{ marginTop: 16 }}>
          <div className="crm-empty">
            <i className="fa-solid fa-route" />
            No application on file yet. Upload your documents to get started.
          </div>
        </div>
      )}

      <p className="crm-lms-muted" style={{ marginTop: 16 }}>Signed in as {profile?.email}</p>
    </div>
  )
}
