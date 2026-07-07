import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import { useAdminStats } from '../../hooks/useAdminStats'
import { AdminOverviewPage } from './AdminOverviewPage'
import { EmployeesPage, StudentsPage, SuppliersPage } from './PeoplePages'
import { CoursesPage } from './CoursesPage'
import { EnrolmentPage } from './EnrolmentPage'
import { ContentPage } from './ContentPage'
import { DbsPipelinePage } from './DbsPipelinePage'
import { ReportsPage } from './ReportsPage'

export function AdminApp() {
  const location = useLocation()
  const { stats, refresh } = useAdminStats()

  useEffect(() => {
    void refresh()
  }, [location.pathname, refresh])

  const navSections = [
    {
      title: 'Overview',
      items: [{ to: '/dashboard-admin', label: 'Dashboard', icon: 'fa-chart-line', end: true }],
    },
    {
      title: 'People',
      items: [
        { to: '/dashboard-admin/students', label: 'Students', icon: 'fa-graduation-cap', badge: stats.students },
        { to: '/dashboard-admin/employees', label: 'Employees', icon: 'fa-briefcase', badge: stats.employees },
        { to: '/dashboard-admin/suppliers', label: 'Suppliers', icon: 'fa-handshake', badge: stats.suppliers },
      ],
    },
    {
      title: 'Academy LMS',
      items: [
        { to: '/dashboard-admin/courses', label: 'Courses', icon: 'fa-book-open', badge: stats.courses },
        { to: '/dashboard-admin/enrolment', label: 'Enrolment', icon: 'fa-user-plus' },
        { to: '/dashboard-admin/content', label: 'Add Content', icon: 'fa-file-circle-plus' },
      ],
    },
    {
      title: 'Compliance',
      items: [
        { to: '/dashboard-admin/dbs', label: 'DBS Pipeline', icon: 'fa-fingerprint' },
        { to: '/dashboard-admin/reports', label: 'Progress Reports', icon: 'fa-chart-bar' },
      ],
    },
  ]

  return (
    <Routes>
      <Route
        element={
          <DashboardLayout
            brand="Nexusyl CRM"
            brandSub="Admin Panel"
            roleLabel="Administrator"
            rolePillClass="pill-r"
            navSections={navSections}
          />
        }
      >
        <Route index element={<AdminOverviewPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="enrolment" element={<EnrolmentPage />} />
        <Route path="content" element={<ContentPage />} />
        <Route path="dbs" element={<DbsPipelinePage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="*" element={<Navigate to="/dashboard-admin" replace />} />
      </Route>
    </Routes>
  )
}
