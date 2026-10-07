import {
  type Lead,
  type Service,
  type Source,
  STAGES,
  STAGE_META,
} from '../data/types'

export type RangeKey = '30d' | '90d' | '12m'
export const RANGE_DAYS: Record<RangeKey, number> = {
  '30d': 30,
  '90d': 90,
  '12m': 365,
}

const DAY = 24 * 60 * 60 * 1000

export function inRange(
  dateIso: string | undefined,
  days: number,
  now = Date.now()
) {
  if (!dateIso) return false
  const t = new Date(dateIso).getTime()
  return t >= now - days * DAY && t <= now
}

export const isOpen = (l: Lead) => l.stage !== 'won' && l.stage !== 'lost'

export function summarize(leads: Lead[], days: number, now = Date.now()) {
  const created = leads.filter((l) => inRange(l.createdAt, days, now))
  const won = leads.filter(
    (l) => l.stage === 'won' && inRange(l.closedAt, days, now)
  )
  const lost = leads.filter(
    (l) => l.stage === 'lost' && inRange(l.closedAt, days, now)
  )
  const open = leads.filter(isOpen)
  const wonRevenue = sum(won.map((l) => l.value))
  const pipelineValue = sum(open.map((l) => l.value))
  const weightedPipeline = sum(
    open.map((l) => l.value * STAGE_META[l.stage].probability)
  )
  const closedCount = won.length + lost.length
  return {
    newLeads: created.length,
    wonDeals: won.length,
    wonRevenue,
    pipelineValue,
    weightedPipeline: Math.round(weightedPipeline),
    winRate: closedCount === 0 ? 0 : won.length / closedCount,
    avgDeal: won.length === 0 ? 0 : Math.round(wonRevenue / won.length),
    overdueFollowUps: open.filter(
      (l) =>
        l.nextFollowUp && new Date(l.nextFollowUp).getTime() < startOfDay(now)
    ).length,
  }
}

/** Compares a period to the period of the same length right before it. */
export function periodChange(leads: Lead[], days: number, now = Date.now()) {
  const current = summarize(leads, days, now)
  const previous = summarize(leads, days, now - days * DAY)
  return {
    current,
    previous,
    change: {
      newLeads: pct(current.newLeads, previous.newLeads),
      wonRevenue: pct(current.wonRevenue, previous.wonRevenue),
      wonDeals: pct(current.wonDeals, previous.wonDeals),
    },
  }
}

export function revenueByMonth(leads: Lead[], months = 12, now = Date.now()) {
  const d = new Date(now)
  const buckets: {
    key: string
    label: string
    revenue: number
    leads: number
  }[] = []
  for (let i = months - 1; i >= 0; i--) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1)
    buckets.push({
      key: `${m.getFullYear()}-${m.getMonth()}`,
      label: m.toLocaleString('en', { month: 'short' }),
      revenue: 0,
      leads: 0,
    })
  }
  const index = new Map(buckets.map((b, i) => [b.key, i]))
  for (const l of leads) {
    const c = new Date(l.createdAt)
    const ci = index.get(`${c.getFullYear()}-${c.getMonth()}`)
    if (ci !== undefined) buckets[ci].leads++
    if (l.stage === 'won' && l.closedAt) {
      const w = new Date(l.closedAt)
      const wi = index.get(`${w.getFullYear()}-${w.getMonth()}`)
      if (wi !== undefined) buckets[wi].revenue += l.value
    }
  }
  return buckets
}

export function groupCount(leads: Lead[], key: 'source' | 'service') {
  const map = new Map<
    Source | Service,
    { count: number; won: number; revenue: number }
  >()
  for (const l of leads) {
    const k = l[key]
    const row = map.get(k) ?? { count: 0, won: 0, revenue: 0 }
    row.count++
    if (l.stage === 'won') {
      row.won++
      row.revenue += l.value
    }
    map.set(k, row)
  }
  return [...map.entries()]
    .map(([name, v]) => ({
      name,
      ...v,
      winRate: v.count ? v.won / v.count : 0,
    }))
    .sort((a, b) => b.count - a.count)
}

export function funnel(leads: Lead[]) {
  return STAGES.filter((s) => s !== 'lost').map((stage) => {
    const items = leads.filter((l) => l.stage === stage)
    return {
      stage,
      label: STAGE_META[stage].label,
      count: items.length,
      value: sum(items.map((l) => l.value)),
    }
  })
}

export function goalProgress(revenue: number, goal: number) {
  if (goal <= 0) return 0
  return Math.min(1, revenue / goal)
}

/** RFC 4180-ish CSV: quotes fields containing commas, quotes or new lines. */
export function toCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns?: (keyof T)[]
) {
  if (rows.length === 0) return ''
  const cols = columns ?? (Object.keys(rows[0]) as (keyof T)[])
  const escape = (v: unknown) => {
    const s = v === undefined || v === null ? '' : String(v)
    // Neutralise spreadsheet formula injection
    const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s
    return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
  }
  return [
    cols.join(','),
    ...rows.map((r) => cols.map((c) => escape(r[c])).join(',')),
  ].join('\n')
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export const money = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
const pct = (a: number, b: number) =>
  b === 0 ? (a === 0 ? 0 : 1) : (a - b) / b
const startOfDay = (t: number) => {
  const d = new Date(t)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}
