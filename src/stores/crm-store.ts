import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateSampleLeads } from '@/features/crm/data/seed'
import {
  type Lead,
  type LeadFormValues,
  type Stage,
} from '@/features/crm/data/types'

type CrmState = {
  leads: Lead[]
  monthlyGoal: number
  addLead: (values: LeadFormValues) => Lead
  updateLead: (id: string, values: Partial<LeadFormValues>) => void
  moveLead: (id: string, stage: Stage) => void
  deleteLeads: (ids: string[]) => void
  setMonthlyGoal: (goal: number) => void
  resetDemo: () => void
}

const nextId = (leads: Lead[]) => {
  const max = leads.reduce(
    (m, l) => Math.max(m, Number(l.id.replace(/\D/g, '')) || 0),
    1000
  )
  return `L-${max + 1}`
}

const closedAtFor = (stage: Stage, prev?: Lead) =>
  stage === 'won' || stage === 'lost'
    ? prev && prev.stage === stage && prev.closedAt
      ? prev.closedAt
      : new Date().toISOString()
    : undefined

export const useCrmStore = create<CrmState>()(
  persist(
    (set, get) => ({
      leads: generateSampleLeads(),
      monthlyGoal: 25000,
      addLead: (values) => {
        const now = new Date().toISOString()
        const lead: Lead = {
          ...values,
          id: nextId(get().leads),
          createdAt: now,
          updatedAt: now,
          closedAt: closedAtFor(values.stage),
        }
        set((s) => ({ leads: [lead, ...s.leads] }))
        return lead
      },
      updateLead: (id, values) =>
        set((s) => ({
          leads: s.leads.map((l) =>
            l.id === id
              ? {
                  ...l,
                  ...values,
                  updatedAt: new Date().toISOString(),
                  closedAt: closedAtFor(values.stage ?? l.stage, l),
                }
              : l
          ),
        })),
      moveLead: (id, stage) => get().updateLead(id, { stage }),
      deleteLeads: (ids) =>
        set((s) => ({ leads: s.leads.filter((l) => !ids.includes(l.id)) })),
      setMonthlyGoal: (goal) =>
        set({ monthlyGoal: Math.max(0, Math.round(goal)) }),
      resetDemo: () =>
        set({ leads: generateSampleLeads(), monthlyGoal: 25000 }),
    }),
    { name: 'growthdesk-crm', version: 1 }
  )
)
