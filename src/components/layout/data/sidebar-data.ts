import {
  Bell,
  HelpCircle,
  KanbanSquare,
  LayoutDashboard,
  ListTodo,
  Monitor,
  Palette,
  Settings,
  UserCog,
  Users,
  Wrench,
} from 'lucide-react'
import { Logo } from '@/assets/logo'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Gabriel Zion',
    email: 'gabrielzionath@gmail.com',
    avatar: '',
  },
  teams: [
    {
      name: 'GrowthDesk',
      logo: Logo,
      plan: 'by Gabriel.ATH',
    },
  ],
  navGroups: [
    {
      title: 'Grow',
      items: [
        { title: 'Overview', url: '/', icon: LayoutDashboard },
        { title: 'Pipeline', url: '/pipeline', icon: KanbanSquare },
        { title: 'Leads & clients', url: '/leads', icon: Users },
        { title: 'Follow-ups', url: '/tasks', icon: ListTodo },
      ],
    },
    {
      title: 'Workspace',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          items: [
            { title: 'Profile', url: '/settings', icon: UserCog },
            { title: 'Account', url: '/settings/account', icon: Wrench },
            { title: 'Appearance', url: '/settings/appearance', icon: Palette },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: Bell,
            },
            { title: 'Display', url: '/settings/display', icon: Monitor },
          ],
        },
        { title: 'About this demo', url: '/about', icon: HelpCircle },
      ],
    },
  ],
}
