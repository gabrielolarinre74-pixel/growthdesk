import { Link } from '@tanstack/react-router'
import { RefreshCw, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type GeneralErrorProps = React.HTMLAttributes<HTMLDivElement> & {
  minimal?: boolean
}

export function GeneralError({
  className,
  minimal = false,
}: GeneralErrorProps) {
  return (
    <div
      className={cn('grid min-h-svh w-full place-items-center px-6', className)}
    >
      <div className='max-w-md text-center'>
        {!minimal && (
          <span className='mx-auto flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive'>
            <TriangleAlert className='size-6' />
          </span>
        )}
        <h1 className='mt-6 text-2xl font-semibold tracking-tight'>
          Something broke on this screen
        </h1>
        <p className='mt-2 text-muted-foreground'>
          Your data is stored in this browser and hasn’t been touched. Reload to
          try again.
        </p>
        {!minimal && (
          <div className='mt-8 flex justify-center gap-3'>
            <Button variant='outline' asChild>
              <Link to='/'>Open overview</Link>
            </Button>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw /> Reload
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
