import { useSupplierPipeline } from '../../hooks/useSupplierData'

export function SupplierReportsPage() {
  const { students, loading } = useSupplierPipeline()

  const byStatus = students.reduce<Record<string, number>>((acc, s) => {
    acc[s.status] = (acc[s.status] ?? 0) + 1
    return acc
  }, {})

  return (
    <div>
      <div className="crm-sec-lbl portal-accent-supplier">Business</div>
      <h2 className="crm-page-title">Reports</h2>

      <div className="crm-card">
        <div className="crm-card-title">Pipeline Summary</div>
        {loading ? (
          <div className="crm-empty"><i className="fa-solid fa-spinner fa-spin" /></div>
        ) : students.length === 0 ? (
          <div className="crm-empty">No pipeline data yet.</div>
        ) : (
          <>
            <div className="crm-stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 0 }}>
              <div className="crm-stat-card">
                <div className="crm-stat-label">Total Referrals</div>
                <div className="crm-stat-value">{students.length}</div>
              </div>
              <div className="crm-stat-card">
                <div className="crm-stat-label">In Review</div>
                <div className="crm-stat-value" style={{ color: '#eab308' }}>{byStatus.under_review ?? 0}</div>
              </div>
              <div className="crm-stat-card">
                <div className="crm-stat-label">Approved</div>
                <div className="crm-stat-value" style={{ color: '#22c55e' }}>{(byStatus.approved ?? 0) + (byStatus.arrived ?? 0)}</div>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              {Object.entries(byStatus).map(([status, count]) => (
                <div key={status} className="crm-enrol-overview-row">
                  <span className="crm-enrol-overview-title">{status.replace(/_/g, ' ')}</span>
                  <span className="crm-enrol-chip-meta">{count}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
