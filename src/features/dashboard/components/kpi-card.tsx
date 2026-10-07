import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { money } from '@/features/crm/lib/metrics'

type Change = { change?: number }

function ChangePill({ change, inverted }: Change & { inverted?: boolean }) {
  if (change === undefined) return null
  const up = change >= 0
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums',
        up
          ? inverted
            ? 'bg-green-400/15 text-green-300'
            : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
          : inverted
            ? 'bg-rose-400/15 text-rose-300'
            : 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
      )}
    >
      {up ? (
        <ArrowUpRight className='size-3' />
      ) : (
        <ArrowDownRight className='size-3' />
      )}
      {Math.abs(Math.round(change * 100))}%
    </span>
  )
}

type HeroProps = Change & {
  label: string
  value: string
  hint: string
  bars: { label: string; value: number }[]
}

/** Featured black card: headline revenue plus a mini bar history. */
export function HeroKpi({ label, value, change, hint, bars }: HeroProps) {
  const max = Math.max(1, ...bars.map((b) => b.value))
  return (
    <div className='relative overflow-hidden rounded-2xl bg-neutral-950 p-6 text-white shadow-[var(--shadow-card)] ring-1 ring-white/10'>
      <div
        aria-hidden
        className='pointer-events-none absolute -top-24 -right-16 size-64 rounded-full bg-green-500/25 blur-3xl'
      />
      <div className='relative flex items-start justify-between gap-4'>
        <div>
          <p className='text-sm text-white/60'>{label}</p>
          <p className='mt-2 font-display text-4xl font-semibold tracking-tight tabular-nums'>
            {value}
          </p>
          <p className='mt-2 flex items-center gap-2 text-xs text-white/55'>
            <ChangePill change={change} inverted />
            {hint}
          </p>
        </div>
      </div>
      <div
        className='relative mt-6 flex h-16 items-end gap-1.5'
        aria-label='Won revenue, last 6 months'
      >
        {bars.map((b, i) => (
          <div
            key={b.label}
            className='flex flex-1 flex-col items-center gap-1'
          >
            <div
              title={`${b.label}: ${money(b.value)}`}
              className={cn(
                'w-full rounded-md',
                i === bars.length - 1
                  ? 'bg-gradient-to-t from-green-500 to-emerald-300'
                  : 'bg-white/15'
              )}
              style={{ height: `${Math.max(6, (b.value / max) * 48)}px` }}
            />
            <span className='text-[10px] text-white/40'>{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

type StatProps = Change & {
  title: string
  value: string
  icon: LucideIcon
  hint?: string
}

/** Borderless stat used inside the KPI strip. */
export function KpiStat({ title, value, icon: Icon, change, hint }: StatProps) {
  return (
    <div className='flex flex-col justify-between gap-3 p-5'>
      <div className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
        <span className='flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary'>
          <Icon className='size-4' />
        </span>
        {title}
      </div>
      <div>
        <div className='font-display text-3xl font-semibold tracking-tight tabular-nums'>
          {value}
        </div>
        <p className='mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground'>
          <ChangePill change={change} />
          {hint}
        </p>
      </div>
    </div>
  )
}
