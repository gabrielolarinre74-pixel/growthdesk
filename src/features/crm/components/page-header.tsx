import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { LeadDialog } from './lead-dialog'

/** Top bar shared by every workspace page: search, quick "New lead" and theme. */
export function AppHeader({ fixed }: { fixed?: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <Header fixed={fixed}>
      <Search className='me-auto' />
      <Button
        size='sm'
        className='hidden rounded-full px-4 shadow-[var(--brand-glow)] sm:inline-flex'
        onClick={() => setOpen(true)}
      >
        <Plus /> New lead
      </Button>
      <ThemeSwitch />
      <LeadDialog open={open} onOpenChange={setOpen} />
    </Header>
  )
}
