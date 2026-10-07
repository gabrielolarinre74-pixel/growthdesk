import { cn } from '@/lib/utils'

type PageTitleProps = {
  eyebrow: string
  title: string
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

/** Consistent page heading: small green eyebrow, display-font title, optional actions. */
export function PageTitle({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageTitleProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-end justify-between gap-3',
        className
      )}
    >
      <div className='min-w-0'>
        <p className='text-xs font-semibold tracking-[0.14em] text-primary uppercase'>
          {eyebrow}
        </p>
        <h1 className='mt-1 text-2xl font-semibold tracking-tight sm:text-3xl'>
          {title}
        </h1>
        {description && (
          <p className='mt-1 max-w-2xl text-muted-foreground'>{description}</p>
        )}
      </div>
      {actions && <div className='flex flex-wrap gap-2'>{actions}</div>}
    </div>
  )
}
