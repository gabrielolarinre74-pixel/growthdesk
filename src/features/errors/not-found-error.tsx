import { Link, useRouter } from '@tanstack/react-router'
import { ArrowLeft, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NotFoundError() {
  const { history } = useRouter()
  return (
    <div className='relative grid min-h-svh place-items-center overflow-hidden px-6'>
      <div
        aria-hidden
        className='pointer-events-none absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl'
      />
      <div className='relative max-w-md text-center'>
        <span className='mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--brand-glow)]'>
          <Compass className='size-6' />
        </span>
        <p className='mt-6 text-sm font-semibold tracking-[0.14em] text-primary uppercase'>
          404
        </p>
        <h1 className='mt-2 text-3xl font-semibold tracking-tight sm:text-4xl'>
          This page isn’t in your workspace
        </h1>
        <p className='mt-3 text-muted-foreground'>
          The link may be old or mistyped. Your leads and follow-ups are safe.
        </p>
        <div className='mt-8 flex justify-center gap-3'>
          <Button variant='outline' onClick={() => history.go(-1)}>
            <ArrowLeft /> Go back
          </Button>
          <Button asChild>
            <Link to='/'>Open overview</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
