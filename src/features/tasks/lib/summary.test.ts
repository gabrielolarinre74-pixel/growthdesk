import { describe, expect, it } from 'vitest'
import { summarize } from './summary'

const t = (status: string, priority = 'low') => ({
  id: status + priority,
  title: 'x',
  label: 'call',
  status,
  priority,
})

describe('summarize', () => {
  it('counts open, in-progress, high-priority open and done follow-ups', () => {
    const out = summarize([
      t('todo', 'high'),
      t('in progress'),
      t('backlog', 'high'),
      t('done', 'high'),
      t('canceled'),
    ])
    expect(Object.fromEntries(out.map((o) => [o.label, o.value]))).toEqual({
      Open: 3,
      'In progress': 1,
      'High priority, open': 2,
      Done: 1,
    })
  })
})
