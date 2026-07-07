import { roleColour, useProgressReports } from '../../hooks/useProgressReports'

function initials(name: string) {
  return name.split(' ').map((w) => w[0] ?? '').slice(0, 2).join('').toUpperCase()
}

export function ReportsPage() {
  const { reports, loading, error } = useProgressReports()

  return (
    <div>
      <div className="crm-page-head">
        <div>
          <div className="crm-sec-lbl">Analytics</div>
          <h2 className="crm-page-title">Progress Reports</h2>
        </div>
      </div>

      {error && <div className="err-box" style={{ marginBottom: 16 }}>{error}</div>}

      {loading ? (
        <div className="crm-card">
          <div className="crm-empty"><i className="fa-solid fa-spinner fa-spin" /> Loading…</div>
        </div>
      ) : reports.length === 0 ? (
        <div className="crm-card">
          <div className="crm-empty">
            <i className="fa-solid fa-chart-bar" />
            Add people and course enrolments to see progress reports.
          </div>
        </div>
      ) : (
        reports.map((report) => (
          <div key={report.profile.id} className="crm-card crm-report-card">
            <div className="crm-report-hd">
              <span
                className="crm-avatar"
                style={{ background: roleColour(report.profile.role), width: 32, height: 32, fontSize: '0.72rem' }}
              >
                {initials(report.profile.full_name)}
              </span>
              <div>
                <div className="crm-report-name">{report.profile.full_name}</div>
                <div className="crm-lms-muted">
                  {report.profile.email} · {report.profile.role}
                </div>
              </div>
            </div>

            <div className="crm-table-wrap">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Progress</th>
                    <th>%</th>
                    <th>Status</th>
                    <th>Quiz Scores</th>
                  </tr>
                </thead>
                <tbody>
                  {report.courses.map((course) => (
                    <tr key={course.course_id}>
                      <td style={{ fontWeight: 600, color: 'var(--white)' }}>{course.course_title}</td>
                      <td>
                        <div className="crm-pb" style={{ width: 120 }}>
                          <div
                            className={`crm-pb-fill${course.completed ? ' crm-pb-fill-done' : ''}`}
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, color: course.completed ? '#22c55e' : 'var(--red)' }}>
                        {course.progress}%
                      </td>
                      <td>
                        <span className={`crm-pill ${course.completed ? 'pill-g' : 'pill-y'}`}>
                          {course.completed ? 'Complete' : 'In Progress'}
                        </span>
                      </td>
                      <td className="crm-report-quiz">
                        {course.quiz_scores.length > 0
                          ? course.quiz_scores.map((q) => (
                              <span key={`${course.course_id}-${q.module_title}`}>
                                {q.module_title}: <strong>{q.score}%</strong>
                              </span>
                            ))
                          : '–'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
