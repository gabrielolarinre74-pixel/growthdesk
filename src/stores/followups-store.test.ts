import { beforeEach, describe, expect, it } from 'vitest'
import { nextTaskId, useFollowUpsStore } from './followups-store'

const base = { title: 'Call', status: 'todo', label: 'call', priority: 'low' }

describe('follow-ups store', () => {
  beforeEach(() => useFollowUpsStore.setState({ tasks: [] }))

  it('numbers ids after the highest existing one', () => {
    expect(nextTaskId([])).toBe('FU-1001')
    expect(nextTaskId([{ ...base, id: 'FU-4200' }, { ...base, id: 'FU-17' }])).toBe('FU-4201')
  })

  it('adds, updates in bulk, duplicates and deletes', () => {
    const s = useFollowUpsStore.getState()
    const a = s.addTask(base)
    const b = useFollowUpsStore.getState().addTask({ ...base, title: 'Email' })
    useFollowUpsStore.getState().updateMany([a.id, b.id], { priority: 'high' })
    expect(useFollowUpsStore.getState().tasks.every((t) => t.priority === 'high')).toBe(true)

    useFollowUpsStore.getState().duplicateTask(a.id)
    const copy = useFollowUpsStore.getState().tasks[0]
    expect(copy.title).toBe('Call (copy)')
    expect(copy.id).not.toBe(a.id)

    useFollowUpsStore.getState().deleteTasks([a.id, copy.id])
    expect(useFollowUpsStore.getState().tasks.map((t) => t.id)).toEqual([b.id])
  })

  it('imports rows with unique ids ahead of existing ones', () => {
    useFollowUpsStore.getState().addTask(base)
    const n = useFollowUpsStore.getState().importTasks([base, base])
    const ids = useFollowUpsStore.getState().tasks.map((t) => t.id)
    expect(n).toBe(2)
    expect(new Set(ids).size).toBe(3)
  })

  it('reset restores the deterministic sample list', () => {
    useFollowUpsStore.getState().resetTasks()
    const first = useFollowUpsStore.getState().tasks
    useFollowUpsStore.getState().resetTasks()
    expect(useFollowUpsStore.getState().tasks).toEqual(first)
    expect(first).toHaveLength(60)
  })
})
