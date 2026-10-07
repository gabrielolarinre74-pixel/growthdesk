import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useFollowUpsStore } from '@/stores/followups-store'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
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
import { parseFollowUpsCsv } from '../lib/csv'

const formSchema = z.object({
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, {
      message: 'Please upload a file.',
    })
    .refine(
      (files) =>
        files?.[0]?.type === 'text/csv' ||
        /\.csv$/i.test(files?.[0]?.name ?? ''),
      'Please choose a .csv file.'
    )
    .refine(
      (files) => (files?.[0]?.size ?? 0) <= 1024 * 1024,
      'Keep the file under 1 MB.'
    ),
})

type TaskImportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TasksImportDialog({
  open,
  onOpenChange,
}: TaskImportDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { file: undefined },
  })

  const fileRef = form.register('file')
  const importTasks = useFollowUpsStore((s) => s.importTasks)

  const onSubmit = async () => {
    const file = form.getValues('file')?.[0]
    if (!file) return
    try {
      const { tasks, skipped } = parseFollowUpsCsv(await file.text())
      if (tasks.length === 0) {
        form.setError('file', { message: 'No rows with a title were found.' })
        return
      }
      const count = importTasks(tasks)
      toast.success(
        `Imported ${count} follow-up${count > 1 ? 's' : ''}` +
          (skipped
            ? ` (${skipped} empty row${skipped > 1 ? 's' : ''} skipped)`
            : '')
      )
      onOpenChange(false)
      form.reset()
    } catch (e) {
      form.setError('file', {
        message: e instanceof Error ? e.message : 'Could not read that file.',
      })
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val)
        form.reset()
      }}
    >
      <DialogContent className='gap-2 sm:max-w-sm'>
        <DialogHeader className='text-start'>
          <DialogTitle>Import follow-ups</DialogTitle>
          <DialogDescription>
            Upload a CSV with a title column. Status, type and priority are
            optional.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id='task-import-form' onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name='file'
              render={() => (
                <FormItem className='my-2'>
                  <FormLabel>File</FormLabel>
                  <FormControl>
                    <Input
                      type='file'
                      accept='.csv,text/csv'
                      {...fileRef}
                      className='h-8 py-0'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter className='gap-2'>
          <DialogClose asChild>
            <Button variant='outline'>Close</Button>
          </DialogClose>
          <Button type='submit' form='task-import-form'>
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
