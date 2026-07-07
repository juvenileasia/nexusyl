import { useState } from 'react'
import {
  createPortalUser,
  deletePortalUser,
  resetUserPassword,
  updatePortalUser,
  useProfiles,
  type PersonFormData,
  type ProfileWithDetails,
} from '../../hooks/useProfiles'
import type { UserRole } from '../../types/database'
import { PersonModal } from '../../components/admin/PersonModal'

function initials(name: string) {
  return name.split(' ').map((w) => w[0] ?? '').slice(0, 2).join('').toUpperCase()
}

interface PeopleManagementPageProps {
  role: UserRole
  title: string
  phase: string
  addLabel: string
  avatarColor?: string
}

export function PeopleManagementPage({
  role,
  title,
  phase,
  addLabel,
  avatarColor = '#E8211A',
}: PeopleManagementPageProps) {
  const { people, loading, error, refresh } = useProfiles(role)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ProfileWithDetails | null>(null)
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  function openAdd() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(person: ProfileWithDetails) {
    setEditing(person)
    setModalOpen(true)
  }

  async function handleSave(form: PersonFormData) {
    if (editing) {
      const result = await updatePortalUser(editing.id, role, form)
      if (!result.error) {
        showToast('Person updated.')
        await refresh()
      }
      return result
    }
    const result = await createPortalUser(role, form)
    if (!result.error) {
      showToast('Person created.')
      await refresh()
    }
    return result
  }

  async function handleResetPassword(password: string) {
    if (!editing) return { error: null }
    return resetUserPassword(editing.id, password)
  }

  async function handleDelete(person: ProfileWithDetails) {
    if (!confirm(`Delete ${person.full_name}? This cannot be undone.`)) return
    const result = await deletePortalUser(person.id)
    if (result.error) {
      alert(result.error)
      return
    }
    showToast('Person deleted.')
    await refresh()
  }

  return (
    <div>
      {toast && <div className="crm-toast"><i className="fa-solid fa-circle-check" /> {toast}</div>}

      <div className="crm-page-head">
        <div>
          <div className="crm-sec-lbl">{phase}</div>
          <h2 className="crm-page-title">{title}</h2>
        </div>
        <button type="button" className="crm-btn crm-btn-p" onClick={openAdd}>
          <i className="fa-solid fa-user-plus" /> {addLabel}
        </button>
      </div>

      {error && <div className="err-box" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="crm-card">
        {loading ? (
          <div className="crm-empty"><i className="fa-solid fa-spinner fa-spin" /> Loading…</div>
        ) : people.length === 0 ? (
          <div className="crm-empty">
            <i className={`fa-solid ${role === 'student' ? 'fa-graduation-cap' : role === 'employee' ? 'fa-briefcase' : 'fa-handshake'}`} />
            No {role}s yet. Add your first one above.
          </div>
        ) : (
          <div className="crm-table-wrap">
            <table className="crm-table">
              <thead>
                <tr>
                  {role === 'supplier' ? (
                    <>
                      <th>Organisation</th>
                      <th>Contact Email</th>
                      <th>Type</th>
                      <th>Students Supplied</th>
                    </>
                  ) : role === 'employee' ? (
                    <>
                      <th>Employee</th>
                      <th>Email</th>
                      <th>Role / Department</th>
                      <th>Training Progress</th>
                      <th>DBS Status</th>
                    </>
                  ) : (
                    <>
                      <th>Student</th>
                      <th>Email</th>
                      <th>Enrolled Courses</th>
                      <th>Progress</th>
                      <th>Status</th>
                    </>
                  )}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {people.map((p) => (
                  <tr key={p.id}>
                    {role === 'supplier' ? (
                      <>
                        <td>
                          <div className="crm-person-cell">
                            <span className="crm-avatar" style={{ background: '#eab308', color: '#000' }}>
                              {initials(p.profile_details?.organisation || p.full_name)}
                            </span>
                            <div>
                              <strong>{p.profile_details?.organisation || p.full_name}</strong>
                              <small>{p.full_name}</small>
                            </div>
                          </div>
                        </td>
                        <td>{p.email}</td>
                        <td>{p.profile_details?.role_title || 'Partner'}</td>
                        <td><strong>{p.profile_details?.students_supplied ?? 0}</strong></td>
                      </>
                    ) : role === 'employee' ? (
                      <>
                        <td>
                          <div className="crm-person-cell">
                            <span className="crm-avatar" style={{ background: '#3b82f6' }}>{initials(p.full_name)}</span>
                            <strong>{p.full_name}</strong>
                          </div>
                        </td>
                        <td>{p.email}</td>
                        <td>{p.profile_details?.role_title || '—'}</td>
                        <td>
                          <div className="crm-progress-cell">
                            <div className="crm-pb"><div className="crm-pb-fill" style={{ width: `${p.avg_progress}%`, background: '#3b82f6' }} /></div>
                            <span>{p.avg_progress}%</span>
                          </div>
                        </td>
                        <td>
                          <span className={`crm-pill ${dbsPill(p.profile_details?.dbs_status)}`}>
                            {p.profile_details?.dbs_status || 'Not Submitted'}
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>
                          <div className="crm-person-cell">
                            <span className="crm-avatar" style={{ background: avatarColor }}>{initials(p.full_name)}</span>
                            <div>
                              <strong>{p.full_name}</strong>
                              <small>{p.profile_details?.role_title || 'Student'}</small>
                            </div>
                          </div>
                        </td>
                        <td>{p.email}</td>
                        <td><strong>{p.enrollment_count}</strong></td>
                        <td>
                          <div className="crm-progress-cell">
                            <div className="crm-pb"><div className="crm-pb-fill" style={{ width: `${p.avg_progress}%` }} /></div>
                            <span>{p.avg_progress}%</span>
                          </div>
                        </td>
                        <td>
                          <span className={`crm-pill ${p.completed_count > 0 ? 'pill-g' : 'pill-y'}`}>
                            {p.completed_count > 0 ? `${p.completed_count} cert` : 'In Progress'}
                          </span>
                        </td>
                      </>
                    )}
                    <td>
                      <div className="crm-actions">
                        <button type="button" className="crm-btn crm-btn-s crm-btn-xs" onClick={() => openEdit(p)} title="Edit">
                          <i className="fa-solid fa-pen" />
                        </button>
                        <button type="button" className="crm-btn crm-btn-d crm-btn-xs" onClick={() => void handleDelete(p)} title="Delete">
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

      <PersonModal
        open={modalOpen}
        role={role}
        person={editing}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onResetPassword={editing ? handleResetPassword : undefined}
      />
    </div>
  )
}

function dbsPill(status?: string) {
  if (status === 'Cleared') return 'pill-g'
  if (status === 'Processing') return 'pill-y'
  if (status === 'Flagged') return 'pill-r'
  return 'pill-r'
}
