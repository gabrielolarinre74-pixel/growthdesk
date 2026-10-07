import { useMemo } from 'react'
import { useFollowUpsStore } from '@/stores/followups-store'
import { Main } from '@/components/layout/main'
import { PageTitle } from '@/components/page-title'
import { AppHeader } from '@/features/crm/components/page-header'
import { TasksDialogs } from './components/tasks-dialogs'
import { TasksPrimaryButtons } from './components/tasks-primary-buttons'
import { TasksProvider } from './components/tasks-provider'
import { TasksTable } from './components/tasks-table'
import { summarize } from './lib/summary'

export function Tasks() {
  const tasks = useFollowUpsStore((s) => s.tasks)
  const summary = useMemo(() => summarize(tasks), [tasks])
  return (
    <TasksProvider>
      <AppHeader fixed />

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <PageTitle
          eyebrow='Follow-ups'
          title='Follow-ups'
          description='Calls, emails and proposals you owe your leads and clients.'
          actions={
            <>
              <TasksPrimaryButtons />
            </>
          }
        />
        <dl className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
          {summary.map((item) => (
            <div
              key={item.label}
              className='rounded-xl border bg-card px-4 py-3 shadow-[var(--shadow-card)]'
            >
              <dt className='flex items-center gap-2 text-xs font-medium text-muted-foreground'>
                <span className={`size-2 rounded-full ${item.dot}`} />
                {item.label}
              </dt>
              <dd className='mt-1 font-display text-2xl font-semibold tabular-nums'>
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
        <TasksTable data={tasks} />
      </Main>

      <TasksDialogs />
    </TasksProvider>
  )
}
