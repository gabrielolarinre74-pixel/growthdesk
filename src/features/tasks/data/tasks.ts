import { faker } from '@faker-js/faker'
import { type Task } from './schema'

const templates = {
  call: [
    'Discovery call with {company} about their new {service}',
    'Check in with {company} on launch feedback',
    'Call {company} to confirm budget and timeline',
  ],
  email: [
    'Send {company} the {service} case study and next steps',
    'Reply to {company} questions about pricing',
    'Share the staging link with {company} for review',
  ],
  proposal: [
    'Draft {service} proposal for {company}',
    'Revise the quote for {company} after feedback',
    'Prepare a 3-option package for {company}',
  ],
  onboarding: [
    'Collect brand assets and logins from {company}',
    'Kick-off meeting with {company} team',
    'Set up shared project board for {company}',
  ],
} as const

const services = [
  'website',
  'mobile app',
  'automation',
  'brand identity',
  'video content',
  'UI/UX audit',
]

/** Deterministic sample follow-ups (same list on every reset). */
export function sampleTasks(): Task[] {
  faker.seed(12345)
  const used = new Set<number>()
  return Array.from({ length: 60 }, () => {
    const statuses = [
      'todo',
      'in progress',
      'done',
      'canceled',
      'backlog',
    ] as const
    const label = faker.helpers.arrayElement(
      Object.keys(templates) as (keyof typeof templates)[]
    )
    const priorities = ['low', 'medium', 'high'] as const
    const company = faker.company.name()

    let n = faker.number.int({ min: 1000, max: 9999 })
    while (used.has(n)) n++
    used.add(n)
    return {
      id: `FU-${n}`,
      title: faker.helpers
        .arrayElement(templates[label])
        .replace('{company}', company)
        .replace('{service}', faker.helpers.arrayElement(services)),
      status: faker.helpers.arrayElement(statuses),
      label,
      priority: faker.helpers.arrayElement(priorities),
    }
  })
}
