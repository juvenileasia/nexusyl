import { useEffect, useState } from 'react'
import { fetchCourseEnrollments } from '../../hooks/useEnrollments'
import type { CourseWithModules, EnrollmentWithProfile } from '../../types/database'
import { MODULE_TYPE_META } from '../../types/database'

interface CourseViewModalProps {
  open: boolean
  course: CourseWithModules | null
  onClose: () => void
  onEdit: () => void
}

function initials(name: string) {
  return name.split(' ').map((w) => w[0] ?? '').slice(0, 2).join('').toUpperCase()
}

export function CourseViewModal({ open, course, onClose, onEdit }: CourseViewModalProps) {
  const [enrollments, setEnrollments] = useState<EnrollmentWithProfile[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !course) return
    setLoading(true)
    fetchCourseEnrollments(course.id)
      .then(setEnrollments)
      .catch(() => setEnrollments([]))
      .finally(() => setLoading(false))
  }, [open, course])

  if (!open || !course) return null

  return (
    <div className="crm-modal-bg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="crm-modal crm-modal-lg">
        <div className="crm-modal-hd">
          <strong>{course.title}</strong>
          <button type="button" className="crm-modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="crm-modal-bd">
          <div className="crm-course-stripe" style={{ background: course.colour }} />

          <div className="crm-lms-pills">
            <span className="crm-pill pill-b">{course.category ?? 'General'}</span>
            <span className="crm-pill">Pass: {course.pass_mark}%</span>
            <span className="crm-pill">{course.enrollment_count} enrolled</span>
            {!course.published && <span className="crm-pill pill-y">Draft</span>}
          </div>

          {course.description && (
            <p className="crm-lms-desc">{course.description}</p>
          )}

          <div className="crm-lms-section-title">Modules ({course.course_modules.length})</div>
          {course.course_modules.length === 0 ? (
            <p className="crm-lms-muted">No modules yet.</p>
          ) : (
            course.course_modules.map((m) => {
              const meta = MODULE_TYPE_META[m.module_type]
              return (
                <div key={m.id} className="crm-view-mod-row">
                  <div className="crm-mod-icon" style={{ background: 'rgba(255,255,255,.05)' }}>
                    <i className={`fa-solid ${meta.icon}`} style={{ color: '#888', fontSize: '0.72rem' }} />
                  </div>
                  <div>
                    <div className="crm-view-mod-title">{m.title}</div>
                    <div className="crm-lms-muted">
                      {m.module_type} · {m.duration ?? '—'}
                    </div>
                  </div>
                </div>
              )
            })
          )}

          {enrollments.length > 0 && (
            <>
              <div className="crm-lms-section-title" style={{ marginTop: 18 }}>
                Enrolled ({enrollments.length})
              </div>
              {loading ? (
                <div className="crm-empty"><i className="fa-solid fa-spinner fa-spin" /></div>
              ) : (
                enrollments.map((e) => (
                  <div key={e.id} className="crm-enrol-progress-row">
                    <span className="crm-avatar" style={{ width: 26, height: 26, fontSize: '0.62rem' }}>
                      {initials(e.profiles?.full_name ?? '?')}
                    </span>
                    <div className="crm-enrol-progress-info">
                      <div className="crm-view-mod-title">{e.profiles?.full_name}</div>
                      <div className="crm-pb">
                        <div
                          className={`crm-pb-fill${e.completed ? ' crm-pb-fill-done' : ''}`}
                          style={{ width: `${e.progress}%` }}
                        />
                      </div>
                    </div>
                    <span className={`crm-enrol-pct${e.completed ? ' done' : ''}`}>{e.progress}%</span>
                  </div>
                ))
              )}
            </>
          )}
        </div>

        <div className="crm-modal-ft">
          <button type="button" className="crm-btn crm-btn-s" onClick={onClose}>Close</button>
          <button type="button" className="crm-btn crm-btn-p" onClick={onEdit}>
            <i className="fa-solid fa-pen" /> Edit Course
          </button>
        </div>
      </div>
    </div>
  )
}
