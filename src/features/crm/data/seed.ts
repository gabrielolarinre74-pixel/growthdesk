import { faker } from '@faker-js/faker'
import {
  type Lead,
  SERVICES,
  SOURCES,
  STAGES,
  type Service,
  type Stage,
} from './types'

const BASE_PRICE: Record<Service, [number, number]> = {
  Website: [1200, 6000],
  'Mobile app': [5000, 25000],
  Automation: [1500, 9000],
  'UI/UX design': [900, 5000],
  Branding: [700, 4000],
  'Content & video': [400, 2500],
}

const DAY = 24 * 60 * 60 * 1000

/**
 * Generates a deterministic set of sample leads spread over the last
 * 12 months so the demo dashboard always looks "current".
 * All companies and people are randomly generated (faker), not real clients.
 */
export function generateSampleLeads(count = 180, now = Date.now()): Lead[] {
  faker.seed(2026)
  return Array.from({ length: count }, (_, i) => {
    // Skew towards recent dates so a growing business is represented
    const daysAgo = Math.floor(
      360 * Math.pow(faker.number.float({ min: 0, max: 1 }), 1.4)
    )
    const createdAt = new Date(now - daysAgo * DAY)
    const service = faker.helpers.arrayElement(SERVICES)
    const [min, max] = BASE_PRICE[service]
    const ageDays = (now - createdAt.getTime()) / DAY
    // Older leads are more likely to be closed (won/lost)
    const stage: Stage =
      ageDays > 30
        ? faker.helpers.weightedArrayElement([
            { value: 'won', weight: 5 },
            { value: 'lost', weight: 4 },
            { value: 'negotiation', weight: 1 },
          ])
        : faker.helpers.arrayElement(STAGES)
    const closed = stage === 'won' || stage === 'lost'
    const closedAt = closed
      ? new Date(
          Math.min(
            now,
            createdAt.getTime() + faker.number.int({ min: 3, max: 25 }) * DAY
          )
        ).toISOString()
      : undefined
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    const company = faker.company.name()
    return {
      id: `L-${(1000 + i).toString()}`,
      company,
      contact: `${firstName} ${lastName}`,
      email: faker.internet
        .email({ firstName, lastName, provider: 'example.com' })
        .toLowerCase(),
      phone: '',
      service,
      source: faker.helpers.arrayElement(SOURCES),
      stage,
      value: Math.round(faker.number.int({ min, max }) / 50) * 50,
      notes: '',
      createdAt: createdAt.toISOString(),
      updatedAt: closedAt ?? createdAt.toISOString(),
      closedAt,
      nextFollowUp: closed
        ? undefined
        : new Date(now + faker.number.int({ min: -3, max: 10 }) * DAY)
            .toISOString()
            .slice(0, 10),
    }
  })
}
