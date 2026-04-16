import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { roleLabel } from '../../lib/roles'

const nav = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/people', label: 'People' },
  { to: '/centres', label: 'Centres' },
  { to: '/clients', label: 'Clients' },
  { to: '/engagements', label: 'Engagements' },
  { to: '/directory', label: 'Directory' },
  { to: '/financials', label: 'Financials' },
  { to: '/alerts', label: 'Alerts' },
  { to: '/reports', label: 'Reports' },
] as const

export function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  const headerBrand = (
    <div className="min-w-0 flex-1 pt-0.5 md:pt-0">
      <p className="text-base font-semibold leading-snug text-brand-orange sm:text-lg">
        Johannesburg Business School
      </p>
      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-black/45 sm:text-[11px]">
        CRM SYSTEM
      </p>
    </div>
  )

  const headerUser = (
    <div className="flex flex-col items-end gap-2 text-right text-sm sm:flex-row sm:items-center sm:gap-5">
      <div>
        <p className="font-medium text-black">{user.name}</p>
        <p className="text-xs text-black/50 md:text-sm">{roleLabel(user.role)}</p>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-medium text-black/80 shadow-sm transition hover:bg-black/[0.03]"
      >
        Sign out
      </button>
    </div>
  )

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-gradient-to-br from-brand-muted via-brand-surface to-[#ebecef]">
      {/* Desktop: one top band so the horizontal rule is continuous with the sidebar divider */}
      <div className="hidden h-20 shrink-0 border-b border-black/[0.06] bg-white shadow-header md:flex md:flex-row md:items-stretch">
        <div className="box-border flex w-64 shrink-0 items-center justify-center border-r border-black/[0.06] bg-white">
          <img
            src="/uj-logo.png"
            alt="University of Johannesburg"
            className="block h-full w-full object-contain object-center"
          />
        </div>
        <header className="flex min-h-0 min-w-0 flex-1 flex-row items-center justify-between gap-4 border-0 bg-white/90 px-8 py-0 shadow-none backdrop-blur-md">
          {headerBrand}
          {headerUser}
        </header>
      </div>

      {/* Mobile: full-width header */}
      <header className="z-10 flex shrink-0 flex-col gap-3 border-b border-black/[0.06] bg-white/90 px-4 py-3.5 shadow-header backdrop-blur-md md:hidden">
        {headerBrand}
        {headerUser}
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        <aside className="hidden min-h-0 w-64 shrink-0 flex-col border-r border-black/[0.06] bg-white shadow-sidebar md:flex">
          <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 pb-3 pt-7">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-brand-orange text-white shadow-md shadow-brand-orange/25'
                      : 'text-black/70 hover:bg-black/[0.04] hover:text-black',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <nav className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-black/[0.06] bg-white/95 px-3 py-2.5 md:hidden">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'shrink-0 rounded-full px-3.5 py-2 text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-brand-orange text-white shadow-sm'
                      : 'bg-black/[0.05] text-black/75 hover:bg-black/[0.08]',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <main className="min-h-0 flex-1 overflow-y-auto px-4 py-8 md:px-8 md:py-10">
            <div className="mx-auto w-full max-w-content">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
