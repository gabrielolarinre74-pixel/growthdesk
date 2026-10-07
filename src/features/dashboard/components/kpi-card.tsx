import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Props = {
  title: string
  value: string
  icon: LucideIcon
  change?: number
  hint?: string
}

export function KpiCard({ title, value, icon: Icon, change, hint }: Props) {
  const up = (change ?? 0) >= 0
  return (
    <Card className='gap-2'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0'>
        <CardTitle className='text-sm font-medium text-muted-foreground'>
          {title}
        </CardTitle>
        <span className='rounded-md bg-primary/10 p-1.5 text-primary'>
          <Icon className='size-4' />
        </span>
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold tabular-nums'>{value}</div>
        <p className='mt-1 flex items-center gap-1 text-xs text-muted-foreground'>
          {change !== undefined && (
            <span
              className={cn(
                'inline-flex items-center font-medium',
                up
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              )}
            >
              {up ? (
                <ArrowUpRight className='size-3' />
              ) : (
                <ArrowDownRight className='size-3' />
              )}
              {Math.abs(Math.round(change * 100))}%
            </span>
          )}
          {hint}
        </p>
      </CardContent>
    </Card>
  )
}
