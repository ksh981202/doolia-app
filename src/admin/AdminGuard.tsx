import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { PageFallback } from '@/components/layout/PageFallback'

const SESSION_KEY = 'doolia-admin-ok'
const SESSION_API = '/api/admin/session'

export function isAdminSession() {
  return sessionStorage.getItem(SESSION_KEY) === '1'
}

export function setAdminSession() {
  sessionStorage.setItem(SESSION_KEY, '1')
}

export function clearAdminSession() {
  sessionStorage.removeItem(SESSION_KEY)
}

export async function verifyAdminSession() {
  const response = await fetch(SESSION_API, { credentials: 'include' })
  if (!response.ok) {
    clearAdminSession()
    return false
  }
  setAdminSession()
  return true
}

export async function loginAdminSession(pin: string) {
  const response = await fetch(SESSION_API, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin }),
  })
  if (!response.ok) {
    clearAdminSession()
    return false
  }
  setAdminSession()
  return true
}

export async function logoutAdminSession() {
  try {
    await fetch(SESSION_API, { method: 'DELETE', credentials: 'include' })
  } catch {
    /* cookie clear is best-effort */
  }
  clearAdminSession()
}

export function AdminGuard({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [state, setState] = useState<'checking' | 'ok' | 'no'>('checking')

  useEffect(() => {
    let cancelled = false
    void verifyAdminSession()
      .then((ok) => {
        if (!cancelled) setState(ok ? 'ok' : 'no')
      })
      .catch(() => {
        if (!cancelled) setState('no')
      })
    return () => {
      cancelled = true
    }
  }, [location.pathname])

  if (state === 'checking') return <PageFallback />
  if (state === 'no') return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  return children
}
