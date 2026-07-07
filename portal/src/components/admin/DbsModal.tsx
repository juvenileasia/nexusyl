import { useEffect, useState } from 'react'
import { uploadDocument, getDocumentSignedUrl } from '../../lib/documents'
import type { DbsCheckWithProfile, DbsFormData } from '../../types/database'
import { DBS_STAGES } from '../../types/database'
import { fetchDbsCandidates } from '../../hooks/useDbsChecks'

interface DbsModalProps {
  open: boolean
  check: DbsCheckWithProfile | null
  onClose: () => void
  onSave: (
    form: DbsFormData,
    checkId?: string,
    certificateUrl?: string | null,
  ) => Promise<{ error: string | null }>
}

const emptyForm: DbsFormData = {
  profile_id: '',
  role_title: '',
  stage: 'Data Submitted',
  submitted_at: new Date().toISOString().slice(0, 10),
  est_clearance: '',
  notes: '',
}

export function DbsModal({ open, check, onClose, onSave }: DbsModalProps) {
  const [form, setForm] = useState<DbsFormData>(emptyForm)
  const [candidates, setCandidates] = useState<
    { id: string; full_name: string; email: string; role: string; role_title: string | null }[]
  >([])
  const [certFile, setCertFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const isEdit = Boolean(check)

  useEffect(() => {
    if (!open) return
    setError('')
    setCertFile(null)
    fetchDbsCandidates()
      .then(setCandidates)
      .catch(() => setCandidates([]))

    if (check) {
      setForm({
        profile_id: check.profile_id,
        role_title: check.role_title ?? '',
        stage: check.stage,
        submitted_at: check.submitted_at ?? '',
        est_clearance: check.est_clearance ?? '',
        notes: check.notes ?? '',
      })
    } else {
      setForm(emptyForm)
    }
  }, [open, check])

  useEffect(() => {
    if (!open || isEdit || !form.profile_id) return
    const person = candidates.find((c) => c.id === form.profile_id)
    if (person?.role_title && !form.role_title) {
      setForm((f) => ({ ...f, role_title: person.role_title ?? '' }))
    }
  }, [form.profile_id, candidates, open, isEdit, form.role_title])

  if (!open) return null

  function setField<K extends keyof DbsFormData>(key: K, value: DbsFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.profile_id) {
      setError('Please select an applicant.')
      return
    }

    setSaving(true)
    let certificateUrl: string | null | undefined

    if (certFile) {
      const uploaded = await uploadDocument(form.profile_id, 'dbs_certificate', certFile)
      if (uploaded.error) {
        setError(uploaded.error)
        setSaving(false)
        return
      }
      certificateUrl = uploaded.data?.storage_path ?? null
    }

    const result = await onSave(form, check?.id, certificateUrl)
    setSaving(false)

    if (result.error) {
      setError(result.error)
      return
    }
    onClose()
  }

  return (
    <div className="crm-modal-bg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="crm-modal">
        <div className="crm-modal-hd">
          <strong>{isEdit ? 'Edit DBS Check' : 'Add DBS Check'}</strong>
          <button type="button" className="crm-modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="crm-modal-bd">
            {error && <div className="err-box" style={{ marginBottom: 12 }}>{error}</div>}

            <label className="crm-lbl">Applicant</label>
            <select
              className="crm-inp"
              value={form.profile_id}
              onChange={(e) => setField('profile_id', e.target.value)}
              disabled={isEdit}
              required
            >
              <option value="">Select person…</option>
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.role})
                </option>
              ))}
            </select>

            <label className="crm-lbl">Role / Position</label>
            <input
              className="crm-inp"
              value={form.role_title}
              onChange={(e) => setField('role_title', e.target.value)}
              placeholder="e.g. Kitchen Assistant"
            />

            <div className="crm-form-row">
              <div>
                <label className="crm-lbl">Stage</label>
                <select
                  className="crm-inp"
                  value={form.stage}
                  onChange={(e) => setField('stage', e.target.value)}
                >
                  {DBS_STAGES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="crm-lbl">Submitted</label>
                <input
                  className="crm-inp"
                  type="date"
                  value={form.submitted_at}
                  onChange={(e) => setField('submitted_at', e.target.value)}
                />
              </div>
            </div>

            <label className="crm-lbl">Est. Clearance</label>
            <input
              className="crm-inp"
              type="date"
              value={form.est_clearance}
              onChange={(e) => setField('est_clearance', e.target.value)}
            />

            <label className="crm-lbl">Notes (optional)</label>
            <textarea
              className="crm-inp crm-textarea"
              value={form.notes}
              onChange={(e) => setField('notes', e.target.value)}
              placeholder="Internal notes…"
            />

            <label className="crm-lbl">Certificate (PDF, max 10 MB)</label>
            <input
              className="crm-inp"
              type="file"
              accept=".pdf"
              onChange={(e) => setCertFile(e.target.files?.[0] ?? null)}
            />
            {check?.certificate_url && !certFile && (
              <p className="crm-lms-muted" style={{ marginTop: 6 }}>
                <i className="fa-solid fa-file-pdf" /> Certificate on file
              </p>
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

export async function openCertificate(storagePath: string) {
  const { url, error } = await getDocumentSignedUrl(storagePath)
  if (error || !url) {
    alert(error ?? 'Could not open certificate.')
    return
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}
