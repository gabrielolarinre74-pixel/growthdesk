import { z } from 'zod'

export const STAGES = [
  'new',
  'contacted',
  'proposal',
  'negotiation',
  'won',
  'lost',
] as const
export type Stage = (typeof STAGES)[number]

export const STAGE_META: Record<
  Stage,
  { label: string; color: string; probability: number }
> = {
  new: { label: 'New lead', color: 'bg-sky-500', probability: 0.1 },
  contacted: { label: 'Contacted', color: 'bg-cyan-500', probability: 0.25 },
  proposal: {
    label: 'Proposal sent',
    color: 'bg-blue-500',
    probability: 0.5,
  },
  negotiation: {
    label: 'Negotiation',
    color: 'bg-amber-500',
    probability: 0.75,
  },
  won: { label: 'Won', color: 'bg-emerald-500', probability: 1 },
  lost: { label: 'Lost', color: 'bg-rose-500', probability: 0 },
}

export const SOURCES = [
  'Website form',
  'Referral',
  'LinkedIn',
  'Instagram',
  'Cold email',
  'Google search',
] as const
export type Source = (typeof SOURCES)[number]

export const SERVICES = [
  'Website',
  'Mobile app',
  'Automation',
  'UI/UX design',
  'Branding',
  'Content & video',
] as const
export type Service = (typeof SERVICES)[number]

export const leadSchema = z.object({
  id: z.string(),
  company: z.string().trim().min(2, 'Company name is too short').max(80),
  contact: z.string().trim().min(2, 'Contact name is too short').max(80),
  email: z.email('Enter a valid email'),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  service: z.enum(SERVICES),
  source: z.enum(SOURCES),
  stage: z.enum(STAGES),
  value: z
    .number({ error: 'Enter a deal value' })
    .min(0, 'Value cannot be negative')
    .max(10_000_000, 'Value looks too large'),
  notes: z.string().max(1000).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  closedAt: z.string().optional(),
  nextFollowUp: z.string().optional(),
})
export type Lead = z.infer<typeof leadSchema>

export const leadFormSchema = leadSchema.pick({
  company: true,
  contact: true,
  email: true,
  phone: true,
  service: true,
  source: true,
  stage: true,
  value: true,
  notes: true,
  nextFollowUp: true,
})
export type LeadFormValues = z.infer<typeof leadFormSchema>
