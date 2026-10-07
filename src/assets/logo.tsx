import { type SVGProps } from 'react'
import { cn } from '@/lib/utils'

/** GrowthDesk mark: a rising bar chart inside a rounded tile. */
export function Logo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      id='growthdesk-logo'
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
      height='24'
      width='24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2.2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={cn('size-6', className)}
      {...props}
    >
      <title>GrowthDesk</title>
      <path d='M5 19V14' />
      <path d='M10 19V10' />
      <path d='M15 19V12' />
      <path d='M20 19V5' />
      <path d='M4 9l5-4 5 3 6-5' />
    </svg>
  )
}
