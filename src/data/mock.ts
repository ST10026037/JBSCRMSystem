import type {
  AlertItem,
  Centre,
  Client,
  CommunicationEntry,
  Engagement,
  Person,
} from '../types/domain'

export const centres: Centre[] = [
  {
    id: 'centre-ent',
    name: 'JBS Centre for Entrepreneurship',
    shortName: 'Entrepreneurship',
    directorId: 'person-dir-cab',
    staffIds: ['person-dir-cab', 'person-staff-ent-1', 'person-staff-ent-2'],
  },
  {
    id: 'centre-cab',
    name: 'Centre for African Business (CAB)',
    shortName: 'CAB',
    directorId: 'person-dir-ent',
    staffIds: ['person-dir-ent', 'person-staff-cab-1'],
  },
  {
    id: 'centre-ppas',
    name: 'Centre for Public Policy and African Studies',
    shortName: 'PPAS',
    directorId: 'person-dir-ppas',
    staffIds: ['person-dir-ppas', 'person-staff-ppas-1'],
  },
]

export const people: Person[] = [
  {
    id: 'person-dean',
    name: 'Prof. Alistair Mokoena',
    email: 'amokoena@uj.ac.za',
    role: 'executive',
    centreId: null,
    title: 'Dean',
  },
  {
    id: 'person-dir-ent',
    name: 'Prof James Ndlovu',
    email: 'jndlovu@uj.ac.za',
    role: 'director',
    centreId: 'centre-cab',
    title: 'Centre Director',
  },
  {
    id: 'person-staff-ent-1',
    name: 'Omphile Hlongwane',
    email: 'ohlongwane@uj.ac.za',
    role: 'staff',
    centreId: 'centre-ent',
    title: 'Senior Project Lead',
    profileVisibility: 'shared',
  },
  {
    id: 'person-staff-ent-2',
    name: 'Sipho Dlamini',
    email: 'sdlamini@uj.ac.za',
    role: 'staff',
    centreId: 'centre-ent',
    title: 'Engagement Manager',
    profileVisibility: 'private',
  },
  {
    id: 'person-dir-cab',
    name: 'Carol Keshy',
    email: 'ckeshy@uj.ac.za',
    role: 'director',
    centreId: 'centre-ent',
    title: 'Centre Director for JBS Centre for Entrepreneurship',
  },
  {
    id: 'person-staff-cab-1',
    name: 'Thabo Maseko',
    email: 'tmaseko@uj.ac.za',
    role: 'staff',
    centreId: 'centre-cab',
    title: 'Research Lead',
    profileVisibility: 'institutional',
  },
  {
    id: 'person-dir-ppas',
    name: 'Prof Lindiwe Nkosi',
    email: 'lnkosi@uj.ac.za',
    role: 'director',
    centreId: 'centre-ppas',
    title: 'Centre Director',
  },
  {
    id: 'person-staff-ppas-1',
    name: 'Yolisa Mthembu',
    email: 'ymthembu@uj.ac.za',
    role: 'staff',
    centreId: 'centre-ppas',
    title: 'Policy Analyst',
  },
]

const comm = (
  entries: Omit<CommunicationEntry, 'id'>[],
): CommunicationEntry[] =>
  entries.map((e, i) => ({
    ...e,
    id: `comm-${i}-${e.date}`,
  }))

export const clients: Client[] = [
  {
    id: 'client-1',
    organisationName: 'Ubuntu Growth Holdings',
    industry: 'Financial services',
    centreId: 'centre-ent',
    leadStaffId: 'person-staff-ent-1',
    supportingStaffIds: ['person-staff-ent-2'],
    contacts: [
      {
        id: 'cp-1',
        name: 'Naledi Radebe',
        role: 'Chief Strategy Officer',
        email: 'n.radebe@ubuntugh.co.za',
        phone: '+27 11 555 0101',
      },
    ],
    status: 'active',
    visibility: 'shared',
  },
  {
    id: 'client-2',
    organisationName: 'Southern Rail Logistics',
    industry: 'Transport & logistics',
    centreId: 'centre-cab',
    leadStaffId: 'person-staff-cab-1',
    supportingStaffIds: ['person-dir-ent'],
    contacts: [
      {
        id: 'cp-2',
        name: 'Marcus van Wyk',
        role: 'Head of Operations',
        email: 'marcus@srl.co.za',
        phone: '+27 21 555 0202',
      },
    ],
    status: 'active',
    visibility: 'institutional',
  },
  {
    id: 'client-3',
    organisationName: 'Metro Health Consortium',
    industry: 'Healthcare',
    centreId: 'centre-ppas',
    leadStaffId: 'person-staff-ppas-1',
    supportingStaffIds: [],
    contacts: [
      {
        id: 'cp-3',
        name: 'Dr Priya Naidoo',
        role: 'Programme Director',
        email: 'priya.n@metrohealth.org',
        phone: '+27 31 555 0303',
      },
    ],
    status: 'prospect',
    visibility: 'private',
  },
  {
    id: 'client-4',
    organisationName: 'Kalahari Agri Co-op',
    industry: 'Agriculture',
    centreId: 'centre-ent',
    leadStaffId: 'person-staff-ent-2',
    supportingStaffIds: ['person-staff-ent-1'],
    contacts: [
      {
        id: 'cp-4',
        name: 'Pieter Botha',
        role: 'Managing Director',
        email: 'pieter.b@kalahariagri.co.za',
        phone: '+27 53 555 0404',
      },
    ],
    status: 'dormant',
    visibility: 'shared',
  },
]

