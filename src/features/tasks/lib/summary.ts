import { type Task } from '../data/schema'

const OPEN = new Set(['backlog', 'todo', 'in progress'])

/** Counts for the summary strip above the table. */
export function summarize(tasks: Task[]) {
  const open = tasks.filter((t) => OPEN.has(t.status))
  return [
    { label: 'Open', value: open.length, dot: 'bg-sky-500' },
    {
      label: 'In progress',
      value: tasks.filter((t) => t.status === 'in progress').length,
      dot: 'bg-amber-500',
    },
    {
      label: 'High priority, open',
      value: open.filter((t) => t.priority === 'high').length,
      dot: 'bg-rose-500',
    },
    {
      label: 'Done',
      value: tasks.filter((t) => t.status === 'done').length,
      dot: 'bg-green-500',
    },
  ]
}
