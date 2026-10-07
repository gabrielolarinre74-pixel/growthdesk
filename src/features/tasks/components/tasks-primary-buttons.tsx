import { Plus, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTasks } from './tasks-provider'

export function TasksPrimaryButtons() {
  const { setOpen } = useTasks()
  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='gap-1.5'
        onClick={() => setOpen('import')}
      >
        <Upload size={16} /> <span>Import CSV</span>
      </Button>
      <Button className='gap-1.5' onClick={() => setOpen('create')}>
        <Plus size={16} /> <span>New follow-up</span>
      </Button>
    </div>
  )
}
