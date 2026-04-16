import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { centres } from '../data/mock'
import type { UserRole } from '../types/domain'
import { IconEnvelope, authFieldIconClass } from '../components/AuthIcons'
import { AuthPasswordInput } from '../components/AuthPasswordField'
import {
  AuthFormPanel,
  AuthPageShell,
  authInputClass,
  authInputFieldClass,
  authLabelClass,
} from '../components/AuthPageShell'

export function RegisterPage() {
  const { register, user, isLoading } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [role, setRole] = useState<Exclude<UserRole, 'super_admin'>>('centre_staff')
  const [centreId, setCentreId] = useState(centres[0]?.id ?? '')
  const [error, setError] = useState('')

  if (!isLoading && user) {
    return <Navigate to="/dashboard" replace />
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
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    const res = await register({
      name,
      email,
      password,
      role,
      centreId,
    })
    if (!res.ok) {
      setError(res.error ?? 'Registration failed.')
      return
    }
    navigate('/dashboard', { replace: true })
  }

  return (
    <AuthPageShell>
      <div className="mb-6 text-center lg:mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-black sm:text-2xl">
          Johannesburg Business School
        </h1>
        <p className="mt-2 text-sm text-black/55">Register to continue</p>
      </div>
      <AuthFormPanel>
        <h2 className="text-lg font-semibold text-black">Register</h2>

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
            Full name
            <input
              type="text"
              required
              autoComplete="name"
              className={authInputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
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
              autoComplete="new-password"
              minLength={8}
            />
          </label>
          <label className={authLabelClass}>
            Confirm password
            <AuthPasswordInput
              value={confirm}
              onChange={setConfirm}
              showPassword={showConfirmPassword}
              onTogglePassword={() => setShowConfirmPassword((s) => !s)}
              autoComplete="new-password"
              minLength={8}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={authLabelClass}>
              Role
              <select
                className={`${authInputClass} cursor-pointer`}
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as Exclude<UserRole, 'super_admin'>)
                }
              >
                <option value="centre_staff">Centre Staff</option>
                <option value="centre_director">Centre Director</option>
              </select>
            </label>
            <label className={authLabelClass}>
              Centre
              <select
                className={`${authInputClass} cursor-pointer`}
                value={centreId}
                onChange={(e) => setCentreId(e.target.value)}
              >
                {centres.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-brand-orange py-3 text-sm font-semibold text-white shadow-md shadow-brand-orange/25 transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:ring-offset-2"
          >
            Create account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-black/60">
          Already have an account?{' '}
          <Link className="font-semibold text-brand-orange hover:underline" to="/">
            Sign in
          </Link>
        </p>
      </AuthFormPanel>
    </AuthPageShell>
  )
}
