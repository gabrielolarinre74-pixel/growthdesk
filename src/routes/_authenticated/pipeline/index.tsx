import { createFileRoute } from '@tanstack/react-router'
import { Pipeline } from '@/features/crm/pipeline'

export const Route = createFileRoute('/_authenticated/pipeline/')({
  component: Pipeline,
})
