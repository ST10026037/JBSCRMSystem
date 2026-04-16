import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  findAccount,
  persistSession,
  readPersistedSession,
  registerAccount,
} from '../auth/accounts'
import type { Person, SessionUser, UserRole } from '../types/domain'

interface AuthContextValue {
  user: SessionUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  register: (input: {
    name: string
    email: string
    password: string
    role: Exclude<UserRole, 'super_admin'>
    centreId: string
  }) => Promise<{ ok: boolean; error?: string }>
  canSeeAllCentres: boolean
  canSeeCentreFinancials: (centreId: string) => boolean
  canSeeEngagement: (args: {
    centreId: string
    leadStaffId: string
    supportingStaffIds: string[]
    visibility: string
  }) => boolean
  canSeeClient: (args: {
    centreId: string
    leadStaffId: string
    supportingStaffIds: string[]
    visibility: string
  }) => boolean
  canSeeStaffProfile: (person: Person) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const saved = readPersistedSession()
    if (saved) setUser(saved)
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const u = findAccount(email, password)
    if (!u) {
      return { ok: false as const, error: 'Invalid email or password.' }
    }
    setUser(u)
    persistSession(u)
    return { ok: true as const }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    persistSession(null)
  }, [])

  const register = useCallback(
    async (input: {
      name: string
      email: string
      password: string
      role: Exclude<UserRole, 'super_admin'>
      centreId: string
    }) => {
      const result = registerAccount(input)
      if (!result.ok) {
        return { ok: false as const, error: result.error }
      }
      setUser(result.user)
      persistSession(result.user)
      return { ok: true as const }
    },
    [],
  )

  /** Super Admin & Centre Director: full centre economics. Centre Staff: their centre’s financial dashboard for engagements they can access (aggregated in UI). */
  const canSeeCentreFinancials = useCallback(
    (centreId: string) => {
      if (!user) return false
      if (user.role === 'super_admin') return true
      if (user.role === 'centre_director' && user.centreId === centreId)
        return true
      if (user.role === 'centre_staff' && user.centreId === centreId) return true
      return false
    },
    [user],
  )

  const canSeeEngagement = useCallback(
    (args: {
      centreId: string
      leadStaffId: string
      supportingStaffIds: string[]
      visibility: string
    }) => {
      if (!user) return false
      const { centreId, leadStaffId, supportingStaffIds, visibility } = args
      if (user.role === 'super_admin') return true
      if (user.role === 'centre_director' && user.centreId === centreId)
        return true
      if (user.role === 'centre_staff' && user.centreId !== centreId)
        return false
      if (user.role === 'centre_staff') {
        const mine =
          leadStaffId === user.id || supportingStaffIds.includes(user.id)
        if (visibility === 'private' && leadStaffId !== user.id) {
          return false
        }
        return mine || visibility === 'shared' || visibility === 'institutional'
      }
      return false
    },
    [user],
  )

  const canSeeStaffProfile = useCallback(
    (person: Person) => {
      if (!user) return false
      if (user.role === 'super_admin') return true
      if (!person.centreId) return true
      if (person.id === user.id) return true
      const vis = person.profileVisibility ?? 'shared'
      if (vis === 'private') {
        if (user.role === 'centre_director' && user.centreId === person.centreId)
          return true
        return false
      }
      if (vis === 'institutional') return true
      if (user.centreId === person.centreId) return true
      return false
    },
    [user],
  )

  /**
   * Lead + supporting team + centre. Staff see private clients only as lead;
   * shared/institutional client records are visible within the centre; team members see clients they co-own.
   */
  const canSeeClient = useCallback(
    (args: {
      centreId: string
      leadStaffId: string
      supportingStaffIds: string[]
      visibility: string
    }) => {
      if (!user) return false
      const { centreId, leadStaffId, supportingStaffIds, visibility } = args
      if (user.role === 'super_admin') return true
      if (user.role === 'centre_director' && user.centreId === centreId)
        return true
      if (user.role === 'centre_staff' && user.centreId !== centreId)
        return false
      if (user.role === 'centre_staff') {
        if (visibility === 'private' && leadStaffId !== user.id) return false
        const onTeam =
          leadStaffId === user.id || supportingStaffIds.includes(user.id)
        return (
          onTeam || visibility === 'shared' || visibility === 'institutional'
        )
      }
      return false
    },
    [user],
  )

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      logout,
      register,
      canSeeAllCentres: user?.role === 'super_admin',
      canSeeCentreFinancials,
      canSeeEngagement,
      canSeeClient,
      canSeeStaffProfile,
    }),
    [
      user,
      isLoading,
      login,
      logout,
      register,
      canSeeCentreFinancials,
      canSeeEngagement,
      canSeeClient,
      canSeeStaffProfile,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

/** Use only under protected routes — `user` is always set. */
// eslint-disable-next-line react-refresh/only-export-components
export function useSession(): AuthContextValue & { user: SessionUser } {
  const ctx = useAuth()
  if (!ctx.user) {
    throw new Error('useSession requires authenticated user')
  }
  return { ...ctx, user: ctx.user }
}