export const seedEngagements: Engagement[] = [
  {
    id: 'eng-1',
    title: 'Executive leadership programme — cohort 4',
    clientId: 'client-1',
    centreId: 'centre-ent',
    leadStaffId: 'person-staff-ent-1',
    supportingStaffIds: ['person-staff-ent-2'],
    type: 'training',
    stage: 'active',
    startDate: '2025-08-01',
    expectedEndDate: '2026-06-30',
    contractValue: 2_450_000,
    directCosts: 980_000,
    indirectCosts: 120_000,
    visibility: 'shared',
    communications: comm([
      {
        date: '2026-04-02',
        type: 'meeting',
        summary: 'Steering committee: confirmed Q2 modules and guest speakers.',
        authorId: 'person-staff-ent-1',
      },
      {
        date: '2026-02-18',
        type: 'email',
        summary: 'Shared updated ROI narrative for sponsor sign-off.',
        authorId: 'person-staff-ent-2',
      },
    ]),
    paymentSchedule: [
      {
        id: 'pay-1',
        dueDate: '2026-03-31',
        amount: 600_000,
        status: 'paid',
        label: 'Milestone 1',
      },
      {
        id: 'pay-2',
        dueDate: '2026-06-30',
        amount: 850_000,
        status: 'pending',
        label: 'Milestone 2',
      },
    ],
    documents: {
      contracts: ['Master agreement.pdf'],
      proposals: ['Sponsorship proposal v2.pdf'],
      reports: ['Cohort 4 curriculum.docx', 'Progress report Q1.pdf'],
    },
    deliverySummary:
      'On track: modules confirmed; sponsor sign-off pending on Milestone 2 narrative.',
    pendingActions: [
      { id: 'pa-1', label: 'Obtain sponsor sign-off on ROI narrative', dueDate: '2026-05-15' },
    ],
    handoverNotes: undefined,
  },
  {
    id: 'eng-2',
    title: 'Market entry feasibility — SADC corridor',
    clientId: 'client-2',
    centreId: 'centre-cab',
    leadStaffId: 'person-staff-cab-1',
    supportingStaffIds: [],
    type: 'consulting',
    stage: 'active',
    startDate: '2025-11-15',
    expectedEndDate: '2026-09-30',
    contractValue: 1_890_000,
    directCosts: 720_000,
    indirectCosts: 95_000,
    visibility: 'institutional',
    communications: comm([
      {
        date: '2026-01-10',
        type: 'call',
        summary: 'Client requested additional scenario on rail–road intermodal.',
        authorId: 'person-staff-cab-1',
      },
    ]),
    paymentSchedule: [
      {
        id: 'pay-3',
        dueDate: '2026-04-15',
        amount: 420_000,
        status: 'overdue',
        label: 'Interim deliverable',
      },
    ],
    documents: {
      contracts: [],
      proposals: ['Proposal v3.pdf'],
      reports: ['Data annex.xlsx', 'Interim findings.pdf'],
    },
    deliverySummary:
      'At risk: interim payment overdue; delivery team chasing revised annex.',
    pendingActions: [
      { id: 'pa-2', label: 'Submit revised data annex', dueDate: '2026-04-25' },
    ],
  },
  {
    id: 'eng-3',
    title: 'Policy dialogue series (pilot)',
    clientId: 'client-3',
    centreId: 'centre-ppas',
    leadStaffId: 'person-staff-ppas-1',
    supportingStaffIds: ['person-dir-ppas'],
    type: 'research',
    stage: 'prospect',
    startDate: '2026-05-01',
    expectedEndDate: '2027-02-28',
    contractValue: 640_000,
    directCosts: 210_000,
    indirectCosts: 40_000,
    visibility: 'private',
    communications: comm([
      {
        date: '2025-12-05',
        type: 'meeting',
        summary: 'Exploratory workshop; aligned on thematic scope.',
        authorId: 'person-staff-ppas-1',
      },
    ]),
    paymentSchedule: [],
    documents: {
      contracts: [],
      proposals: [],
      reports: ['Concept note.pdf'],
    },
    deliverySummary: 'Prospect: concept agreed; full proposal and contract pending.',
    pendingActions: [{ id: 'pa-3', label: 'Draft full proposal for sponsor' }],
  },
  {
    id: 'eng-4',
    title: 'Innovation partnership — SME scale-up',
    clientId: 'client-1',
    centreId: 'centre-cab',
    leadStaffId: 'person-staff-cab-1',
    supportingStaffIds: ['person-dir-ent'],
    type: 'partnership',
    stage: 'active',
    startDate: '2026-02-01',
    expectedEndDate: '2026-12-15',
    contractValue: 1_100_000,
    directCosts: 400_000,
    indirectCosts: 80_000,
    visibility: 'shared',
    communications: [],
    paymentSchedule: [
      {
        id: 'pay-4',
        dueDate: '2026-05-01',
        amount: 275_000,
        status: 'pending',
        label: 'Tranche A',
      },
    ],
    documents: {
      contracts: ['MoU draft.pdf'],
      proposals: ['Partnership outline.pdf'],
      reports: [],
    },
    deliverySummary: 'Active: MoU under legal review; first tranche scheduled.',
    pendingActions: [],
  },
  {
    id: 'eng-5',
    title: 'Alumni mentorship network (paused)',
    clientId: 'client-4',
    centreId: 'centre-ent',
    leadStaffId: 'person-staff-ent-2',
    supportingStaffIds: [],
    type: 'partnership',
    stage: 'on_hold',
    startDate: '2025-03-01',
    expectedEndDate: '2026-12-31',
    contractValue: 180_000,
    directCosts: 45_000,
    indirectCosts: 12_000,
    visibility: 'shared',
    communications: comm([
      {
        date: '2025-10-20',
        type: 'email',
        summary: 'Client paused internal budget — hold until Feb 2026.',
        authorId: 'person-staff-ent-2',
      },
    ]),
    paymentSchedule: [],
    documents: {
      contracts: ['Letter of engagement.pdf'],
      proposals: [],
      reports: ['Hold status memo.pdf'],
    },
    deliverySummary: 'On hold per client budget; resume target Feb 2026.',
    pendingActions: [
      { id: 'pa-4', label: 'Confirm resume date with client', dueDate: '2026-02-01' },
    ],
  },
]

