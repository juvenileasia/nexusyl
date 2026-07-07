import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { AdminApp } from './pages/admin/AdminApp'
import { EmployeeApp } from './pages/employee/EmployeeApp'
import { StudentApp } from './pages/student/StudentApp'
import { SupplierApp } from './pages/supplier/SupplierApp'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard-admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminApp />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard-employee/*"
            element={
              <ProtectedRoute allowedRoles={['employee']}>
                <EmployeeApp />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard-student/*"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentApp />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard-supplier/*"
            element={
              <ProtectedRoute allowedRoles={['supplier']}>
                <SupplierApp />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
