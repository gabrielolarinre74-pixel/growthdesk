import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { money } from '@/features/crm/lib/metrics'

type Point = { label: string; revenue: number; leads: number }

export function RevenueChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width='100%' height={300}>
      <AreaChart data={data} margin={{ left: 8, right: 8, top: 8 }}>
        <defs>
          <linearGradient id='rev' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0%' stopColor='var(--chart-1)' stopOpacity={0.35} />
            <stop offset='100%' stopColor='var(--chart-1)' stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          vertical={false}
          strokeDasharray='3 3'
          className='stroke-border'
        />
        <XAxis
          dataKey='label'
          tickLine={false}
          axisLine={false}
          fontSize={12}
          stroke='#888'
        />
        <YAxis
          direction='ltr'
          tickLine={false}
          axisLine={false}
          fontSize={12}
          stroke='#888'
          tickFormatter={(v: number) =>
            v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${v}`
          }
        />
        <Tooltip
          cursor={{ stroke: 'var(--border)' }}
          content={({ active, payload, label }) =>
            active && payload?.length ? (
              <div className='rounded-md border bg-popover px-3 py-2 text-sm shadow-md'>
                <p className='font-medium'>{label}</p>
                <p className='text-muted-foreground'>
                  Won revenue: {money(Number(payload[0].payload.revenue))}
                </p>
                <p className='text-muted-foreground'>
                  New leads: {payload[0].payload.leads}
                </p>
              </div>
            ) : null
          }
        />
        <Area
          type='monotone'
          dataKey='revenue'
          stroke='var(--chart-1)'
          strokeWidth={2}
          fill='url(#rev)'
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
