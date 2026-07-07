import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import { CoursePlayerPage } from '../lms/CoursePlayerPage'
import { StudentOverviewPage } from './StudentOverviewPage'
import { StudentTrackerPage } from './StudentTrackerPage'
import { StudentUploadPage } from './StudentUploadPage'
import { StudentVisaPage } from './StudentVisaPage'
import { StudentCoursesPage } from './StudentCoursesPage'

export function StudentApp() {
  const navSections = [
    {
      title: 'My Application',
      items: [
        { to: '/dashboard-student', label: 'Overview', icon: 'fa-house', end: true },
        { to: '/dashboard-student/tracker', label: 'Application Tracker', icon: 'fa-route' },
      ],
    },
    {
      title: 'Documents',
      items: [
        { to: '/dashboard-student/upload', label: 'Document Upload', icon: 'fa-cloud-arrow-up' },
        { to: '/dashboard-student/visa', label: 'Visa Documents', icon: 'fa-passport' },
      ],
    },
    {
      title: 'Learning',
      items: [{ to: '/dashboard-student/courses', label: 'My Courses', icon: 'fa-play-circle' }],
    },
  ]

  return (
    <Routes>
      <Route
        element={
          <DashboardLayout
            brand="Nexusyl"
            brandSub="Student Portal"
            roleLabel="Student"
            rolePillClass="pill-g"
            navSections={navSections}
          />
        }
      >
        <Route index element={<StudentOverviewPage />} />
        <Route path="tracker" element={<StudentTrackerPage />} />
        <Route path="upload" element={<StudentUploadPage />} />
        <Route path="visa" element={<StudentVisaPage />} />
        <Route path="courses" element={<StudentCoursesPage />} />
        <Route path="courses/:courseId" element={<CoursePlayerPage backPath="/dashboard-student/courses" />} />
        <Route path="*" element={<Navigate to="/dashboard-student" replace />} />
      </Route>
    </Routes>
  )
}
