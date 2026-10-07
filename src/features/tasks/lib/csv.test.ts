import { describe, expect, it } from 'vitest'
import { parseCsvRows, parseFollowUpsCsv } from './csv'

describe('parseCsvRows', () => {
  it('handles quotes, escaped quotes, CRLF and a BOM', () => {
    expect(parseCsvRows('\uFEFFa,"b, c"\r\n"say ""hi""",d\r\n')).toEqual([
      ['a', 'b, c'],
      ['say "hi"', 'd'],
    ])
  })

  it('keeps new lines inside quoted fields and drops blank rows', () => {
    expect(parseCsvRows('x,"line 1\nline 2"\n\n,\n')).toEqual([['x', 'line 1\nline 2']])
  })
})

describe('parseFollowUpsCsv', () => {
  it('maps columns case-insensitively and accepts labels or values', () => {
    const { tasks, skipped } = parseFollowUpsCsv(
      'Title,Status,Type,Priority\nCall Acme,In Progress,Proposal,HIGH\n,todo,call,low\n'
    )
    expect(skipped).toBe(1)
    expect(tasks).toEqual([
      { title: 'Call Acme', status: 'in progress', label: 'proposal', priority: 'high' },
    ])
  })

  it('falls back to defaults for unknown or missing values', () => {
    const { tasks } = parseFollowUpsCsv('title,status\nPing Bolt,someday\n')
    expect(tasks[0]).toEqual({ title: 'Ping Bolt', status: 'todo', label: 'call', priority: 'medium' })
  })

  it('rejects a file without a title column', () => {
    expect(() => parseFollowUpsCsv('name,status\nx,todo')).toThrow(/title/)
  })

  it('returns nothing for an empty file', () => {
    expect(parseFollowUpsCsv('')).toEqual({ tasks: [], skipped: 0 })
  })
})
