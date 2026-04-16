import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function RequireAuth() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-brand-surface text-sm text-black/70">
        Loading…
      </div>
    )
  }

  if (!user) {
    return (
      <Navigate to="/" replace state={{ from: location.pathname }} />
    )
  }

  return <Outlet />
}
