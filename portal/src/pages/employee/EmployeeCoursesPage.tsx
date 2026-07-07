import { MyCoursesList } from '../../components/portal/MyCoursesList'

export function EmployeeCoursesPage() {
  return (
    <div>
      <div className="crm-sec-lbl">Learning</div>
      <h2 className="crm-page-title">My Courses</h2>
      <MyCoursesList basePath="/dashboard-employee" accent="#3b82f6" />
    </div>
  )
}
