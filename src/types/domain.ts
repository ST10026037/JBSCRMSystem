export type UserRole = 'super_admin' | 'centre_director' | 'centre_staff'

export type Visibility = 'private' | 'shared' | 'institutional'

export type ClientStatus = 'active' | 'dormant' | 'prospect'

export type EngagementType = 'research' | 'training' | 'consulting' | 'partnership'

export type EngagementStage = 'prospect' | 'active' | 'completed' | 'on_hold'

export type InteractionType = 'email' | 'meeting' | 'call' | 'other'

export type PaymentStatus = 'paid' | 'pending' | 'overdue'

export interface Centre {
  id: string
  name: string
  shortName: string
  directorId: string
  staffIds: string[]
}

/** Staff & executives; clients are modelled separately (Client). */
export interface Person {
  id: string
  name: string
  email: string
  role: 'staff' | 'director' | 'executive'
  centreId: string | null
  title: string
  /** Staff profile visibility (restricted mode). */
  profileVisibility?: Visibility
}

export interface ContactPerson {
  id: string
  name: string
  role: string
  email: string
  phone: string
}

export interface Client {
  id: string
  organisationName: string
  industry: string
  centreId: string
  leadStaffId: string
  supportingStaffIds: string[]
  contacts: ContactPerson[]
  status: ClientStatus
  visibility: Visibility
  notes?: string
}

export interface CommunicationEntry {
  id: string
  date: string
  type: InteractionType
  summary: string
  authorId: string
}

export interface PaymentMilestone {
  id: string
  dueDate: string
  amount: number
  status: PaymentStatus
  label: string
}

export interface PendingAction {
  id: string
  label: string
  dueDate?: string
}

/** Documentation repository: contracts, proposals, reports. */
export interface EngagementDocuments {
  contracts: string[]
  proposals: string[]
  reports: string[]
}

export interface Engagement {
  id: string
  title: string
  clientId: string
  centreId: string
  leadStaffId: string
  supportingStaffIds: string[]
  type: EngagementType
  stage: EngagementStage
  startDate: string
  expectedEndDate: string
  contractValue: number
  directCosts: number
  indirectCosts: number
  visibility: Visibility
  communications: CommunicationEntry[]
  paymentSchedule: PaymentMilestone[]
  documents: EngagementDocuments
  /** Short narrative: delivery / stage health (communication & delivery status). */
  deliverySummary: string
  /** Actions pending for handover / continuity. */
  pendingActions: PendingAction[]
  handoverNotes?: string
}

export type AlertKind =
  | 'no_contact'
  | 'deadline'
  | 'payment'
  | 'dormant_client'
  | 'overlap'

export interface AlertItem {
  id: string
  kind: AlertKind
  severity: 'low' | 'medium' | 'high'
  title: string
  detail: string
  date: string
  engagementId?: string
  clientId?: string
}

export interface SessionUser {
  id: string
  name: string
  email: string
  role: UserRole
  centreId: string | null
}
