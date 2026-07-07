import { useMyApplication, TRACKER_STAGES } from '../../hooks/useMyApplication'

export function StudentTrackerPage() {
  const { application, loading, currentStage } = useMyApplication()

  if (loading) return <div className="crm-empty"><i className="fa-solid fa-spinner fa-spin" /></div>

  if (!application) {
    return (
      <div>
        <div className="crm-sec-lbl portal-accent-student">My Application</div>
        <h2 className="crm-page-title">Application Tracker</h2>
        <div className="crm-card"><div className="crm-empty">No application found. Contact your coordinator.</div></div>
      </div>
    )
  }

  return (
    <div>
      <div className="crm-sec-lbl portal-accent-student">My Application</div>
      <h2 className="crm-page-title">Application Tracker</h2>

      <div className="crm-card">
        <div className="crm-card-title">{application.title}</div>
        <div className="lms-tracker">
          {TRACKER_STAGES.map((stage, i) => {
            const done = i < currentStage
            const active = i === currentStage
            return (
              <div key={stage} className="lms-track-step">
                <div className={`lms-track-node${done ? ' done' : ''}${active ? ' active' : ''}${!done && !active ? ' pending' : ''}`}>
                  {done ? <i className="fa-solid fa-check" /> : i + 1}
                </div>
                <span className={`lms-track-label${done ? ' done' : ''}${active ? ' active' : ''}`}>{stage}</span>
              </div>
            )
          })}
        </div>
        {application.notes && <p className="crm-lms-muted" style={{ marginTop: 16 }}>{application.notes}</p>}
      </div>
    </div>
  )
}
