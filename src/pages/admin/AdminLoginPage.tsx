import { type FormEvent, useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { loginAdminSession, verifyAdminSession } from '@/admin/AdminGuard'
import { PageFallback } from '@/components/layout/PageFallback'

export function AdminLoginPage() {
  const location = useLocation()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [ready, setReady] = useState(false)
  const [authed, setAuthed] = useState(false)
  const from = (location.state as { from?: string } | null)?.from || '/admin'
  const next = from.startsWith('/admin') && from !== '/admin/login' ? from : '/admin'

  useEffect(() => {
    let cancelled = false
    void verifyAdminSession()
      .then((ok) => {
        if (!cancelled) {
          setAuthed(ok)
          setReady(true)
        }
      })
      .catch(() => {
        if (!cancelled) setReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!ready) return <PageFallback />
  if (authed) return <Navigate to={next} replace />

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const ok = await loginAdminSession(pin.trim())
      if (!ok) {
        setError('관리자 PIN이 올바르지 않습니다.')
        return
      }
      window.location.replace(next)
    } catch {
      setError('관리자 인증 서버에 연결하지 못했습니다.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-emerald-50/60 px-4">
      <form onSubmit={(event) => void submit(event)} className="w-full max-w-sm rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
        <p className="text-xs font-extrabold tracking-[0.16em] text-emerald-600">DOOLIA ADMIN</p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ink">관리자 로그인</h1>
        <p className="mt-2 text-sm leading-6 text-muted">관리자 PIN을 입력하세요. 인증은 서버에서 검증됩니다.</p>
        <input
          type="password"
          value={pin}
          autoComplete="current-password"
          onChange={(event) => setPin(event.target.value)}
          placeholder="관리자 PIN"
          className="mt-5 h-11 w-full rounded-xl border border-line px-3 text-sm outline-none focus:border-emerald-400"
        />
        {error ? <p className="mt-2 text-sm font-bold text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="mt-4 flex h-11 w-full items-center justify-center rounded-full bg-emerald-600 text-sm font-extrabold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {busy ? '확인 중...' : '입장하기'}
        </button>
      </form>
    </div>
  )
}

export default AdminLoginPage
