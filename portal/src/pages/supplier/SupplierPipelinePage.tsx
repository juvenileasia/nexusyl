import { useSupplierPipeline } from '../../hooks/useSupplierData'

const STATUS_PILL: Record<string, string> = {
  pending: 'pill-y',
  documents_required: 'pill-r',
  under_review: 'pill-b',
  approved: 'pill-g',
  arrived: 'pill-g',
}

export function SupplierPipelinePage() {
  const { students, loading, error } = useSupplierPipeline()

  return (
    <div>
      <div className="crm-sec-lbl portal-accent-supplier">Pipeline</div>
      <h2 className="crm-page-title">Student Pipeline</h2>

      {error && <div className="err-box" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="crm-card">
        {loading ? (
          <div className="crm-empty"><i className="fa-solid fa-spinner fa-spin" /></div>
        ) : students.length === 0 ? (
          <div className="crm-empty">No students assigned to your pipeline yet.</div>
        ) : (
          <div className="crm-table-wrap">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Application</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <strong>{s.student?.full_name ?? '—'}</strong>
                      <br />
                      <small className="crm-lms-muted">{s.student?.email}</small>
                    </td>
                    <td>{s.title}</td>
                    <td>{s.type}</td>
                    <td><span className={`crm-pill ${STATUS_PILL[s.status] ?? 'pill-y'}`}>{s.status.replace(/_/g, ' ')}</span></td>
                    <td>{new Date(s.updated_at).toLocaleDateString('en-GB')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
