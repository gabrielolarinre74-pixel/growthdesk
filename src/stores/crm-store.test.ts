import { beforeEach, describe, expect, it } from 'vitest'
import { useCrmStore } from './crm-store'

describe('crm store', () => {
  beforeEach(() => {
    localStorage.clear()
    useCrmStore.getState().resetDemo()
  })

  it('adds a lead with a new id and timestamps', () => {
    const before = useCrmStore.getState().leads.length
    const created = useCrmStore.getState().addLead({
      company: 'Bright Bakery',
      contact: 'Ada Obi',
      email: 'ada@example.com',
      service: 'Website',
      source: 'Referral',
      stage: 'new',
      value: 1500,
    })
    const { leads } = useCrmStore.getState()
    expect(leads).toHaveLength(before + 1)
    expect(leads[0].id).toBe(created.id)
    expect(leads.filter((l) => l.id === created.id)).toHaveLength(1)
  })

  it('sets closedAt when a deal is won and clears it when reopened', () => {
    const id = useCrmStore.getState().leads.find((l) => l.stage === 'new')!.id
    useCrmStore.getState().moveLead(id, 'won')
    expect(
      useCrmStore.getState().leads.find((l) => l.id === id)?.closedAt
    ).toBeDefined()
    useCrmStore.getState().moveLead(id, 'proposal')
    expect(
      useCrmStore.getState().leads.find((l) => l.id === id)?.closedAt
    ).toBeUndefined()
  })

  it('persists to localStorage', () => {
    useCrmStore.getState().setMonthlyGoal(42000)
    expect(localStorage.getItem('growthdesk-crm')).toContain('42000')
  })
})
