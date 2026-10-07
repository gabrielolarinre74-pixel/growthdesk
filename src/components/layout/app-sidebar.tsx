import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { Target } from 'lucide-react'
import { useLayout } from '@/context/layout-provider'
import { useCrmStore } from '@/stores/crm-store'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { Logo } from '@/assets/logo'
import { goalProgress, money } from '@/features/crm/lib/metrics'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'

/** Won revenue this calendar month vs. the monthly goal, for the sidebar card. */
function useMonthGoal() {
  const leads = useCrmStore((s) => s.leads)
  const goal = useCrmStore((s) => s.monthlyGoal)
  return useMemo(() => {
    const now = new Date()
    const won = leads
      .filter((l) => {
        if (l.stage !== 'won' || !l.closedAt) return false
        const d = new Date(l.closedAt)
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
      })
      .reduce((sum, l) => sum + l.value, 0)
    return { won, goal, progress: goalProgress(won, goal) }
  }, [leads, goal])
}

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const { state } = useSidebar()
  const { won, goal, progress } = useMonthGoal()
  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader className='px-3 pt-4'>
        <Link to='/' className='flex items-center gap-2.5 rounded-lg px-1 py-1'>
          <span className='flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-[var(--brand-glow)]'>
            <Logo className='size-5' />
          </span>
          <span className='grid leading-tight group-data-[collapsible=icon]:hidden'>
            <span className='font-display text-[15px] font-semibold'>GrowthDesk</span>
            <span className='text-xs text-sidebar-foreground/50'>Sales workspace</span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className='pt-2'>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter className='p-3'>
        {state === 'expanded' ? (
          <Link
            to='/'
            className='block rounded-xl border border-sidebar-border bg-white/[0.04] p-3.5 transition hover:bg-white/[0.07]'
          >
            <span className='flex items-center gap-1.5 text-xs font-semibold text-sidebar-foreground/70'>
              <Target className='size-3.5 text-green-400' /> This month
            </span>
            <span className='mt-1.5 block font-display text-lg font-semibold'>
              {money(won)}
              <span className='text-xs font-normal text-sidebar-foreground/50'> / {money(goal)}</span>
            </span>
            <span className='mt-2 block h-1.5 overflow-hidden rounded-full bg-white/10'>
              <span
                className='block h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500'
                style={{ width: `${Math.max(3, progress * 100)}%` }}
              />
            </span>
            <span className='mt-1.5 block text-[11px] text-sidebar-foreground/50'>
              {Math.round(progress * 100)}% of monthly goal
            </span>
          </Link>
        ) : (
          <span className='mx-auto flex size-8 items-center justify-center rounded-lg bg-white/[0.06] text-[10px] font-semibold text-green-400'>
            {Math.round(progress * 100)}%
          </span>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
