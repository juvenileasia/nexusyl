import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import { SupplierOverviewPage } from './SupplierOverviewPage'
import { SupplierPipelinePage } from './SupplierPipelinePage'
import { SupplierEmployeesPage } from './SupplierEmployeesPage'
import { SupplierContractsPage } from './SupplierContractsPage'
import { SupplierReportsPage } from './SupplierReportsPage'

export function SupplierApp() {
  const navSections = [
    {
      title: 'Overview',
      items: [{ to: '/dashboard-supplier', label: 'Dashboard', icon: 'fa-chart-bar', end: true }],
    },
    {
      title: 'Pipeline',
      items: [
        { to: '/dashboard-supplier/students', label: 'Student Pipeline', icon: 'fa-graduation-cap' },
        { to: '/dashboard-supplier/employees', label: 'Employee Training', icon: 'fa-briefcase' },
      ],
    },
    {
      title: 'Business',
      items: [
        { to: '/dashboard-supplier/contracts', label: 'Contracts', icon: 'fa-file-contract' },
        { to: '/dashboard-supplier/reports', label: 'Reports', icon: 'fa-chart-line' },
      ],
    },
  ]

  return (
    <Routes>
      <Route
        element={
          <DashboardLayout
            brand="Nexusyl"
            brandSub="Partner Portal"
            roleLabel="Supplier / Partner"
            rolePillClass="pill-y"
            navSections={navSections}
          />
        }
      >
        <Route index element={<SupplierOverviewPage />} />
        <Route path="students" element={<SupplierPipelinePage />} />
        <Route path="employees" element={<SupplierEmployeesPage />} />
        <Route path="contracts" element={<SupplierContractsPage />} />
        <Route path="reports" element={<SupplierReportsPage />} />
        <Route path="*" element={<Navigate to="/dashboard-supplier" replace />} />
      </Route>
    </Routes>
  )
}
