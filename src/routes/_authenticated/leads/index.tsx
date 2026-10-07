import { createFileRoute } from '@tanstack/react-router'
import { Leads } from '@/features/crm/leads'

export const Route = createFileRoute('/_authenticated/leads/')({
  component: Leads,
})
