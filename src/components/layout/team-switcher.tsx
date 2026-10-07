import * as React from 'react'
import { Link } from '@tanstack/react-router'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

type TeamSwitcherProps = {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}

/** Brand block at the top of the sidebar. */
export function TeamSwitcher({ teams }: TeamSwitcherProps) {
  const brand = teams[0]
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size='lg' asChild>
          <Link to='/'>
            <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-sm'>
              <brand.logo className='size-4' />
            </div>
            <div className='grid flex-1 text-start text-sm leading-tight'>
              <span className='truncate font-semibold'>{brand.name}</span>
              <span className='truncate text-xs text-muted-foreground'>
                {brand.plan}
              </span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
