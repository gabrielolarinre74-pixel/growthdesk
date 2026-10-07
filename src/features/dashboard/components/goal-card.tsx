import { useState } from 'react'
import { Pencil, Target } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { goalProgress, money } from '@/features/crm/lib/metrics'

export function GoalCard({ revenueThisMonth }: { revenueThisMonth: number }) {
  const goal = useCrmStore((s) => s.monthlyGoal)
  const setGoal = useCrmStore((s) => s.setMonthlyGoal)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(goal))
  const progress = goalProgress(revenueThisMonth, goal)
  const now = new Date()
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate()
  const expected = now.getDate() / daysInMonth
  const onTrack = progress >= expected

  return (
    <Card>
      <CardHeader className='flex flex-row items-start justify-between space-y-0'>
        <div>
          <CardTitle className='flex items-center gap-2'>
            <Target className='size-4 text-primary' /> Monthly revenue goal
          </CardTitle>
          <CardDescription>
            {now.toLocaleString('en', { month: 'long' })} · day {now.getDate()}{' '}
            of {daysInMonth}
          </CardDescription>
        </div>
        <Button
          variant='ghost'
          size='icon'
          aria-label='Edit goal'
          onClick={() => setEditing((e) => !e)}
        >
          <Pencil className='size-4' />
        </Button>
      </CardHeader>
      <CardContent className='space-y-3'>
        {editing ? (
          <form
            className='flex gap-2'
            onSubmit={(e) => {
              e.preventDefault()
              const n = Number(draft)
              if (!Number.isFinite(n) || n <= 0) {
                toast.error('Enter a goal above zero')
                return
              }
              setGoal(n)
              setEditing(false)
              toast.success(`Goal set to ${money(n)}`)
            }}
          >
            <Input
              type='number'
              min={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <Button type='submit'>Save</Button>
          </form>
        ) : (
          <div className='flex items-baseline justify-between'>
            <span className='text-2xl font-bold tabular-nums'>
              {money(revenueThisMonth)}
            </span>
            <span className='text-sm text-muted-foreground'>
              of {money(goal)}
            </span>
          </div>
        )}
        <div
          className='relative h-3 overflow-hidden rounded-full bg-muted'
          role='progressbar'
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className='h-full rounded-full bg-primary transition-all'
            style={{ width: `${progress * 100}%` }}
          />
          <div
            className='absolute top-0 h-full w-0.5 bg-foreground/40'
            style={{ left: `${expected * 100}%` }}
            title='Where you should be today'
          />
        </div>
        <p className='text-sm text-muted-foreground'>
          {Math.round(progress * 100)}% reached ·{' '}
          <span
            className={
              onTrack
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-amber-600 dark:text-amber-400'
            }
          >
            {onTrack
              ? 'on track'
              : `${money(Math.max(0, goal * expected - revenueThisMonth))} behind pace`}
          </span>
        </p>
      </CardContent>
    </Card>
  )
}
