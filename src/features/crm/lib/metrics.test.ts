import { describe, expect, it } from 'vitest'
import { generateSampleLeads } from '../data/seed'
import { type Lead } from '../data/types'
import {
  funnel,
  goalProgress,
  groupCount,
  periodChange,
  revenueByMonth,
  summarize,
  toCsv,
} from './metrics'

const NOW = new Date('2026-06-15T12:00:00Z').getTime()
const DAY = 86_400_000
const iso = (daysAgo: number) => new Date(NOW - daysAgo * DAY).toISOString()

const lead = (over: Partial<Lead>): Lead => ({
  id: 'L-1',
  company: 'Acme',
  contact: 'Jane Doe',
  email: 'jane@example.com',
  service: 'Website',
  source: 'Referral',
  stage: 'new',
  value: 1000,
  createdAt: iso(5),
  updatedAt: iso(5),
  ...over,
})

describe('summarize', () => {
  const leads = [
    lead({ id: 'a', stage: 'won', value: 3000, closedAt: iso(2) }),
    lead({ id: 'b', stage: 'won', value: 1000, closedAt: iso(10) }),
    lead({ id: 'c', stage: 'lost', value: 500, closedAt: iso(3) }),
    lead({
      id: 'd',
      stage: 'proposal',
      value: 2000,
      nextFollowUp: iso(2).slice(0, 10),
    }),
    lead({
      id: 'e',
      stage: 'won',
      value: 9999,
      closedAt: iso(90),
      createdAt: iso(120),
    }),
  ]

  it('counts only deals closed inside the range', () => {
    const s = summarize(leads, 30, NOW)
    expect(s.wonDeals).toBe(2)
    expect(s.wonRevenue).toBe(4000)
    expect(s.avgDeal).toBe(2000)
    expect(s.winRate).toBeCloseTo(2 / 3)
  })

  it('values the open pipeline and weights it by stage probability', () => {
    const s = summarize(leads, 30, NOW)
    expect(s.pipelineValue).toBe(2000)
    expect(s.weightedPipeline).toBe(1000) // proposal = 50%
  })

  it('flags overdue follow-ups', () => {
    expect(summarize(leads, 30, NOW).overdueFollowUps).toBe(1)
  })

  it('handles an empty pipeline without dividing by zero', () => {
    const s = summarize([], 30, NOW)
    expect(s.winRate).toBe(0)
    expect(s.avgDeal).toBe(0)
  })
})

describe('periodChange', () => {
  it('compares with the previous period of the same length', () => {
    const leads = [
      lead({ id: 'a', stage: 'won', value: 2000, closedAt: iso(5) }),
      lead({
        id: 'b',
        stage: 'won',
        value: 1000,
        closedAt: iso(40),
        createdAt: iso(45),
      }),
    ]
    expect(periodChange(leads, 30, NOW).change.wonRevenue).toBeCloseTo(1)
  })
})

describe('revenueByMonth', () => {
  it('returns 12 buckets ending with the current month', () => {
    const buckets = revenueByMonth(
      [lead({ stage: 'won', closedAt: iso(1), value: 700 })],
      12,
      NOW
    )
    expect(buckets).toHaveLength(12)
    expect(buckets[buckets.length - 1]?.label).toBe('Jun')
    expect(buckets[buckets.length - 1]?.revenue).toBe(700)
  })
})

describe('groupCount and funnel', () => {
  it('groups leads by source with win rate', () => {
    const rows = groupCount(
      [
        lead({ source: 'LinkedIn', stage: 'won' }),
        lead({ source: 'LinkedIn' }),
        lead({ source: 'Referral' }),
      ],
      'source'
    )
    expect(rows[0]).toMatchObject({
      name: 'LinkedIn',
      count: 2,
      won: 1,
      winRate: 0.5,
    })
  })

  it('excludes lost deals from the funnel', () => {
    expect(funnel([lead({ stage: 'lost' })]).map((f) => f.stage)).not.toContain(
      'lost'
    )
  })
})

describe('goalProgress', () => {
  it('caps at 100% and survives a zero goal', () => {
    expect(goalProgress(150, 100)).toBe(1)
    expect(goalProgress(50, 0)).toBe(0)
    expect(goalProgress(25, 100)).toBe(0.25)
  })
})

describe('toCsv', () => {
  it('quotes commas, quotes and new lines', () => {
    expect(toCsv([{ a: 'x,y', b: 'say "hi"', c: 'l1\nl2' }])).toBe(
      'a,b,c\n"x,y","say ""hi""","l1\nl2"'
    )
  })

  it('neutralises spreadsheet formula injection', () => {
    expect(toCsv([{ a: '=HYPERLINK("evil")' }])).toBe(
      'a\n"\'=HYPERLINK(""evil"")"'
    )
  })
})

describe('generateSampleLeads', () => {
  it('is deterministic and produces valid stages', () => {
    const a = generateSampleLeads(20, NOW)
    const b = generateSampleLeads(20, NOW)
    expect(a).toEqual(b)
    for (const l of a) {
      if (l.stage === 'won' || l.stage === 'lost')
        expect(l.closedAt).toBeDefined()
      else expect(l.closedAt).toBeUndefined()
    }
  })
})
