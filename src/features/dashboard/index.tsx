import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlarmClock,
  BadgeDollarSign,
  Download,
  Handshake,
  Percent,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { useCrmStore } from '@/stores/crm-store'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Main } from '@/components/layout/main'
import { PageTitle } from '@/components/page-title'
import { AppHeader } from '@/features/crm/components/page-header'
import { STAGE_META } from '@/features/crm/data/types'
import {
  RANGE_DAYS,
  type RangeKey,
  downloadCsv,
  funnel,
  groupCount,
  inRange,
  isOpen,
  money,
  periodChange,
  revenueByMonth,
  toCsv,
} from '@/features/crm/lib/metrics'
import { GoalCard } from './components/goal-card'
import { KpiCard } from './components/kpi-card'
import { RevenueChart } from './components/revenue-chart'

export function Dashboard() {
  const leads = useCrmStore((s) => s.leads)
  const [range, setRange] = useState<RangeKey>('30d')
  const days = RANGE_DAYS[range]

  const { current, change } = useMemo(
    () => periodChange(leads, days),
    [leads, days]
  )
  const monthly = useMemo(() => revenueByMonth(leads, 12), [leads])
  const rangeLeads = useMemo(
    () => leads.filter((l) => inRange(l.createdAt, days)),
    [leads, days]
  )
  const sources = useMemo(() => groupCount(rangeLeads, 'source'), [rangeLeads])
  const services = useMemo(
    () =>
      groupCount(
        leads.filter((l) => l.stage === 'won' && inRange(l.closedAt, days)),
        'service'
      ),
    [leads, days]
  )
  const stages = useMemo(
    () =>
      funnel(
        leads
          .filter(isOpen)
          .concat(
            leads.filter((l) => l.stage === 'won' && inRange(l.closedAt, days))
          )
      ),
    [leads, days]
  )
  const attention = useMemo(
    () =>
      leads
        .filter((l) => isOpen(l) && l.nextFollowUp)
        .sort((a, b) =>
          (a.nextFollowUp ?? '').localeCompare(b.nextFollowUp ?? '')
        )
        .slice(0, 5),
    [leads]
  )
  const revenueThisMonth = monthly[monthly.length - 1]?.revenue ?? 0
  const maxSource = Math.max(1, ...sources.map((s) => s.count))
  const maxStage = Math.max(1, ...stages.map((s) => s.count))
  const rangeLabel = range === '12m' ? 'last 12 months' : `last ${days} days`

  const exportReport = () => {
    const csv = [
      '# GrowthDesk report,' + rangeLabel,
      toCsv([
        { metric: 'New leads', value: current.newLeads },
        { metric: 'Deals won', value: current.wonDeals },
        { metric: 'Won revenue (USD)', value: current.wonRevenue },
        { metric: 'Win rate', value: `${Math.round(current.winRate * 100)}%` },
        { metric: 'Average deal (USD)', value: current.avgDeal },
        { metric: 'Open pipeline (USD)', value: current.pipelineValue },
        { metric: 'Weighted pipeline (USD)', value: current.weightedPipeline },
      ]),
      '',
      toCsv(
        sources.map((s) => ({
          source: s.name,
          leads: s.count,
          won: s.won,
          revenue: s.revenue,
        }))
      ),
      '',
      toCsv(
        monthly.map((m) => ({
          month: m.label,
          new_leads: m.leads,
          won_revenue: m.revenue,
        }))
      ),
    ].join('\n')
    downloadCsv(`growthdesk-report-${range}.csv`, csv)
    toast.success('Report downloaded')
  }

  return (
    <>
      <AppHeader />
      <Main className='space-y-4'>
        <PageTitle
          eyebrow='Overview'
          title='Growth overview'
          description='Where your revenue comes from, and what needs your attention today.'
          actions={
            <>
              <div className='flex items-center gap-2'>
                <Tabs
                  value={range}
                  onValueChange={(v) => setRange(v as RangeKey)}
                >
                  <TabsList>
                    <TabsTrigger value='30d'>30 days</TabsTrigger>
                    <TabsTrigger value='90d'>90 days</TabsTrigger>
                    <TabsTrigger value='12m'>12 months</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button variant='outline' onClick={exportReport}>
                  <Download /> Report
                </Button>
              </div>
            </>
          }
        />

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <KpiCard
            title='Won revenue'
            value={money(current.wonRevenue)}
            icon={BadgeDollarSign}
            change={change.wonRevenue}
            hint={`vs previous ${range === '12m' ? 'year' : 'period'}`}
          />
          <KpiCard
            title='New leads'
            value={String(current.newLeads)}
            icon={Users}
            change={change.newLeads}
            hint={`vs previous ${range === '12m' ? 'year' : 'period'}`}
          />
          <KpiCard
            title='Win rate'
            value={`${Math.round(current.winRate * 100)}%`}
            icon={Percent}
            hint={`${current.wonDeals} won · avg ${money(current.avgDeal)}`}
          />
          <KpiCard
            title='Open pipeline'
            value={money(current.pipelineValue)}
            icon={Handshake}
            hint={`${money(current.weightedPipeline)} weighted by stage`}
          />
        </div>

        <div className='grid gap-4 lg:grid-cols-7'>
          <Card className='lg:col-span-4'>
            <CardHeader>
              <CardTitle>Revenue from won deals</CardTitle>
              <CardDescription>
                Last 12 months, by month the deal closed
              </CardDescription>
            </CardHeader>
            <CardContent className='ps-0'>
              <RevenueChart data={monthly} />
            </CardContent>
          </Card>
          <div className='grid gap-4 lg:col-span-3'>
            <GoalCard revenueThisMonth={revenueThisMonth} />
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0'>
                <div>
                  <CardTitle className='flex items-center gap-2'>
                    <AlarmClock className='size-4 text-primary' /> Follow-ups
                    due
                  </CardTitle>
                  <CardDescription>
                    {current.overdueFollowUps} overdue · deals go cold without a
                    reply
                  </CardDescription>
                </div>
                <Button variant='link' size='sm' asChild>
                  <Link to='/pipeline'>Pipeline</Link>
                </Button>
              </CardHeader>
              <CardContent className='space-y-3'>
                {attention.map((l) => {
                  const overdue =
                    new Date(l.nextFollowUp!) <
                    new Date(new Date().toDateString())
                  return (
                    <div
                      key={l.id}
                      className='flex items-center justify-between gap-3 text-sm'
                    >
                      <div className='min-w-0'>
                        <p className='truncate font-medium'>{l.company}</p>
                        <p className='truncate text-xs text-muted-foreground'>
                          {STAGE_META[l.stage].label} · {l.service}
                        </p>
                      </div>
                      <Badge variant={overdue ? 'destructive' : 'secondary'}>
                        {new Date(l.nextFollowUp!).toLocaleDateString(
                          undefined,
                          { month: 'short', day: 'numeric' }
                        )}
                      </Badge>
                    </div>
                  )
                })}
                {attention.length === 0 && (
                  <p className='text-sm text-muted-foreground'>
                    You're all caught up.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className='grid gap-4 lg:grid-cols-3'>
          <Card>
            <CardHeader>
              <CardTitle>Lead sources</CardTitle>
              <CardDescription>New leads, {rangeLabel}</CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              {sources.map((s) => (
                <BarRow
                  key={s.name}
                  label={s.name}
                  value={s.count}
                  max={maxSource}
                  right={`${s.count} · ${Math.round(s.winRate * 100)}% won`}
                />
              ))}
              {sources.length === 0 && (
                <p className='text-sm text-muted-foreground'>
                  No new leads in this period.
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pipeline by stage</CardTitle>
              <CardDescription>
                Open deals plus deals won in the period
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              {stages.map((s) => (
                <BarRow
                  key={s.stage}
                  label={s.label}
                  value={s.count}
                  max={maxStage}
                  right={money(s.value)}
                  barClass={STAGE_META[s.stage].color}
                />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Revenue by service</CardTitle>
              <CardDescription>Won deals, {rangeLabel}</CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              {services.map((s) => (
                <div
                  key={s.name}
                  className='flex items-center justify-between text-sm'
                >
                  <span>{s.name}</span>
                  <span className='font-medium tabular-nums'>
                    {money(s.revenue)}{' '}
                    <span className='text-xs text-muted-foreground'>
                      ({s.won})
                    </span>
                  </span>
                </div>
              ))}
              {services.length === 0 && (
                <p className='text-sm text-muted-foreground'>
                  No deals won in this period yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}

function BarRow({
  label,
  value,
  max,
  right,
  barClass,
}: {
  label: string
  value: number
  max: number
  right: string
  barClass?: string
}) {
  return (
    <div className='space-y-1'>
      <div className='flex justify-between text-sm'>
        <span>{label}</span>
        <span className='text-muted-foreground tabular-nums'>{right}</span>
      </div>
      <div className='h-2 overflow-hidden rounded-full bg-muted'>
        <div
          className={cn('h-full rounded-full bg-primary', barClass)}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
    </div>
  )
}