export const alerts: AlertItem[] = [
  {
    id: 'al-1',
    kind: 'payment',
    severity: 'high',
    title: 'Payment overdue',
    detail: 'Southern Rail — interim deliverable was due 15 Apr 2026.',
    date: '2026-04-10',
    engagementId: 'eng-2',
    clientId: 'client-2',
  },
  {
    id: 'al-2',
    kind: 'no_contact',
    severity: 'medium',
    title: 'No contact in 60 days',
    detail: 'Kalahari Agri Co-op — last logged touchpoint exceeds 60 days.',
    date: '2026-04-08',
    clientId: 'client-4',
  },
  {
    id: 'al-3',
    kind: 'overlap',
    severity: 'medium',
    title: 'Possible overlapping engagement',
    detail: 'Ubuntu Growth Holdings has active engagements with Entrepreneurship and CAB.',
    date: '2026-04-05',
    clientId: 'client-1',
  },
  {
    id: 'al-4',
    kind: 'deadline',
    severity: 'low',
    title: 'Reporting window',
    detail: 'Q2 centre performance pack — internal deadline 30 Apr 2026.',
    date: '2026-04-09',
  },
  {
    id: 'al-5',
    kind: 'dormant_client',
    severity: 'medium',
    title: 'Dormant client account',
    detail: 'Kalahari Agri Co-op is marked dormant — review re-engagement or close.',
    date: '2026-04-07',
    clientId: 'client-4',
  },
]

export function getPerson(id: string): Person | undefined {
  return people.find((p) => p.id === id)
}

export function getCentre(id: string): Centre | undefined {
  return centres.find((c) => c.id === id)
}

export function getClient(id: string): Client | undefined {
  return clients.find((c) => c.id === id)
}
