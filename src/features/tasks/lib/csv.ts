import { labels, priorities, statuses } from '../data/data'
import { type Task } from '../data/schema'

export type NewTask = Omit<Task, 'id'>

/** Splits CSV text into rows, honouring quoted fields with commas, quotes and new lines. */
export function parseCsvRows(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  const src = text.replace(/^\uFEFF/, '')
  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') {
        field += '"'
        i++
      } else if (c === '"') quoted = false
      else field += c
    } else if (c === '"') quoted = true
    else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else field += c
  }
  if (field !== '' || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => r.some((f) => f.trim() !== ''))
}

const pick = (
  allowed: { value: string; label: string }[],
  raw: string | undefined,
  fallback: string
) => {
  const v = (raw ?? '').trim().toLowerCase()
  return (
    allowed.find((o) => o.value === v || o.label.toLowerCase() === v)?.value ??
    fallback
  )
}

/**
 * Turns a CSV export (needs a `title` column; `status`, `label`/`type` and `priority` optional)
 * into follow-ups. Unknown values fall back to sensible defaults; rows without a title are skipped.
 */
export function parseFollowUpsCsv(text: string): {
  tasks: NewTask[]
  skipped: number
} {
  const [header, ...body] = parseCsvRows(text)
  if (!header) return { tasks: [], skipped: 0 }
  const cols = header.map((h) => h.trim().toLowerCase())
  const idx = (...names: string[]) => cols.findIndex((c) => names.includes(c))
  const t = idx('title', 'task', 'follow-up', 'follow up')
  if (t === -1) throw new Error('The CSV needs a "title" column.')
  const s = idx('status')
  const l = idx('label', 'type')
  const p = idx('priority')
  const tasks: NewTask[] = []
  let skipped = 0
  for (const r of body) {
    const title = (r[t] ?? '').trim()
    if (!title) {
      skipped++
      continue
    }
    tasks.push({
      title: title.slice(0, 200),
      status: pick(statuses, r[s], 'todo'),
      label: pick(labels, r[l], 'call'),
      priority: pick(priorities, r[p], 'medium'),
    })
  }
  return { tasks, skipped }
}
