import type { AlertItem, Client, Engagement, SessionUser } from '../types/domain'

type SeeEng = (a: {
  centreId: string
  leadStaffId: string
  supportingStaffIds: string[]
  visibility: string
}) => boolean

type SeeClient = (a: {
  centreId: string
  leadStaffId: string
  supportingStaffIds: string[]
  visibility: string
}) => boolean

/** Alerts tied to engagements or clients the user is allowed to see; unlinked items for directors+ only. */
export function filterAlertsForUser(
  items: AlertItem[],
  user: SessionUser,
  engagements: Engagement[],
  clients: Client[],
  canSeeEngagement: SeeEng,
  canSeeClient: SeeClient,
): AlertItem[] {
  return items.filter((a) => {
    if (user.role === 'super_admin') return true
    if (a.engagementId) {
      const e = engagements.find((x) => x.id === a.engagementId)
      if (!e) return false
      return canSeeEngagement({
        centreId: e.centreId,
        leadStaffId: e.leadStaffId,
        supportingStaffIds: e.supportingStaffIds,
        visibility: e.visibility,
      })
    }
    if (a.clientId) {
      const cl = clients.find((c) => c.id === a.clientId)
      if (!cl) return false
      return canSeeClient({
        centreId: cl.centreId,
        leadStaffId: cl.leadStaffId,
        supportingStaffIds: cl.supportingStaffIds,
        visibility: cl.visibility,
      })
    }
    return user.role === 'centre_director'
  })
}
