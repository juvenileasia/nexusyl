import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import { CoursePlayerPage } from '../lms/CoursePlayerPage'
import { EmployeeOverviewPage } from './EmployeeOverviewPage'
import { EmployeeCoursesPage } from './EmployeeCoursesPage'
import { EmployeeDbsPage } from './EmployeeDbsPage'
import { EmployeeCompliancePage } from './EmployeeCompliancePage'

export function EmployeeApp() {
  const navSections = [
    {
      title: 'Workspace',
      items: [{ to: '/dashboard-employee', label: 'Overview', icon: 'fa-house', end: true }],
    },
    {
      title: 'Learning',
      items: [{ to: '/dashboard-employee/courses', label: 'My Courses', icon: 'fa-play-circle' }],
    },
    {
      title: 'Compliance',
      items: [
        { to: '/dashboard-employee/dbs', label: 'DBS Pipeline', icon: 'fa-fingerprint' },
        { to: '/dashboard-employee/compliance', label: 'Resources', icon: 'fa-shield-halved' },
      ],
    },
  ]

  return (
    <Routes>
      <Route
        element={
          <DashboardLayout
            brand="Nexusyl"
            brandSub="Employee Portal"
            roleLabel="Employee"
            rolePillClass="pill-b"
            navSections={navSections}
          />
        }
      >
        <Route index element={<EmployeeOverviewPage />} />
        <Route path="courses" element={<EmployeeCoursesPage />} />
        <Route path="courses/:courseId" element={<CoursePlayerPage backPath="/dashboard-employee/courses" />} />
        <Route path="dbs" element={<EmployeeDbsPage />} />
        <Route path="compliance" element={<EmployeeCompliancePage />} />
        <Route path="*" element={<Navigate to="/dashboard-employee" replace />} />
      </Route>
    </Routes>
  )
}
