import { useState } from 'react'
import { CourseModal } from '../../components/admin/CourseModal'
import { CourseViewModal } from '../../components/admin/CourseViewModal'
import { deleteCourse, saveCourse, useCourses } from '../../hooks/useCourses'
import type { CourseFormData, CourseWithModules } from '../../types/database'
import { MODULE_TYPE_META } from '../../types/database'

export function CoursesPage() {
  const { courses, loading, error, refresh } = useCourses()
  const [modalOpen, setModalOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [editing, setEditing] = useState<CourseWithModules | null>(null)
  const [viewing, setViewing] = useState<CourseWithModules | null>(null)
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(course: CourseWithModules) {
    setEditing(course)
    setModalOpen(true)
    setViewOpen(false)
  }

  function openView(course: CourseWithModules) {
    setViewing(course)
    setViewOpen(true)
  }

  async function handleSave(form: CourseFormData, courseId?: string) {
    const result = await saveCourse(form, courseId)
    if (!result.error) {
      showToast(courseId ? 'Course updated.' : 'Course created successfully.')
      await refresh()
    }
    return result
  }

  async function handleDelete(course: CourseWithModules) {
    if (!confirm(`Delete "${course.title}"? Enrolments will also be removed.`)) return
    const result = await deleteCourse(course.id)
    if (result.error) {
      alert(result.error)
      return
    }
    showToast('Course deleted.')
    await refresh()
  }

  return (
    <div>
      {toast && <div className="crm-toast"><i className="fa-solid fa-circle-check" /> {toast}</div>}

      <div className="crm-page-head">
        <div>
          <div className="crm-sec-lbl">Academy LMS</div>
          <h2 className="crm-page-title">Course Manager</h2>
        </div>
        <button type="button" className="crm-btn crm-btn-p" onClick={openCreate}>
          <i className="fa-solid fa-plus" /> Create Course
        </button>
      </div>

      {error && <div className="err-box" style={{ marginBottom: 16 }}>{error}</div>}

      {loading ? (
        <div className="crm-card"><div className="crm-empty"><i className="fa-solid fa-spinner fa-spin" /> Loading…</div></div>
      ) : courses.length === 0 ? (
        <div className="crm-card">
          <div className="crm-empty">
            <i className="fa-solid fa-book-open" />
            No courses yet. Create your first course above.
          </div>
        </div>
      ) : (
        <div className="crm-course-grid">
          {courses.map((course) => (
            <div key={course.id} className="crm-course-card">
              <div className="crm-course-stripe" style={{ background: course.colour }} />
              <div className="crm-course-body">
                <div className="crm-course-top">
                  <div>
                    <span className="crm-pill pill-b" style={{ marginBottom: 6, display: 'inline-flex' }}>
                      {course.category ?? 'General'}
                    </span>
                    <div className="crm-course-title">{course.title}</div>
                  </div>
                  <div className="crm-actions">
                    <button type="button" className="crm-btn crm-btn-s crm-btn-xs" onClick={() => openView(course)} title="View">
                      <i className="fa-solid fa-eye" />
                    </button>
                    <button type="button" className="crm-btn crm-btn-s crm-btn-xs" onClick={() => openEdit(course)} title="Edit">
                      <i className="fa-solid fa-pen" />
                    </button>
                    <button type="button" className="crm-btn crm-btn-d crm-btn-xs" onClick={() => void handleDelete(course)} title="Delete">
                      <i className="fa-solid fa-trash" />
                    </button>
                  </div>
                </div>

                <p className="crm-course-desc">
                  {(course.description ?? '').length > 90
                    ? `${course.description!.slice(0, 90)}…`
                    : course.description || 'No description.'}
                </p>

                <div className="crm-course-meta">
                  <span>
                    <i className="fa-solid fa-puzzle-piece" style={{ color: course.colour }} />{' '}
                    {course.course_modules.length} modules
                  </span>
                  <span>
                    <i className="fa-solid fa-users" style={{ color: course.colour }} />{' '}
                    {course.enrollment_count} enrolled
                  </span>
                  <span>
                    <i className="fa-solid fa-star" style={{ color: course.colour }} />{' '}
                    Pass: {course.pass_mark}%
                  </span>
                </div>

                {course.course_modules.length > 0 && (
                  <div className="crm-course-mod-pills">
                    {course.course_modules.map((m) => (
                      <span key={m.id} className={`crm-pill ${MODULE_TYPE_META[m.module_type].pill}`}>
                        <i className={`fa-solid ${MODULE_TYPE_META[m.module_type].icon}`} />{' '}
                        {m.title.length > 20 ? `${m.title.slice(0, 20)}…` : m.title}
                      </span>
                    ))}
                  </div>
                )}

                {!course.published && (
                  <span className="crm-pill pill-y" style={{ marginTop: 8, display: 'inline-flex' }}>Draft</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <CourseModal
        open={modalOpen}
        course={editing}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />

      <CourseViewModal
        open={viewOpen}
        course={viewing}
        onClose={() => setViewOpen(false)}
        onEdit={() => {
          if (viewing) openEdit(viewing)
        }}
      />
    </div>
  )
}
