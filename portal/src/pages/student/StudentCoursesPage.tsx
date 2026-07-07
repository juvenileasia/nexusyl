import { MyCoursesList } from '../../components/portal/MyCoursesList'

export function StudentCoursesPage() {
  return (
    <div>
      <div className="crm-sec-lbl portal-accent-student">Learning</div>
      <h2 className="crm-page-title">My Courses</h2>
      <MyCoursesList basePath="/dashboard-student" accent="#22c55e" />
    </div>
  )
}
