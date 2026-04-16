import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { DEMO_PASSWORD } from '../auth/accounts'
import { IconEnvelope, authFieldIconClass } from '../components/AuthIcons'
import { AuthPasswordInput } from '../components/AuthPasswordField'
import {
  AuthFormPanel,
  AuthPageShell,
  authInputFieldClass,
  authLabelClass,
} from '../components/AuthPageShell'

export function LoginPage() {
  const { login, user, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const rawFrom = (location.state as { from?: string } | null)?.from
  const from =
    rawFrom && rawFrom !== '/login' && rawFrom !== '/'
      ? rawFrom
      : '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  if (!isLoading && user) {
    return <Navigate to={from} replace />
  }

  if (isLoading) {
    return (
      <AuthPageShell>
        <div className="flex min-h-[40vh] items-center justify-center lg:min-h-0">
          <p className="text-sm text-black/60">Loading…</p>
        </div>
      </AuthPageShell>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const res = await login(email, password)
    if (!res.ok) {
      setError(res.error ?? 'Login failed.')
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <AuthPageShell>
      <div className="mb-6 text-center lg:mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-black sm:text-2xl">
          Johannesburg Business School
        </h1>
        <p className="mt-2 text-sm text-black/55">Sign in to continue</p>
      </div>
      <AuthFormPanel>
        <h2 className="text-lg font-semibold text-black">Welcome back</h2>
        <p className="mt-1 text-sm text-black/55">Enter your UJ email and password.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error ? (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50/90 px-3 py-2.5 text-sm text-red-900"
            >
              {error}
            </p>
          ) : null}
          <label className={authLabelClass}>
            Email
            <div className="relative mt-1.5">
              <IconEnvelope className={authFieldIconClass} />
              <input
                type="email"
                autoComplete="email"
                required
                className={`${authInputFieldClass} pl-10`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </label>
          <label className={authLabelClass}>
            Password
            <AuthPasswordInput
              value={password}
              onChange={setPassword}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword((s) => !s)}
              autoComplete="current-password"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-xl bg-brand-orange py-3 text-sm font-semibold text-white shadow-md shadow-brand-orange/25 transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:ring-offset-2"
          >
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-black/60">
          No account?{' '}
          <Link
            className="font-semibold text-brand-orange hover:underline"
            to="/register"
          >
            Register
          </Link>
        </p>

        <div className="mt-6 rounded-xl border border-black/[0.06] bg-neutral-50/80 px-3.5 py-3 text-xs leading-relaxed text-black/55">
          <span className="font-medium text-black/70">Demo:</span> password{' '}
          <code className="rounded bg-black/[0.06] px-1.5 py-0.5 font-mono text-black/80">
            {DEMO_PASSWORD}
          </code>
          <span className="mx-1 text-black/35">·</span>
          <code className="text-[0.8rem] text-black/70">amokoena@uj.ac.za</code>,{' '}
          <code className="text-[0.8rem] text-black/70">ckeshy@uj.ac.za</code>,{' '}
          <code className="text-[0.8rem] text-black/70">ohlongwane@uj.ac.za</code>
        </div>
      </AuthFormPanel>
    </AuthPageShell>
  )
}
