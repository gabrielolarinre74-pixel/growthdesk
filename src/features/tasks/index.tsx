import { useFollowUpsStore } from '@/stores/followups-store'
import { Main } from '@/components/layout/main'
import { PageTitle } from '@/components/page-title'
import { AppHeader } from '@/features/crm/components/page-header'
import { TasksDialogs } from './components/tasks-dialogs'
import { TasksPrimaryButtons } from './components/tasks-primary-buttons'
import { TasksProvider } from './components/tasks-provider'
import { TasksTable } from './components/tasks-table'

export function Tasks() {
  const tasks = useFollowUpsStore((s) => s.tasks)
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
        <TasksTable data={tasks} />
      </Main>

      <TasksDialogs />
    </TasksProvider>
  )
}
