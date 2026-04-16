import type { UserRole } from '../types/domain'

export function roleLabel(role: UserRole): string {
  switch (role) {
    case 'super_admin':
      return 'Super Admin'
    case 'centre_director':
      return 'Centre Director'
    case 'centre_staff':
      return 'Centre Staff'
    default:
      return role
  }
}
