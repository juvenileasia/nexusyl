import { useCallback, useEffect, useState } from 'react'
import {
  bulkEnrol,
  fetchEnrolledCourseIds,
  fetchPeopleForEnrolment,
  setEnrollmentsForProfile,
  useEnrollments,
} from '../../hooks/useEnrollments'
import { useCourses } from '../../hooks/useCourses'
import type { Profile } from '../../types/database'

type EnrolRole = 'student' | 'employee'
type BulkRole = 'student' | 'employee' | 'both'

export function EnrolmentPage() {
  const { overview, loading: overviewLoading, error: overviewError, refresh: refreshOverview } =
    useEnrollments()
  const { courses, loading: coursesLoading } = useCourses()

  const [enrolRole, setEnrolRole] = useState<EnrolRole>('student')
  const [bulkRole, setBulkRole] = useState<BulkRole>('student')
  const [people, setPeople] = useState<Profile[]>([])
  const [selectedPersonId, setSelectedPersonId] = useState('')
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([])
  const [bulkCourseId, setBulkCourseId] = useState('')
  const [loadingPeople, setLoadingPeople] = useState(true)
  const [saving, setSaving] = useState(false)
  const [bulkSaving, setBulkSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  const loadPeople = useCallback(async (role: EnrolRole) => {
    setLoadingPeople(true)
    setError('')
    try {
      const rows = await fetchPeopleForEnrolment(role)
      setPeople(rows)
      setSelectedPersonId(rows[0]?.id ?? '')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load people.')
      setPeople([])
      setSelectedPersonId('')
    } finally {
      setLoadingPeople(false)
    }
  }, [])

  const loadEnrolments = useCallback(async (profileId: string) => {
    if (!profileId) {
      setSelectedCourseIds([])
      return
    }
    try {
      const ids = await fetchEnrolledCourseIds(profileId)
      setSelectedCourseIds(ids)
    } catch {
      setSelectedCourseIds([])
    }
  }, [])

  useEffect(() => {
    void loadPeople(enrolRole)
  }, [enrolRole, loadPeople])

  useEffect(() => {
    void loadEnrolments(selectedPersonId)
  }, [selectedPersonId, loadEnrolments])

  useEffect(() => {
    if (courses.length && !bulkCourseId) {
      setBulkCourseId(courses[0].id)
    }
  }, [courses, bulkCourseId])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  function toggleCourse(courseId: string) {
    setSelectedCourseIds((ids) =>
      ids.includes(courseId) ? ids.filter((id) => id !== courseId) : [...ids, courseId],
    )
  }

  async function handleSaveEnrolment() {
    if (!selectedPersonId) {
      setError('Please select a person.')
      return
    }
    setSaving(true)
    setError('')
    const result = await setEnrollmentsForProfile(selectedPersonId, selectedCourseIds)
    setSaving(false)
    if (result.error) {
      setError(result.error)
      return
    }
    const person = people.find((p) => p.id === selectedPersonId)
    showToast(`Enrolment saved for ${person?.full_name ?? 'user'}.`)
    await refreshOverview()
  }

  async function handleBulkEnrol() {
    if (!bulkCourseId) {
      setError('Please select a course.')
      return
    }
    const roles: EnrolRole[] =
      bulkRole === 'both' ? ['student', 'employee'] : [bulkRole]

    setBulkSaving(true)
    setError('')
    const result = await bulkEnrol(bulkCourseId, roles)
    setBulkSaving(false)

    if (result.error) {
      setError(result.error)
      return
    }
    showToast(
      result.count > 0
        ? `Enrolled ${result.count} people successfully.`
        : 'Everyone in that group is already enrolled.',
    )
    await refreshOverview()
    if (selectedPersonId) await loadEnrolments(selectedPersonId)
  }

  const loading = overviewLoading || coursesLoading || loadingPeople

  return (
    <div>
      {toast && <div className="crm-toast"><i className="fa-solid fa-circle-check" /> {toast}</div>}

      <div className="crm-page-head">
        <div>
          <div className="crm-sec-lbl">Academy LMS</div>
          <h2 className="crm-page-title">Course Enrolment</h2>
        </div>
      </div>

      {(error || overviewError) && (
        <div className="err-box" style={{ marginBottom: 16 }}>{error || overviewError}</div>
      )}

      <div className="crm-enrol-grid">
        <div className="crm-card">
          <div className="crm-card-title">Per-Person Enrolment</div>

          <div className="crm-type-tabs">
            {(['student', 'employee'] as EnrolRole[]).map((role) => (
              <button
                key={role}
                type="button"
                className={`crm-type-tab${enrolRole === role ? ' active' : ''}`}
                onClick={() => setEnrolRole(role)}
              >
                {role === 'student' ? 'Students' : 'Employees'}
              </button>
            ))}
          </div>

          <label className="crm-lbl">Select Person</label>
          <select
            className="crm-inp"
            value={selectedPersonId}
            onChange={(e) => setSelectedPersonId(e.target.value)}
            disabled={loadingPeople || people.length === 0}
          >
            {people.length === 0 ? (
              <option value="">No {enrolRole}s found</option>
            ) : (
              people.map((p) => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))
            )}
          </select>

          <label className="crm-lbl" style={{ marginTop: 14 }}>Assign Courses</label>
          {loading ? (
            <div className="crm-empty" style={{ padding: 20 }}><i className="fa-solid fa-spinner fa-spin" /></div>
          ) : courses.length === 0 ? (
            <p className="crm-lms-muted">No courses available. Create a course first.</p>
          ) : (
            <div className="crm-enrol-chips">
              {courses.map((c) => (
                <label key={c.id} className="crm-enroll-chip">
                  <input
                    type="checkbox"
                    checked={selectedCourseIds.includes(c.id)}
                    onChange={() => toggleCourse(c.id)}
                  />
                  <span className="crm-enrol-dot" style={{ background: c.colour }} />
                  <span className="crm-enrol-chip-title">{c.title}</span>
                  <span className="crm-enrol-chip-meta">{c.course_modules.length} modules</span>
                </label>
              ))}
            </div>
          )}

          <button
            type="button"
            className="crm-btn crm-btn-p"
            style={{ marginTop: 14 }}
            disabled={saving || !selectedPersonId}
            onClick={() => void handleSaveEnrolment()}
          >
            {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</> : <><i className="fa-solid fa-floppy-disk" /> Save Enrolment</>}
          </button>
        </div>

        <div className="crm-card">
          <div className="crm-card-title">Bulk Enrolment</div>
          <p className="crm-lms-muted" style={{ marginBottom: 12 }}>
            Enrol all students or employees in a single course at once.
          </p>

          <label className="crm-lbl">Target Group</label>
          <div className="crm-type-tabs">
            {([
              ['student', 'All Students'],
              ['employee', 'All Employees'],
              ['both', 'Both'],
            ] as const).map(([role, label]) => (
              <button
                key={role}
                type="button"
                className={`crm-type-tab${bulkRole === role ? ' active' : ''}`}
                onClick={() => setBulkRole(role)}
              >
                {label}
              </button>
            ))}
          </div>

          <label className="crm-lbl">Course</label>
          <select
            className="crm-inp"
            value={bulkCourseId}
            onChange={(e) => setBulkCourseId(e.target.value)}
            disabled={courses.length === 0}
          >
            {courses.length === 0 ? (
              <option value="">No courses yet</option>
            ) : (
              courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))
            )}
          </select>

          <button
            type="button"
            className="crm-btn crm-btn-p"
            style={{ marginTop: 14 }}
            disabled={bulkSaving || !bulkCourseId}
            onClick={() => void handleBulkEnrol()}
          >
            {bulkSaving ? <><i className="fa-solid fa-spinner fa-spin" /> Enrolling…</> : <><i className="fa-solid fa-users" /> Bulk Enrol</>}
          </button>
        </div>
      </div>

      <div className="crm-card" style={{ marginTop: 20 }}>
        <div className="crm-card-title">Enrolment Overview</div>
        {overviewLoading ? (
          <div className="crm-empty" style={{ padding: 20 }}><i className="fa-solid fa-spinner fa-spin" /></div>
        ) : overview.length === 0 ? (
          <p className="crm-lms-muted">No courses yet.</p>
        ) : (
          overview.map((row) => (
            <div key={row.course_id} className="crm-enrol-overview-row">
              <span className="crm-enrol-dot" style={{ background: row.colour }} />
              <span className="crm-enrol-overview-title">{row.course_title}</span>
              <span className="crm-enrol-chip-meta">
                {row.student_count} students · {row.employee_count} employees
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
