import {
  HelpCircle,
  KanbanSquare,
  LayoutDashboard,
  ListTodo,
  Settings,
  Users,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
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
        { title: 'Settings', url: '/settings', icon: Settings },
        { title: 'About this demo', url: '/about', icon: HelpCircle },
      ],
    },
  ],
}
