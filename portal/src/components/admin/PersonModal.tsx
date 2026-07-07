import { useEffect, useState } from 'react'
import type { PersonFormData, ProfileWithDetails } from '../../hooks/useProfiles'
import type { UserRole } from '../../types/database'

interface PersonModalProps {
  open: boolean
  role: UserRole
  person: ProfileWithDetails | null
  onClose: () => void
  onSave: (form: PersonFormData) => Promise<{ error: string | null }>
  onResetPassword?: (password: string) => Promise<{ error: string | null }>
}

const emptyForm: PersonFormData = {
  full_name: '',
  email: '',
  phone: '',
  role_title: '',
  organisation: '',
  dbs_status: 'Not Submitted',
  students_supplied: 0,
  password: '',
  must_change_pass: true,
}

const roleTitles: Record<UserRole, string> = {
  student: 'Add New Student',
  employee: 'Add New Employee',
  supplier: 'Add New Supplier / Partner',
  admin: 'Add Admin',
}

const DBS_OPTIONS = ['Not Submitted', 'Processing', 'Cleared', 'Flagged']

export function PersonModal({
  open,
  role,
  person,
  onClose,
  onSave,
  onResetPassword,
}: PersonModalProps) {
  const [form, setForm] = useState<PersonFormData>(emptyForm)
  const [showPass, setShowPass] = useState(false)
  const [resetPass, setResetPass] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const isEdit = Boolean(person)

  useEffect(() => {
    if (!open) return
    setError('')
    setResetPass('')
    if (person) {
      setForm({
        full_name: person.full_name,
        email: person.email,
        phone: person.profile_details?.phone ?? '',
        role_title: person.profile_details?.role_title ?? '',
        organisation: person.profile_details?.organisation ?? '',
        dbs_status: person.profile_details?.dbs_status ?? 'Not Submitted',
        students_supplied: person.profile_details?.students_supplied ?? 0,
        password: '',
        must_change_pass: false,
      })
    } else {
      setForm({ ...emptyForm, role_title: role === 'student' ? 'Student' : '' })
    }
  }, [open, person, role])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.full_name.trim()) {
      setError('Full name is required.')
      return
    }
    if (!isEdit && (!form.email.trim() || !form.password || form.password.length < 6)) {
      setError('Email and password (min 6 characters) are required for new users.')
      return
    }

    setSaving(true)
    const result = await onSave(form)
    if (!result.error && isEdit && resetPass.length >= 6 && onResetPassword) {
      const pw = await onResetPassword(resetPass)
      if (pw.error) {
        setError(pw.error)
        setSaving(false)
        return
      }
    }
    setSaving(false)

    if (result.error) {
      setError(result.error)
      return
    }
    onClose()
  }

  function setField<K extends keyof PersonFormData>(key: K, value: PersonFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  return (
    <div className="crm-modal-bg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="crm-modal">
        <div className="crm-modal-hd">
          <strong>{isEdit ? `Edit ${role}` : roleTitles[role]}</strong>
          <button type="button" className="crm-modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="crm-modal-bd">
            {error && <div className="err-box" style={{ marginBottom: 12 }}>{error}</div>}

            <label className="crm-lbl">Full Name</label>
            <input className="crm-inp" value={form.full_name} onChange={(e) => setField('full_name', e.target.value)} required />

            <label className="crm-lbl">Email Address</label>
            <input
              className="crm-inp"
              type="email"
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              disabled={isEdit}
              required={!isEdit}
            />

            <div className="crm-form-row">
              <div>
                <label className="crm-lbl">Phone (optional)</label>
                <input className="crm-inp" value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
              </div>
              <div>
                <label className="crm-lbl">{role === 'supplier' ? 'Contact Name' : 'Role / Title'}</label>
                <input className="crm-inp" value={form.role_title} onChange={(e) => setField('role_title', e.target.value)} />
              </div>
            </div>

            {role === 'supplier' && (
              <>
                <label className="crm-lbl">Organisation Name</label>
                <input className="crm-inp" value={form.organisation} onChange={(e) => setField('organisation', e.target.value)} />
                <label className="crm-lbl">Students Supplied</label>
                <input
                  className="crm-inp"
                  type="number"
                  min={0}
                  value={form.students_supplied}
                  onChange={(e) => setField('students_supplied', Number(e.target.value))}
                />
              </>
            )}

            {role === 'employee' && (
              <>
                <label className="crm-lbl">DBS Status</label>
                <select className="crm-inp" value={form.dbs_status} onChange={(e) => setField('dbs_status', e.target.value)}>
                  {DBS_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </>
            )}

            {!isEdit ? (
              <div className="crm-creds-box">
                <div className="crm-creds-title">
                  <i className="fa-solid fa-lock" /> Login Credentials
                </div>
                <label className="crm-lbl">Set Password (min 6 characters)</label>
                <div className="crm-pass-wrap">
                  <input
                    className="crm-inp"
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setField('password', e.target.value)}
                    autoComplete="new-password"
                  />
                  <button type="button" className="crm-pass-toggle" onClick={() => setShowPass((v) => !v)}>
                    <i className={`fa-solid ${showPass ? 'fa-eye-slash' : 'fa-eye'}`} />
                  </button>
                </div>
                <label className="crm-check">
                  <input
                    type="checkbox"
                    checked={form.must_change_pass}
                    onChange={(e) => setField('must_change_pass', e.target.checked)}
                  />
                  Require password change on first login
                </label>
              </div>
            ) : (
              <div className="crm-creds-box">
                <div className="crm-creds-title">
                  <i className="fa-solid fa-key" /> Reset Password (optional)
                </div>
                <input
                  className="crm-inp"
                  type="password"
                  placeholder="Leave blank to keep current password"
                  value={resetPass}
                  onChange={(e) => setResetPass(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            )}
          </div>

          <div className="crm-modal-ft">
            <button type="button" className="crm-btn crm-btn-s" onClick={onClose}>Cancel</button>
            <button type="submit" className="crm-btn crm-btn-p" disabled={saving}>
              {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</> : <><i className="fa-solid fa-floppy-disk" /> Save</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
