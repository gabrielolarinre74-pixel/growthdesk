import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useCrmStore } from '@/stores/crm-store'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  type Lead,
  type LeadFormValues,
  leadFormSchema,
  SERVICES,
  SOURCES,
  STAGES,
  STAGE_META,
} from '../data/types'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  lead?: Lead | null
  defaultStage?: Lead['stage']
}

const empty = (stage: Lead['stage'] = 'new'): LeadFormValues => ({
  company: '',
  contact: '',
  email: '',
  phone: '',
  service: 'Website',
  source: 'Website form',
  stage,
  value: 0,
  notes: '',
  nextFollowUp: '',
})

export function LeadDialog({ open, onOpenChange, lead, defaultStage }: Props) {
  const addLead = useCrmStore((s) => s.addLead)
  const updateLead = useCrmStore((s) => s.updateLead)
  const deleteLeads = useCrmStore((s) => s.deleteLeads)
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: empty(defaultStage),
  })

  useEffect(() => {
    if (open) {
      form.reset(
        lead
          ? {
              company: lead.company,
              contact: lead.contact,
              email: lead.email,
              phone: lead.phone ?? '',
              service: lead.service,
              source: lead.source,
              stage: lead.stage,
              value: lead.value,
              notes: lead.notes ?? '',
              nextFollowUp: lead.nextFollowUp ?? '',
            }
          : empty(defaultStage)
      )
    }
  }, [open, lead, defaultStage, form])

  const onSubmit = (values: LeadFormValues) => {
    const clean = { ...values, nextFollowUp: values.nextFollowUp || undefined }
    if (lead) {
      updateLead(lead.id, clean)
      toast.success(`${values.company} updated`)
    } else {
      const created = addLead(clean)
      toast.success(`${created.company} added to your pipeline`)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>
            {lead ? `Edit ${lead.company}` : 'New lead'}
          </DialogTitle>
          <DialogDescription>
            {lead
              ? `Lead ${lead.id} · created ${new Date(lead.createdAt).toLocaleDateString()}`
              : 'Capture a new enquiry so it never gets lost in your inbox.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='lead-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='grid gap-4 sm:grid-cols-2'
          >
            <TextField
              form={form}
              name='company'
              label='Company'
              placeholder='Bright Bakery'
            />
            <TextField
              form={form}
              name='contact'
              label='Contact person'
              placeholder='Ada Lovelace'
            />
            <TextField
              form={form}
              name='email'
              label='Email'
              placeholder='ada@brightbakery.com'
              type='email'
            />
            <TextField
              form={form}
              name='phone'
              label='Phone (optional)'
              placeholder='+1 555 0100'
            />
            <SelectField
              form={form}
              name='service'
              label='Service'
              options={SERVICES.map((s) => [s, s])}
            />
            <SelectField
              form={form}
              name='source'
              label='Source'
              options={SOURCES.map((s) => [s, s])}
            />
            <SelectField
              form={form}
              name='stage'
              label='Stage'
              options={STAGES.map((s) => [s, STAGE_META[s].label])}
            />
            <FormField
              control={form.control}
              name='value'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deal value (USD)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={0}
                      step={50}
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ''
                            ? undefined
                            : e.target.valueAsNumber
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <TextField
              form={form}
              name='nextFollowUp'
              label='Next follow-up'
              type='date'
            />
            <FormField
              control={form.control}
              name='notes'
              render={({ field }) => (
                <FormItem className='sm:col-span-2'>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder='What do they need? Budget, timeline, decision maker…'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter className='gap-2 sm:justify-between'>
          {lead ? (
            <Button
              variant='ghost'
              className='text-destructive'
              onClick={() => {
                deleteLeads([lead.id])
                toast(`${lead.company} deleted`)
                onOpenChange(false)
              }}
            >
              Delete lead
            </Button>
          ) : (
            <span />
          )}
          <Button type='submit' form='lead-form'>
            {lead ? 'Save changes' : 'Add lead'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type FieldProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
  name: keyof LeadFormValues
  label: string
}

function TextField({
  form,
  name,
  label,
  ...rest
}: FieldProps & Omit<React.ComponentProps<typeof Input>, 'form' | 'name'>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...rest} {...field} value={field.value ?? ''} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function SelectField({
  form,
  name,
  label,
  options,
}: FieldProps & { options: [string, string][] }) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map(([value, text]) => (
                <SelectItem key={value} value={value}>
                  {text}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
