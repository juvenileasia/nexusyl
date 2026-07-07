import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ROLE_DASHBOARD, type UserRole } from '../types/database'

export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode
  allowedRoles: UserRole[]
}) {
  const { session, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <i className="fa-solid fa-spinner fa-spin" />
        <span>Loading session…</span>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (!profile) {
    return (
      <div className="loading-screen">
        <i className="fa-solid fa-triangle-exclamation" />
        <span>Profile not found. Contact your administrator.</span>
      </div>
    )
  }

  if (!allowedRoles.includes(profile.role)) {
    return <Navigate to={ROLE_DASHBOARD[profile.role]} replace />
  }

  return <>{children}</>
}
