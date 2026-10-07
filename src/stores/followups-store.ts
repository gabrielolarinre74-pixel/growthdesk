import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type Task } from '@/features/tasks/data/schema'
import { sampleTasks } from '@/features/tasks/data/tasks'

type NewTask = Omit<Task, 'id'>

type FollowUpsState = {
  tasks: Task[]
  addTask: (values: NewTask) => Task
  updateTask: (id: string, values: Partial<NewTask>) => void
  updateMany: (ids: string[], values: Partial<NewTask>) => void
  duplicateTask: (id: string) => void
  deleteTasks: (ids: string[]) => void
  importTasks: (values: NewTask[]) => number
  resetTasks: () => void
}

/** Next sequential FU-#### id, never colliding with an existing one. */
export const nextTaskId = (tasks: Task[], offset = 1) => {
  const max = tasks.reduce((m, t) => Math.max(m, Number(t.id.replace(/\D/g, '')) || 0), 1000)
  return `FU-${max + offset}`
}

export const useFollowUpsStore = create<FollowUpsState>()(
  persist(
    (set, get) => ({
      tasks: sampleTasks(),
      addTask: (values) => {
        const task = { ...values, id: nextTaskId(get().tasks) }
        set((s) => ({ tasks: [task, ...s.tasks] }))
        return task
      },
      updateTask: (id, values) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...values } : t)) })),
      updateMany: (ids, values) => {
        const set_ = new Set(ids)
        set((s) => ({ tasks: s.tasks.map((t) => (set_.has(t.id) ? { ...t, ...values } : t)) }))
      },
      duplicateTask: (id) => {
        const src = get().tasks.find((t) => t.id === id)
        if (!src) return
        const copy = { ...src, id: nextTaskId(get().tasks), title: `${src.title} (copy)`, status: 'todo' }
        set((s) => ({ tasks: [copy, ...s.tasks] }))
      },
      deleteTasks: (ids) => {
        const set_ = new Set(ids)
        set((s) => ({ tasks: s.tasks.filter((t) => !set_.has(t.id)) }))
      },
      importTasks: (values) => {
        const existing = get().tasks
        const created = values.map((v, i) => ({ ...v, id: nextTaskId(existing, i + 1) }))
        set({ tasks: [...created, ...existing] })
        return created.length
      },
      resetTasks: () => set({ tasks: sampleTasks() }),
    }),
    { name: 'growthdesk-followups', version: 1 }
  )
)
