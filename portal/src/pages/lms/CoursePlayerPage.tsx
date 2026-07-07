import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useMyEnrollments } from '../../hooks/useMyEnrollments'
import {
  courseProgressPercent,
  fetchModuleProgress,
  isModuleDone,
  markModuleComplete,
  type ModuleProgressRow,
} from '../../hooks/useLmsProgress'
import { ModuleViewer } from '../../components/lms/ModuleViewer'
import { CertificateModal } from '../../components/lms/CertificateModal'
import { MODULE_TYPE_META } from '../../types/database'

interface CoursePlayerPageProps {
  backPath: string
}

export function CoursePlayerPage({ backPath }: CoursePlayerPageProps) {
  const { courseId } = useParams<{ courseId: string }>()
  const { profile } = useAuth()
  const navigate = useNavigate()
  const { courses, refresh: refreshEnrollments } = useMyEnrollments()
  const course = courses.find((c) => c.id === courseId)

  const [moduleIndex, setModuleIndex] = useState(0)
  const [progress, setProgress] = useState<ModuleProgressRow[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const [showCert, setShowCert] = useState(false)

  const modules = course?.course_modules ?? []
  const current = modules[moduleIndex]

  useEffect(() => {
    if (!profile || !courseId) return
    setLoading(true)
    fetchModuleProgress(profile.id, courseId)
      .then(setProgress)
      .finally(() => setLoading(false))
  }, [profile, courseId])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function reloadProgress() {
    if (!profile || !courseId) return
    const rows = await fetchModuleProgress(profile.id, courseId)
    setProgress(rows)
    await refreshEnrollments()
  }

  async function handleMarkComplete() {
    if (!profile || !course || !current) return
    const result = await markModuleComplete(profile.id, course.id, current.id, modules)
    if (result.error) {
      alert(result.error)
      return
    }
    await reloadProgress()
    if (result.courseCompleted) {
      showToast('Course completed! Certificate available.')
      setShowCert(true)
    } else {
      showToast('Module marked complete.')
      if (moduleIndex < modules.length - 1) setModuleIndex((i) => i + 1)
    }
  }

  async function handleQuizComplete(score: number) {
    if (!profile || !course || !current) return
    const passMark = (current.content as { passMark?: number }).passMark ?? course.pass_mark
    if (score < passMark) {
      showToast(`Score ${score}% — need ${passMark}% to pass.`)
      return
    }
    const result = await markModuleComplete(profile.id, course.id, current.id, modules, score)
    if (result.error) {
      alert(result.error)
      return
    }
    await reloadProgress()
    if (result.courseCompleted) {
      showToast('Course completed! Certificate available.')
      setShowCert(true)
    } else if (moduleIndex < modules.length - 1) {
      setModuleIndex((i) => i + 1)
    }
  }

  if (!course) {
    return (
      <div className="crm-card">
        <div className="crm-empty">
          <i className="fa-solid fa-book-open" />
          Course not found or you are not enrolled.
          <div style={{ marginTop: 12 }}>
            <Link to={backPath} className="crm-btn crm-btn-s">Back to courses</Link>
          </div>
        </div>
      </div>
    )
  }

  const pct = courseProgressPercent(progress, modules)

  return (
    <div className="lms-player">
      {toast && <div className="crm-toast"><i className="fa-solid fa-circle-check" /> {toast}</div>}

      <div className="lms-player-top">
        <button type="button" className="crm-btn crm-btn-s crm-btn-xs" onClick={() => navigate(backPath)}>
          <i className="fa-solid fa-arrow-left" /> Back
        </button>
        <div className="lms-player-title-wrap">
          <h2>{course.title}</h2>
          <div className="crm-pb" style={{ maxWidth: 200 }}>
            <div className={`crm-pb-fill${course.enrollment.completed ? ' crm-pb-fill-done' : ''}`} style={{ width: `${pct}%` }} />
          </div>
          <span className="crm-lms-muted">{pct}% complete</span>
        </div>
        {course.enrollment.completed && (
          <button type="button" className="crm-btn crm-btn-p crm-btn-xs" onClick={() => setShowCert(true)}>
            <i className="fa-solid fa-certificate" /> Certificate
          </button>
        )}
      </div>

      <div className="lms-player-layout">
        <aside className="lms-mod-sidebar">
          {modules.map((m, i) => {
            const meta = MODULE_TYPE_META[m.module_type]
            const done = isModuleDone(progress, m.id)
            return (
              <button
                key={m.id}
                type="button"
                className={`lms-mod-item${i === moduleIndex ? ' active' : ''}${done ? ' done' : ''}`}
                onClick={() => setModuleIndex(i)}
              >
                <span className="crm-mod-icon" style={{ background: `${meta.colour}22` }}>
                  <i className={`fa-solid ${meta.icon}`} style={{ color: done ? '#22c55e' : meta.colour }} />
                </span>
                <span className="lms-mod-item-title">{m.title}</span>
              </button>
            )
          })}
        </aside>

        <div className="lms-mod-content crm-card">
          {loading || !current ? (
            <div className="crm-empty"><i className="fa-solid fa-spinner fa-spin" /></div>
          ) : (
            <ModuleViewer
              module={current}
              coursePassMark={course.pass_mark}
              isDone={isModuleDone(progress, current.id)}
              quizScore={progress.find((p) => p.module_id === current.id)?.quiz_score ?? null}
              onMarkComplete={handleMarkComplete}
              onQuizComplete={handleQuizComplete}
            />
          )}
        </div>
      </div>

      <div className="lms-player-nav">
        <button
          type="button"
          className="crm-btn crm-btn-s"
          disabled={moduleIndex === 0}
          onClick={() => setModuleIndex((i) => i - 1)}
        >
          <i className="fa-solid fa-arrow-left" /> Previous
        </button>
        <span className="crm-lms-muted">
          Module {moduleIndex + 1} of {modules.length}
        </span>
        <button
          type="button"
          className="crm-btn crm-btn-p"
          disabled={moduleIndex >= modules.length - 1}
          onClick={() => setModuleIndex((i) => i + 1)}
        >
          Next <i className="fa-solid fa-arrow-right" />
        </button>
      </div>

      <CertificateModal
        open={showCert}
        studentName={profile?.full_name ?? 'Student'}
        courseTitle={course.title}
        onClose={() => setShowCert(false)}
      />
    </div>
  )
}
