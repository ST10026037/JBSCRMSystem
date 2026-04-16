import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { CommunicationEntry, Engagement } from '../types/domain'
import { seedEngagements } from '../data/mock'

function cloneEngagements(): Engagement[] {
  return structuredClone(seedEngagements)
}

interface DataContextValue {
  engagements: Engagement[]
  addCommunication: (engagementId: string, entry: Omit<CommunicationEntry, 'id'>) => void
  reassignLead: (engagementId: string, newLeadStaffId: string) => void
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [engagements, setEngagements] = useState(cloneEngagements)

  const addCommunication = useCallback(
    (engagementId: string, entry: Omit<CommunicationEntry, 'id'>) => {
      setEngagements((prev) =>
        prev.map((e) => {
          if (e.id !== engagementId) return e
          const id = `comm-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
          return {
            ...e,
            communications: [{ ...entry, id }, ...e.communications],
          }
        }),
      )
    },
    [],
  )

  /** Preview-only; production would reassign, notify new owner and surface handover alerts. */
  const reassignLead = useCallback((engagementId: string, newLeadStaffId: string) => {
    setEngagements((prev) =>
      prev.map((e) =>
        e.id === engagementId
          ? {
              ...e,
              leadStaffId: newLeadStaffId,
              handoverNotes: `${e.handoverNotes ?? ''}\nLead reassigned in session (preview).`,
            }
          : e,
      ),
    )
  }, [])

  const value = useMemo(
    () => ({
      engagements,
      addCommunication,
      reassignLead,
    }),
    [engagements, addCommunication, reassignLead],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook paired with provider
export function useCrmData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useCrmData must be used within DataProvider')
  return ctx
}
