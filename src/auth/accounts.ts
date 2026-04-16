import type { SessionUser, UserRole } from '../types/domain'

const STORAGE_SESSION = 'jbs-crm-session'
const STORAGE_REGISTRATIONS = 'jbs-crm-registrations'

export interface StoredAccount {
  email: string
  password: string
  user: SessionUser
}

/** Demo / seed accounts (same password for onboarding — replace with API auth). */
export const DEMO_PASSWORD = 'SecurePass1!'

export const seedAccounts: StoredAccount[] = [
  {
    email: 'amokoena@uj.ac.za',
    password: DEMO_PASSWORD,
    user: {
      id: 'person-dean',
      name: 'Prof. Alistair Mokoena',
      email: 'amokoena@uj.ac.za',
      role: 'super_admin',
      centreId: null,
    },
  },
  {
    email: 'ckeshy@uj.ac.za',
    password: DEMO_PASSWORD,
    user: {
      id: 'person-dir-cab',
      name: 'Carol Keshy',
      email: 'ckeshy@uj.ac.za',
      role: 'centre_director',
      centreId: 'centre-ent',
    },
  },
  {
    email: 'ohlongwane@uj.ac.za',
    password: DEMO_PASSWORD,
    user: {
      id: 'person-staff-ent-1',
      name: 'Omphile Hlongwane',
      email: 'ohlongwane@uj.ac.za',
      role: 'centre_staff',
      centreId: 'centre-ent',
    },
  },
]

function readRegistrations(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_REGISTRATIONS)
    if (!raw) return []
    return JSON.parse(raw) as StoredAccount[]
  } catch {
    return []
  }
}

function writeRegistrations(list: StoredAccount[]) {
  localStorage.setItem(STORAGE_REGISTRATIONS, JSON.stringify(list))
}

export function findAccount(
  email: string,
  password: string,
): SessionUser | null {
  const e = email.trim().toLowerCase()
  const all = [...seedAccounts, ...readRegistrations()]
  const hit = all.find(
    (a) => a.email.toLowerCase() === e && a.password === password,
  )
  return hit ? { ...hit.user } : null
}

export function registerAccount(input: {
  name: string
  email: string
  password: string
  role: Exclude<UserRole, 'super_admin'>
  centreId: string
}): { ok: true; user: SessionUser } | { ok: false; error: string } {
  const email = input.email.trim().toLowerCase()
  if (!email || !input.password) {
    return { ok: false, error: 'Email and password are required.' }
  }
  const all = [...seedAccounts, ...readRegistrations()]
  if (all.some((a) => a.email.toLowerCase() === email)) {
    return { ok: false, error: 'An account with this email already exists.' }
  }
  const user: SessionUser = {
    id: `user-${Date.now()}`,
    name: input.name.trim(),
    email,
    role: input.role,
    centreId: input.centreId,
  }
  const next: StoredAccount[] = [
    ...readRegistrations(),
    { email, password: input.password, user },
  ]
  writeRegistrations(next)
  return { ok: true, user }
}

export function persistSession(user: SessionUser | null) {
  if (!user) {
    localStorage.removeItem(STORAGE_SESSION)
    return
  }
  localStorage.setItem(STORAGE_SESSION, JSON.stringify(user))
}

export function readPersistedSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_SESSION)
    if (!raw) return null
    return JSON.parse(raw) as SessionUser
  } catch {
    return null
  }
}
