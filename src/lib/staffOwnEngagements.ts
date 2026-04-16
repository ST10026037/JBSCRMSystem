import type { Engagement, UserRole } from '../types/domain'

/**
 * Engagements that count toward a centre staff member’s own workload: same centre,
 * lead or supporting and private engagements only when they are the lead.
 */
export function isStaffOwnPortfolioEngagement(
  user: { id: string; role: UserRole; centreId: string | null },
  e: Engagement,
): boolean {
  if (user.role !== 'centre_staff' || !user.centreId) return false
  if (e.centreId !== user.centreId) return false
  const onTeam =
    e.leadStaffId === user.id || e.supportingStaffIds.includes(user.id)
  if (!onTeam) return false
  if (e.visibility === 'private' && e.leadStaffId !== user.id) return false
  return true
}
