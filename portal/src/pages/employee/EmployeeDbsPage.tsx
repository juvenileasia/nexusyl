import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useProfileDetails } from '../../hooks/useProfileDetails'
import { supabase } from '../../lib/supabase'
import { getDocumentSignedUrl } from '../../lib/documents'
import type { DbsCheck } from '../../types/database'

export function EmployeeDbsPage() {
  const { profile } = useAuth()
  const { details } = useProfileDetails()
  const [checks, setChecks] = useState<DbsCheck[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    void supabase
      .from('dbs_checks')
      .select('*')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setChecks((data as DbsCheck[]) ?? [])
        setLoading(false)
      })
  }, [profile])

  async function openCert(path: string) {
    const { url, error } = await getDocumentSignedUrl(path)
    if (error || !url) alert(error ?? 'Could not open certificate.')
    else window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div>
      <div className="crm-sec-lbl">Compliance</div>
      <h2 className="crm-page-title">DBS Vetting Pipeline</h2>

      <div className="crm-stat-grid crm-stat-grid-4" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className="crm-stat-card">
          <div className="crm-stat-label">Your DBS Status</div>
          <div className="crm-stat-value" style={{ fontSize: '1.1rem' }}>{details?.dbs_status ?? 'Not Submitted'}</div>
        </div>
        <div className="crm-stat-card">
          <div className="crm-stat-label">Checks on File</div>
          <div className="crm-stat-value">{checks.length}</div>
        </div>
      </div>

      <div className="crm-card">
        <div className="crm-card-title">Your DBS Records</div>
        {loading ? (
          <div className="crm-empty"><i className="fa-solid fa-spinner fa-spin" /></div>
        ) : checks.length === 0 ? (
          <div className="crm-empty">No DBS records yet. Contact your administrator.</div>
        ) : (
          <div className="crm-table-wrap">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Submitted</th>
                  <th>Stage</th>
                  <th>Est. Clearance</th>
                  <th>Certificate</th>
                </tr>
              </thead>
              <tbody>
                {checks.map((c) => (
                  <tr key={c.id}>
                    <td>{c.role_title ?? '—'}</td>
                    <td>{c.submitted_at ? new Date(c.submitted_at).toLocaleDateString('en-GB') : '—'}</td>
                    <td><span className="crm-pill pill-y">{c.stage}</span></td>
                    <td>{c.est_clearance ? new Date(c.est_clearance).toLocaleDateString('en-GB') : '—'}</td>
                    <td>
                      {c.certificate_url ? (
                        <button type="button" className="crm-btn crm-btn-s crm-btn-xs" onClick={() => void openCert(c.certificate_url!)}>
                          <i className="fa-solid fa-download" />
                        </button>
                      ) : '—'}
                    </td>
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
