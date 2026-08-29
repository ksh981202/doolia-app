import { type FormEvent, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { expectedAdminPin, isAdminSession, setAdminSession } from '@/admin/AdminGuard'

export function AdminLoginPage() {
  const location = useLocation()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const from = (location.state as { from?: string } | null)?.from || '/admin'

  if (isAdminSession()) return <Navigate to={from} replace />

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (pin.trim() !== expectedAdminPin()) {
      setError('관리자 PIN이 올바르지 않습니다.')
      return
    }
    setAdminSession()
    window.location.replace(from.startsWith('/admin') ? from : '/admin')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-emerald-50/60 px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
        <p className="text-xs font-extrabold tracking-[0.16em] text-emerald-600">DOOLIA ADMIN</p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ink">관리자 로그인</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          기본 PIN은 <code className="rounded bg-slate-100 px-1">doolia</code> 입니다. 운영 환경에서는
          VITE_ADMIN_PIN과 Supabase app_metadata.role=admin 을 함께 사용하세요.
        </p>
        <input
          type="password"
          value={pin}
          onChange={(event) => setPin(event.target.value)}
          placeholder="관리자 PIN"
          className="mt-5 h-11 w-full rounded-xl border border-line px-3 text-sm outline-none focus:border-emerald-400"
        />
        {error ? <p className="mt-2 text-sm font-bold text-red-600">{error}</p> : null}
        <button
          type="submit"
          className="mt-4 flex h-11 w-full items-center justify-center rounded-full bg-emerald-600 text-sm font-extrabold text-white hover:bg-emerald-700"
        >
          입장하기
        </button>
      </form>
    </div>
  )
}

export default AdminLoginPage
