import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCrmData } from '../context/DataContext'
import { useSession } from '../context/SessionContext'
import { getCentre, getClient, getPerson } from '../data/mock'
import type { InteractionType } from '../types/domain'
import { daysSince, formatDate, formatZAR } from '../lib/format'
import { Badge, Card, EmptyState, PageHeader, SectionHeading } from '../components/ui'

export function EngagementDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { engagements, addCommunication, reassignLead } = useCrmData()
  const { user, canSeeEngagement } = useSession()

  const engagement = useMemo(
    () => engagements.find((e) => e.id === id),
    [engagements, id],
  )

  const [logDate, setLogDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [logType, setLogType] = useState<InteractionType>('email')
  const [logSummary, setLogSummary] = useState('')
  const [newLeadId, setNewLeadId] = useState('')

  if (!engagement) {
    return <EmptyState message="Engagement not found." />
  }

  const allowed = canSeeEngagement({
    centreId: engagement.centreId,
    leadStaffId: engagement.leadStaffId,
    supportingStaffIds: engagement.supportingStaffIds,
    visibility: engagement.visibility,
  })
  if (!allowed) {
    return <EmptyState message="You do not have access to this engagement." />
  }

  const client = getClient(engagement.clientId)
  const centre = getCentre(engagement.centreId)
  const lead = getPerson(engagement.leadStaffId)
  const support = engagement.supportingStaffIds
    .map((sid) => getPerson(sid))
    .filter(Boolean)

  const profit =
    engagement.contractValue -
    engagement.directCosts -
    engagement.indirectCosts
  const margin =
    engagement.contractValue > 0
      ? (profit / engagement.contractValue) * 100
      : 0

  const sortedComms = [...engagement.communications].sort((a, b) =>
    a.date < b.date ? 1 : -1,
  )
  const lastComm = sortedComms[0]
  const staleDays = lastComm ? daysSince(lastComm.date) : null

  const overlaps = engagements.filter(
    (e) =>
      e.clientId === engagement.clientId &&
      e.id !== engagement.id &&
      (e.stage === 'active' || e.stage === 'on_hold'),
  )

  const centreStaffOptions =
    centre?.staffIds.map((sid) => getPerson(sid)).filter(Boolean) ?? []

  const submitLog = (e: React.FormEvent) => {
    e.preventDefault()
    if (!logSummary.trim()) return
    addCommunication(engagement.id, {
      date: logDate,
      type: logType,
      summary: logSummary.trim(),
      authorId: user.id,
    })
    setLogSummary('')
  }

  const submitReassign = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLeadId) return
    reassignLead(engagement.id, newLeadId)
    setNewLeadId('')
  }

  return (
    <div>
      <PageHeader
        title={engagement.title}
        subtitle={`${client?.organisationName} · ${centre?.shortName}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Badge tone="default">{engagement.type}</Badge>
            <Badge tone="info">{engagement.stage}</Badge>
            <Badge tone="default">{engagement.visibility}</Badge>
          </div>
        }
      />

      <Card className="mb-6">
        <SectionHeading>Status summary</SectionHeading>
        <p className="mt-2 text-sm text-black/90">{engagement.deliverySummary}</p>
      </Card>

      {overlaps.length > 0 ? (
        <div className="mb-6 rounded-lg border border-brand-orange/35 bg-brand-orange/10 px-4 py-3 text-sm text-black">
          <p className="font-medium">Overlapping engagements</p>
          <p className="mt-1 text-black/80">
            Same client has other active or on-hold work
            {overlaps.some((e) => e.centreId !== engagement.centreId)
              ? ' across centres'
              : ''}
            .
          </p>
          <ul className="mt-2 list-inside list-disc text-black/80">
            {overlaps.map((e) => (
              <li key={e.id}>
                <Link
                  className="font-medium text-brand-orange underline"
                  to={`/engagements/${e.id}`}
                >
                  {e.title}
                </Link>{' '}
                ({getCentre(e.centreId)?.shortName})
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionHeading>Ownership</SectionHeading>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-black/55">Primary lead</dt>
              <dd className="font-medium">{lead?.name}</dd>
            </div>
            <div>
              <dt className="text-black/55">Centre ownership</dt>
              <dd className="font-medium">{centre?.name}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-black/55">Supporting team</dt>
              <dd>{support.length ? support.map((p) => p!.name).join(', ') : '—'}</dd>
            </div>
            <div>
              <dt className="text-black/55">Timeline</dt>
              <dd>
                {formatDate(engagement.startDate)} → {formatDate(engagement.expectedEndDate)}
              </dd>
            </div>
            <div>
              <dt className="text-black/55">Last logged contact</dt>
              <dd>
                {lastComm ? (
                  <>
                    {formatDate(lastComm.date)} ({staleDays}d ago)
                    {staleDays !== null && staleDays > 30 ? (
                      <Badge tone="warning">Review</Badge>
                    ) : null}
                  </>
                ) : (
                  '—'
                )}
              </dd>
            </div>
          </dl>
        </Card>

        <Card>
          <SectionHeading>Financials</SectionHeading>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-black/55">Contract value</dt>
              <dd className="font-medium">{formatZAR(engagement.contractValue)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-black/55">Direct costs</dt>
              <dd>{formatZAR(engagement.directCosts)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-black/55">Indirect costs</dt>
              <dd>{formatZAR(engagement.indirectCosts)}</dd>
            </div>
            <div className="flex justify-between gap-2 border-t border-black/8 pt-2">
              <dt className="text-black/55">Profit</dt>
              <dd className="font-semibold text-brand-orange">{formatZAR(profit)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-black/55">Margin</dt>
              <dd>{margin.toFixed(1)}%</dd>
            </div>
          </dl>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionHeading>Payment schedule & status</SectionHeading>
          {engagement.paymentSchedule.length === 0 ? (
            <p className="mt-3 text-sm text-black/70">No milestones yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-xl border border-black/[0.06]">
              <table className="crm-table w-full text-sm">
                <thead>
                  <tr>
                    <th>Label</th>
                    <th>Due</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {engagement.paymentSchedule.map((p) => (
                    <tr key={p.id}>
                      <td>{p.label}</td>
                      <td className="text-black/70">{formatDate(p.dueDate)}</td>
                      <td className="tabular-nums">{formatZAR(p.amount)}</td>
                      <td>
                        <Badge
                          tone={
                            p.status === 'paid'
                              ? 'success'
                              : p.status === 'overdue'
                                ? 'danger'
                                : 'warning'
                          }
                        >
                          {p.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <SectionHeading>Key contacts</SectionHeading>
          <p className="mt-1 text-xs text-black/55">From linked client record</p>
          <ul className="mt-3 space-y-3 text-sm">
            {client?.contacts.map((cp) => (
              <li key={cp.id} className="border-b border-black/8 pb-2 last:border-0">
                <p className="font-medium">{cp.name}</p>
                <p className="text-black/55">{cp.role}</p>
                <p className="text-black/70">{cp.email}</p>
                <p className="text-black/70">{cp.phone}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <h3 className="text-xs font-semibold uppercase text-black/55">Contracts</h3>
          <ul className="mt-2 list-inside list-disc text-sm text-brand-orange">
            {engagement.documents.contracts.length ? (
              engagement.documents.contracts.map((d) => <li key={d}>{d}</li>)
            ) : (
              <li className="list-none text-black/55">None on file</li>
            )}
          </ul>
        </Card>
        <Card>
          <h3 className="text-xs font-semibold uppercase text-black/55">Proposals</h3>
          <ul className="mt-2 list-inside list-disc text-sm text-brand-orange">
            {engagement.documents.proposals.length ? (
              engagement.documents.proposals.map((d) => <li key={d}>{d}</li>)
            ) : (
              <li className="list-none text-black/55">None on file</li>
            )}
          </ul>
        </Card>
        <Card>
          <h3 className="text-xs font-semibold uppercase text-black/55">Reports</h3>
          <ul className="mt-2 list-inside list-disc text-sm text-brand-orange">
            {engagement.documents.reports.length ? (
              engagement.documents.reports.map((d) => <li key={d}>{d}</li>)
            ) : (
              <li className="list-none text-black/55">None on file</li>
            )}
          </ul>
        </Card>
      </div>

      <Card className="mt-6">
        <SectionHeading>Log interaction (manual capture)</SectionHeading>
        <form onSubmit={submitLog} className="mt-4 grid gap-3 sm:grid-cols-4">
          <label className="text-sm">
            <span className="text-black/55">Date</span>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-black/15 px-2 py-1.5 text-sm"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="text-black/55">Type</span>
            <select
              className="mt-1 w-full rounded-lg border border-black/15 px-2 py-1.5 text-sm"
              value={logType}
              onChange={(e) => setLogType(e.target.value as InteractionType)}
            >
              <option value="email">Email</option>
              <option value="meeting">Meeting</option>
              <option value="call">Call</option>
              <option value="other">Other</option>
            </select>
          </label>
          <div className="sm:col-span-4">
            <label className="text-sm">
              <span className="text-black/55">Notes / outcomes</span>
              <textarea
                className="mt-1 w-full rounded-lg border border-black/15 px-2 py-2 text-sm"
                rows={2}
                value={logSummary}
                onChange={(e) => setLogSummary(e.target.value)}
                placeholder="Summary of the interaction"
              />
            </label>
          </div>
          <div className="sm:col-span-4">
            <button
              type="submit"
              className="rounded-lg bg-brand-orange px-4 py-2 text-sm font-medium text-white hover:brightness-110"
            >
              Add log entry (session)
            </button>
          </div>
        </form>
      </Card>

      <Card className="mt-6">
        <SectionHeading>Communication history</SectionHeading>
        <ul className="mt-4 divide-y divide-black/8">
          {sortedComms.length === 0 ? (
            <li className="py-3 text-sm text-black/70">No entries yet.</li>
          ) : (
            sortedComms.map((c) => {
              const author = getPerson(c.authorId)
              return (
                <li key={c.id} className="py-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-black/55">
                    <span>{formatDate(c.date)}</span>
                    <Badge tone="default">{c.type}</Badge>
                    <span>{author?.name}</span>
                  </div>
                  <p className="mt-1 text-sm text-black">{c.summary}</p>
                </li>
              )
            })
          )}
        </ul>
      </Card>

      <Card className="mt-6 border-brand-orange/25 bg-brand-orange/8">
        <SectionHeading>Handover & continuity</SectionHeading>
        <p className="mt-2 text-sm text-black/90">
          Documentation repository (contracts, proposals, reports), communication history,
          key contacts from the client record, delivery summary and pending actions — so
          transitions avoid knowledge loss. Reassignment routes full history to the new owner;
          production would also raise alerts for the incoming lead.
        </p>

        {engagement.pendingActions.length > 0 ? (
          <div className="mt-4">
            <h3 className="text-xs font-semibold uppercase text-black/55">Pending actions</h3>
            <ul className="mt-2 list-inside list-disc text-sm">
              {engagement.pendingActions.map((pa) => (
                <li key={pa.id}>
                  {pa.label}
                  {pa.dueDate ? ` — due ${pa.dueDate}` : ''}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-3 text-sm text-black/70">No pending actions listed.</p>
        )}

        {engagement.handoverNotes ? (
          <p className="mt-3 text-sm whitespace-pre-wrap">{engagement.handoverNotes}</p>
        ) : null}

        {user.role !== 'centre_staff' ? (
          <form onSubmit={submitReassign} className="mt-4 flex flex-wrap items-end gap-3">
            <label className="text-sm">
              <span className="text-black/55">Reassign lead to</span>
              <select
                className="mt-1 block rounded-lg border border-black/15 px-2 py-1.5 text-sm"
                value={newLeadId}
                onChange={(e) => setNewLeadId(e.target.value)}
              >
                <option value="">Select staff…</option>
                {centreStaffOptions.map((p) => (
                  <option key={p!.id} value={p!.id}>
                    {p!.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="rounded-lg border border-brand-orange/40 bg-white px-3 py-2 text-sm font-medium text-black shadow-sm hover:bg-brand-orange/12"
            >
              Apply reassignment (preview)
            </button>
          </form>
        ) : null}
      </Card>
    </div>
  )
}
