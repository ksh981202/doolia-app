import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

const SESSION_KEY = 'doolia-admin-ok'

export function isAdminSession() {
  return sessionStorage.getItem(SESSION_KEY) === '1'
}

export function setAdminSession() {
  sessionStorage.setItem(SESSION_KEY, '1')
}

export function expectedAdminPin() {
  return (import.meta.env.VITE_ADMIN_PIN as string | undefined)?.trim() || 'doolia'
}

export function AdminGuard({ children }: { children: ReactNode }) {
  const location = useLocation()
  if (isAdminSession()) return children
  return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
}
