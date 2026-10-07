import { faker } from '@faker-js/faker'

// Fixed seed so the demo data is the same on every load
faker.seed(12345)

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

export const tasks = Array.from({ length: 60 }, () => {
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

  return {
    id: `FU-${faker.number.int({ min: 1000, max: 9999 })}`,
    title: faker.helpers
      .arrayElement(templates[label])
      .replace('{company}', company)
      .replace('{service}', faker.helpers.arrayElement(services)),
    status: faker.helpers.arrayElement(statuses),
    label,
    priority: faker.helpers.arrayElement(priorities),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    assignee: faker.person.fullName(),
    description: faker.lorem.paragraph({ min: 1, max: 2 }),
    dueDate: faker.date.soon({ days: 14 }),
  }
})
