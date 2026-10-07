import { useMemo, useState } from 'react'
import { CalendarClock, GripVertical, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useCrmStore } from '@/stores/crm-store'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Main } from '@/components/layout/main'
import { LeadDialog } from './components/lead-dialog'
import { AppHeader } from './components/page-header'
import { type Lead, type Stage, STAGES, STAGE_META } from './data/types'
import { money } from './lib/metrics'

export function Pipeline() {
  const leads = useCrmStore((s) => s.leads)
  const moveLead = useCrmStore((s) => s.moveLead)
  const [query, setQuery] = useState('')
  const [dragId, setDragId] = useState<string | null>(null)
  const [overStage, setOverStage] = useState<Stage | null>(null)
  const [editing, setEditing] = useState<Lead | null>(null)
  const [creatingIn, setCreatingIn] = useState<Stage | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q
      ? leads.filter((l) =>
          [l.company, l.contact, l.service, l.source].some((v) =>
            v.toLowerCase().includes(q)
          )
        )
      : leads
  }, [leads, query])

  const byStage = useMemo(() => {
    const m = Object.fromEntries(
      STAGES.map((s) => [s, [] as Lead[]])
    ) as Record<Stage, Lead[]>
    for (const l of filtered) m[l.stage].push(l)
    // Closed columns only show the most recent 15 to keep the board fast
    for (const s of ['won', 'lost'] as const) {
      m[s].sort((a, b) => (b.closedAt ?? '').localeCompare(a.closedAt ?? ''))
    }
    return m
  }, [filtered])

  const drop = (stage: Stage) => {
    if (!dragId) return
    const lead = leads.find((l) => l.id === dragId)
    if (lead && lead.stage !== stage) {
      moveLead(dragId, stage)
      toast.success(`${lead.company} → ${STAGE_META[stage].label}`)
    }
    setDragId(null)
    setOverStage(null)
  }

  return (
    <>
      <AppHeader fixed />
      <Main fixed className='flex flex-1 flex-col gap-4'>
        <div className='flex flex-wrap items-end justify-between gap-3'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Sales pipeline
            </h2>
            <p className='text-muted-foreground'>
              Drag deals between stages. Changes are saved in your browser.
            </p>
          </div>
          <div className='flex gap-2'>
            <Input
              placeholder='Search company, contact, service…'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className='w-64'
            />
            <Button onClick={() => setCreatingIn('new')}>
              <Plus /> New lead
            </Button>
          </div>
        </div>
        <div className='-mx-4 flex flex-1 gap-3 overflow-x-auto px-4 pb-4'>
          {STAGES.map((stage) => {
            const items = byStage[stage]
            const total = items.reduce((a, l) => a + l.value, 0)
            const visible =
              stage === 'won' || stage === 'lost' ? items.slice(0, 15) : items
            return (
              <section
                key={stage}
                aria-label={STAGE_META[stage].label}
                onDragOver={(e) => {
                  e.preventDefault()
                  setOverStage(stage)
                }}
                onDragLeave={() =>
                  setOverStage((s) => (s === stage ? null : s))
                }
                onDrop={() => drop(stage)}
                className={cn(
                  'flex w-72 shrink-0 flex-col rounded-xl border bg-muted/40 transition-colors',
                  overStage === stage && 'border-primary bg-primary/5'
                )}
              >
                <header className='flex items-center justify-between gap-2 border-b p-3'>
                  <div className='flex items-center gap-2'>
                    <span
                      className={cn(
                        'size-2.5 rounded-full',
                        STAGE_META[stage].color
                      )}
                    />
                    <h3 className='text-sm font-semibold'>
                      {STAGE_META[stage].label}
                    </h3>
                    <Badge variant='secondary'>{items.length}</Badge>
                  </div>
                  <span className='text-xs text-muted-foreground'>
                    {money(total)}
                  </span>
                </header>
                <div className='flex flex-1 flex-col gap-2 overflow-y-auto p-2'>
                  {visible.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      dragging={dragId === lead.id}
                      onDragStart={() => setDragId(lead.id)}
                      onDragEnd={() => {
                        setDragId(null)
                        setOverStage(null)
                      }}
                      onOpen={() => setEditing(lead)}
                    />
                  ))}
                  {items.length > visible.length && (
                    <p className='py-1 text-center text-xs text-muted-foreground'>
                      +{items.length - visible.length} older deals in Leads
                    </p>
                  )}
                  {stage !== 'won' && stage !== 'lost' && (
                    <Button
                      variant='ghost'
                      size='sm'
                      className='justify-start text-muted-foreground'
                      onClick={() => setCreatingIn(stage)}
                    >
                      <Plus /> Add deal
                    </Button>
                  )}
                </div>
              </section>
            )
          })}
        </div>
      </Main>
      <LeadDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        lead={editing}
      />
      <LeadDialog
        open={!!creatingIn}
        onOpenChange={(o) => !o && setCreatingIn(null)}
        defaultStage={creatingIn ?? 'new'}
      />
    </>
  )
}

function LeadCard({
  lead,
  dragging,
  onDragStart,
  onDragEnd,
  onOpen,
}: {
  lead: Lead
  dragging: boolean
  onDragStart: () => void
  onDragEnd: () => void
  onOpen: () => void
}) {
  const overdue =
    lead.nextFollowUp &&
    new Date(lead.nextFollowUp) < new Date(new Date().toDateString())
  return (
    <article
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move'
        onDragStart()
      }}
      onDragEnd={onDragEnd}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen()}
      tabIndex={0}
      role='button'
      className={cn(
        'group cursor-grab rounded-lg border bg-card p-3 text-start shadow-xs transition hover:border-primary/50 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:cursor-grabbing',
        dragging && 'opacity-40'
      )}
    >
      <div className='flex items-start justify-between gap-2'>
        <div className='min-w-0'>
          <p className='truncate text-sm font-medium'>{lead.company}</p>
          <p className='truncate text-xs text-muted-foreground'>
            {lead.contact}
          </p>
        </div>
        <GripVertical className='size-4 shrink-0 text-muted-foreground/50 group-hover:text-muted-foreground' />
      </div>
      <div className='mt-3 flex items-center justify-between gap-2'>
        <Badge variant='outline' className='text-[11px]'>
          {lead.service}
        </Badge>
        <span className='text-sm font-semibold'>{money(lead.value)}</span>
      </div>
      {lead.nextFollowUp && lead.stage !== 'won' && lead.stage !== 'lost' && (
        <p
          className={cn(
            'mt-2 flex items-center gap-1 text-xs text-muted-foreground',
            overdue && 'font-medium text-rose-600 dark:text-rose-400'
          )}
        >
          <CalendarClock className='size-3' />
          {overdue ? 'Overdue · ' : 'Follow up '}
          {new Date(lead.nextFollowUp).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          })}
        </p>
      )}
    </article>
  )
}
