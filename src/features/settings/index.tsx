import { useState } from 'react'
import { Check, Download, Monitor, Moon, RotateCcw, Sun, Target } from 'lucide-react'
import { toast } from 'sonner'
import { fonts } from '@/config/fonts'
import { cn } from '@/lib/utils'
import { useFont } from '@/context/font-provider'
import { useTheme } from '@/context/theme-provider'
import { useCrmStore } from '@/stores/crm-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Main } from '@/components/layout/main'
import { AppHeader } from '@/features/crm/components/page-header'
import { STAGE_META } from '@/features/crm/data/types'
import { downloadCsv, money, toCsv } from '@/features/crm/lib/metrics'

const THEMES = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'Match device', icon: Monitor },
] as const

// Literal class names so Tailwind generates them (also used by FontProvider on <html>)
const FONT_OPTIONS: Record<(typeof fonts)[number], { label: string; className: string }> = {
  geist: { label: 'Geist', className: 'font-geist' },
  outfit: { label: 'Outfit', className: 'font-outfit' },
}

export function Settings() {
  const { theme, setTheme } = useTheme()
  const { font, setFont } = useFont()
  const leads = useCrmStore((s) => s.leads)
  const monthlyGoal = useCrmStore((s) => s.monthlyGoal)
  const setMonthlyGoal = useCrmStore((s) => s.setMonthlyGoal)
  const resetDemo = useCrmStore((s) => s.resetDemo)
  const [goal, setGoal] = useState(String(monthlyGoal))

  const saveGoal = () => {
    const n = Number(goal)
    if (!Number.isFinite(n) || n <= 0 || n > 100_000_000) {
      toast.error('Enter a monthly goal greater than 0')
      return
    }
    setMonthlyGoal(n)
    toast.success(`Monthly goal set to ${money(Math.round(n))}`)
  }

  const exportAll = () => {
    const rows = leads.map((l) => ({
      company: l.company,
      contact: l.contact,
      email: l.email,
      stage: STAGE_META[l.stage].label,
      service: l.service,
      source: l.source,
      value: l.value,
      created: l.createdAt.slice(0, 10),
      closed: l.closedAt?.slice(0, 10) ?? '',
      next_follow_up: l.nextFollowUp ?? '',
    }))
    downloadCsv(`growthdesk-all-leads-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows))
    toast.success(`Exported ${rows.length} leads`)
  }

  return (
    <>
      <AppHeader />
      <Main className='max-w-4xl space-y-6'>
        <div>
          <p className='text-xs font-semibold tracking-[0.14em] text-primary uppercase'>Workspace</p>
          <h1 className='mt-1 text-3xl font-semibold'>Settings</h1>
          <p className='mt-1 text-muted-foreground'>Your goal, your look and your data.</p>
        </div>

        <Section title='Monthly revenue goal' description='Drives the goal card and pace marker on the overview.'>
          <form
            className='flex flex-wrap items-end gap-3'
            onSubmit={(e) => {
              e.preventDefault()
              saveGoal()
            }}
          >
            <div className='grid gap-2'>
              <Label htmlFor='goal'>Goal (USD per month)</Label>
              <div className='relative'>
                <Target className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
                <Input id='goal' type='number' min={1} className='w-56 pl-9' value={goal} onChange={(e) => setGoal(e.target.value)} />
              </div>
            </div>
            <Button type='submit'>Save goal</Button>
          </form>
        </Section>

        <Section title='Appearance' description='Saved on this device.'>
          <div className='grid gap-3 sm:grid-cols-3'>
            {THEMES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type='button'
                onClick={() => setTheme(value)}
                aria-pressed={theme === value}
                className={cn(
                  'flex items-center gap-3 rounded-xl border p-4 text-left text-sm font-medium transition hover:border-primary/50',
                  theme === value && 'border-primary bg-accent text-accent-foreground ring-1 ring-primary'
                )}
              >
                <Icon className='size-4' />
                {label}
                {theme === value && <Check className='ms-auto size-4' />}
              </button>
            ))}
          </div>
          <div className='mt-5 flex flex-wrap gap-2'>
            {fonts.map((f) => (
              <button
                key={f}
                type='button'
                onClick={() => setFont(f)}
                aria-pressed={font === f}
                className={cn(
                  FONT_OPTIONS[f].className,
                  'rounded-full border px-4 py-1.5 text-sm transition',
                  font === f ? 'border-foreground bg-foreground text-background' : 'hover:border-foreground/40'
                )}
              >
                {FONT_OPTIONS[f].label}
              </button>
            ))}
          </div>
        </Section>

        <Section title='Your data' description='Everything is stored in this browser. Nothing is sent to a server.'>
          <div className='flex flex-wrap gap-3'>
            <Button variant='outline' onClick={exportAll}>
              <Download /> Export all leads (CSV)
            </Button>
            <Button
              variant='outline'
              onClick={() => {
                if (!window.confirm('Replace all leads with fresh sample data?')) return
                resetDemo()
                toast.success('Sample data restored')
              }}
            >
              <RotateCcw /> Reset sample data
            </Button>
          </div>
          <p className='mt-3 text-xs text-muted-foreground'>{leads.length} leads in this workspace.</p>
        </Section>
      </Main>
    </>
  )
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className='overflow-hidden rounded-2xl border bg-card shadow-[var(--shadow-card)]'>
      <header className='border-b bg-muted/40 px-6 py-4'>
        <h2 className='text-base font-semibold'>{title}</h2>
        <p className='text-sm text-muted-foreground'>{description}</p>
      </header>
      <div className='p-6'>{children}</div>
    </section>
  )
}
