import {
  Database,
  Download,
  KanbanSquare,
  RotateCcw,
  Target,
} from 'lucide-react'
import { toast } from 'sonner'
import { useCrmStore } from '@/stores/crm-store'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Main } from '@/components/layout/main'
import { PageTitle } from '@/components/page-title'
import { AppHeader } from '@/features/crm/components/page-header'

const points = [
  {
    icon: KanbanSquare,
    title: 'Drag-and-drop pipeline',
    text: 'Move deals from first enquiry to won, with totals per stage.',
  },
  {
    icon: Target,
    title: 'Revenue goal tracking',
    text: 'Set a monthly target and see if you are ahead of or behind pace.',
  },
  {
    icon: Download,
    title: 'CSV exports',
    text: 'Download leads or a period report for your accountant or spreadsheet.',
  },
  {
    icon: Database,
    title: 'Private by default',
    text: 'This demo stores everything in your browser (localStorage). Nothing is sent to a server.',
  },
]

export function About() {
  const resetDemo = useCrmStore((s) => s.resetDemo)
  const count = useCrmStore((s) => s.leads.length)
  return (
    <>
      <AppHeader />
      <Main className='space-y-6'>
        <PageTitle
          eyebrow='About'
          title='About this demo'
          description='GrowthDesk is a lightweight CRM and growth dashboard for agencies, studios and service businesses. The companies and people you see are randomly generated sample data, not real clients.'
        />
        <div className='grid gap-4 sm:grid-cols-2'>
          {points.map((p) => (
            <Card key={p.title}>
              <CardHeader className='flex flex-row items-center gap-3 space-y-0'>
                <span className='rounded-md bg-primary/10 p-2 text-primary'>
                  <p.icon className='size-5' />
                </span>
                <CardTitle className='text-base'>{p.title}</CardTitle>
              </CardHeader>
              <CardContent className='text-sm text-muted-foreground'>
                {p.text}
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Demo data</CardTitle>
            <CardDescription>
              You currently have {count} leads saved in this browser.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant='outline'
              onClick={() => {
                resetDemo()
                toast.success('Sample data restored')
              }}
            >
              <RotateCcw /> Reset sample data
            </Button>
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
