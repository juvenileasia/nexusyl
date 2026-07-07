import { useState } from 'react'
import { DbsModal, openCertificate } from '../../components/admin/DbsModal'
import {
  deleteDbsCheck,
  dbsStagePill,
  saveDbsCheck,
  useDbsChecks,
} from '../../hooks/useDbsChecks'
import type { DbsCheckWithProfile, DbsFormData } from '../../types/database'

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function DbsPipelinePage() {
  const { checks, stats, loading, error, refresh } = useDbsChecks()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<DbsCheckWithProfile | null>(null)
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  function openAdd() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(check: DbsCheckWithProfile) {
    setEditing(check)
    setModalOpen(true)
  }

  async function handleSave(
    form: DbsFormData,
    checkId?: string,
    certificateUrl?: string | null,
  ) {
    const result = await saveDbsCheck(form, checkId, certificateUrl)
    if (!result.error) {
      showToast(checkId ? 'DBS check updated.' : 'DBS check added.')
      await refresh()
    }
    return result
  }

  async function handleDelete(check: DbsCheckWithProfile) {
    if (!confirm(`Remove DBS record for ${check.profiles?.full_name}?`)) return
    const result = await deleteDbsCheck(check.id, check.profile_id)
    if (result.error) {
      alert(result.error)
      return
    }
    showToast('DBS record removed.')
    await refresh()
  }

  return (
    <div>
      {toast && <div className="crm-toast"><i className="fa-solid fa-circle-check" /> {toast}</div>}

      <div className="crm-page-head">
        <div>
          <div className="crm-sec-lbl">Compliance</div>
          <h2 className="crm-page-title">DBS Pipeline</h2>
        </div>
        <button type="button" className="crm-btn crm-btn-p" onClick={openAdd}>
          <i className="fa-solid fa-plus" /> Add Check
        </button>
      </div>

      {error && <div className="err-box" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="crm-stat-grid crm-stat-grid-4">
        <div className="crm-stat-card">
          <div className="crm-stat-label">Total Submitted</div>
          <div className="crm-stat-value">{stats.total}</div>
        </div>
        <div className="crm-stat-card">
          <div className="crm-stat-label">Processing</div>
          <div className="crm-stat-value" style={{ color: '#eab308' }}>{stats.processing}</div>
        </div>
        <div className="crm-stat-card">
          <div className="crm-stat-label">Cleared</div>
          <div className="crm-stat-value" style={{ color: '#22c55e' }}>{stats.cleared}</div>
        </div>
        <div className="crm-stat-card">
          <div className="crm-stat-label">Flagged</div>
          <div className="crm-stat-value" style={{ color: 'var(--red)' }}>{stats.flagged}</div>
        </div>
      </div>

      <div className="crm-card">
        <div className="crm-card-title">Live DBS Queue</div>

        {loading ? (
          <div className="crm-empty"><i className="fa-solid fa-spinner fa-spin" /> Loading…</div>
        ) : checks.length === 0 ? (
          <div className="crm-empty">
            <i className="fa-solid fa-fingerprint" />
            No DBS checks in the queue yet.
          </div>
        ) : (
          <div className="crm-table-wrap">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Role</th>
                  <th>Submitted</th>
                  <th>Stage</th>
                  <th>Est. Clearance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {checks.map((check) => (
                  <tr key={check.id}>
                    <td style={{ fontWeight: 600, color: 'var(--white)' }}>
                      {check.profiles?.full_name ?? '—'}
                    </td>
                    <td style={{ color: '#888' }}>{check.role_title ?? '—'}</td>
                    <td>{formatDate(check.submitted_at)}</td>
                    <td>
                      <span className={`crm-pill ${dbsStagePill(check.stage)}`}>{check.stage}</span>
                    </td>
                    <td>
                      {check.stage === 'Certificate Issued' ? '—' : formatDate(check.est_clearance)}
                    </td>
                    <td>
                      <div className="crm-actions">
                        {check.certificate_url && (
                          <button
                            type="button"
                            className="crm-btn crm-btn-s crm-btn-xs"
                            title="Download certificate"
                            onClick={() => void openCertificate(check.certificate_url!)}
                          >
                            <i className="fa-solid fa-download" />
                          </button>
                        )}
                        <button
                          type="button"
                          className="crm-btn crm-btn-s crm-btn-xs"
                          title="Edit"
                          onClick={() => openEdit(check)}
                        >
                          <i className="fa-solid fa-pen" />
                        </button>
                        <button
                          type="button"
                          className="crm-btn crm-btn-d crm-btn-xs"
                          title="Delete"
                          onClick={() => void handleDelete(check)}
                        >
                          <i className="fa-solid fa-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DbsModal
        open={modalOpen}
        check={editing}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  )
}
