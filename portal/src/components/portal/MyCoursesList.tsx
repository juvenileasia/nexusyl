import { Link } from 'react-router-dom'
import { useMyEnrollments } from '../../hooks/useMyEnrollments'
import { MODULE_TYPE_META } from '../../types/database'

interface MyCoursesListProps {
  basePath: string
  accent?: string
}

export function MyCoursesList({ basePath, accent = '#E8211A' }: MyCoursesListProps) {
  const { courses, loading, error } = useMyEnrollments()

  if (loading) return <div className="crm-empty"><i className="fa-solid fa-spinner fa-spin" /></div>
  if (error) return <div className="err-box">{error}</div>
  if (courses.length === 0) {
    return (
      <div className="crm-empty">
        <i className="fa-solid fa-book-open" />
        No courses assigned yet.
      </div>
    )
  }

  return (
    <div className="crm-course-grid">
      {courses.map((course) => (
        <Link key={course.id} to={`${basePath}/courses/${course.id}`} className="crm-course-card lms-course-link">
          <div className="crm-course-stripe" style={{ background: course.colour || accent }} />
          <div className="crm-course-body">
            <div className="crm-course-title">{course.title}</div>
            <p className="crm-course-desc">{course.description ?? 'No description.'}</p>
            <div className="crm-progress-cell" style={{ marginTop: 10 }}>
              <div className="crm-pb">
                <div
                  className={`crm-pb-fill${course.enrollment.completed ? ' crm-pb-fill-done' : ''}`}
                  style={{ width: `${course.enrollment.progress}%`, background: course.enrollment.completed ? undefined : accent }}
                />
              </div>
              <span>{course.enrollment.progress}%</span>
            </div>
            <div className="crm-course-mod-pills" style={{ marginTop: 10 }}>
              {course.course_modules.slice(0, 4).map((m) => (
                <span key={m.id} className={`crm-pill ${MODULE_TYPE_META[m.module_type].pill}`}>
                  {m.title.length > 16 ? `${m.title.slice(0, 16)}…` : m.title}
                </span>
              ))}
            </div>
            {course.enrollment.completed && (
              <span className="crm-pill pill-g" style={{ marginTop: 8, display: 'inline-flex' }}>
                <i className="fa-solid fa-certificate" /> Complete
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
