import { useEffect, useState } from 'react'
import { ModuleBuilder } from './ModuleBuilder'
import type { CourseFormData, CourseWithModules } from '../../types/database'
import { COURSE_CATEGORIES, COURSE_COLOURS } from '../../types/database'
import { courseToFormData } from '../../hooks/useCourses'

interface CourseModalProps {
  open: boolean
  course: CourseWithModules | null
  onClose: () => void
  onSave: (form: CourseFormData, courseId?: string) => Promise<{ error: string | null }>
}

const emptyForm: CourseFormData = {
  title: '',
  description: '',
  category: 'Compliance',
  colour: '#E8211A',
  pass_mark: 70,
  published: true,
  modules: [],
}

export function CourseModal({ open, course, onClose, onSave }: CourseModalProps) {
  const [form, setForm] = useState<CourseFormData>(emptyForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const isEdit = Boolean(course)

  useEffect(() => {
    if (!open) return
    setError('')
    setForm(course ? courseToFormData(course) : emptyForm)
  }, [open, course])

  if (!open) return null

  function setField<K extends keyof CourseFormData>(key: K, value: CourseFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.title.trim()) {
      setError('Course title is required.')
      return
    }

    setSaving(true)
    const result = await onSave(form, course?.id)
    setSaving(false)

    if (result.error) {
      setError(result.error)
      return
    }
    onClose()
  }

  return (
    <div className="crm-modal-bg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="crm-modal crm-modal-lg">
        <div className="crm-modal-hd">
          <strong>{isEdit ? 'Edit Course' : 'Create New Course'}</strong>
          <button type="button" className="crm-modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="crm-modal-bd">
            {error && <div className="err-box" style={{ marginBottom: 12 }}>{error}</div>}

            <label className="crm-lbl">Course Title</label>
            <input
              className="crm-inp"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              required
            />

            <label className="crm-lbl">Description</label>
            <textarea
              className="crm-inp crm-textarea"
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="Brief course overview…"
            />

            <div className="crm-form-row">
              <div>
                <label className="crm-lbl">Category</label>
                <select
                  className="crm-inp"
                  value={form.category}
                  onChange={(e) => setField('category', e.target.value)}
                >
                  {COURSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="crm-lbl">Pass Mark (%)</label>
                <input
                  className="crm-inp"
                  type="number"
                  min={1}
                  max={100}
                  value={form.pass_mark}
                  onChange={(e) => setField('pass_mark', parseInt(e.target.value, 10) || 70)}
                />
              </div>
            </div>

            <label className="crm-lbl">Course Colour</label>
            <div className="crm-swatch-row">
              {COURSE_COLOURS.map((colour) => (
                <button
                  key={colour}
                  type="button"
                  className={`crm-swatch${form.colour === colour ? ' selected' : ''}`}
                  style={{ background: colour }}
                  onClick={() => setField('colour', colour)}
                  title={colour}
                />
              ))}
            </div>

            <label className="crm-check" style={{ marginTop: 14 }}>
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setField('published', e.target.checked)}
              />
              Published (visible to enrolled users)
            </label>

            <div className="crm-lms-section-title">
              <i className="fa-solid fa-puzzle-piece" /> Modules
            </div>
            <ModuleBuilder modules={form.modules} onChange={(modules) => setField('modules', modules)} />
          </div>

          <div className="crm-modal-ft">
            <button type="button" className="crm-btn crm-btn-s" onClick={onClose}>Cancel</button>
            <button type="submit" className="crm-btn crm-btn-p" disabled={saving}>
              {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</> : <><i className="fa-solid fa-floppy-disk" /> Save Course</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
