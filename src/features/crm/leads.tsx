import { useMemo, useState } from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Download, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCrmStore } from '@/stores/crm-store'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DataTableBulkActions,
  DataTableColumnHeader,
  DataTablePagination,
  DataTableToolbar,
} from '@/components/data-table'
import { Main } from '@/components/layout/main'
import { LeadDialog } from './components/lead-dialog'
import { AppHeader } from './components/page-header'
import { type Lead, SERVICES, SOURCES, STAGES, STAGE_META } from './data/types'
import { downloadCsv, money, toCsv } from './lib/metrics'

const arrayFilter = (
  row: { getValue: (id: string) => unknown },
  id: string,
  value: string[]
) => value.includes(row.getValue(id) as string)

const columns: ColumnDef<Lead>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        onClick={(e) => e.stopPropagation()}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'company',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Company' />
    ),
    cell: ({ row }) => (
      <div className='min-w-40'>
        <p className='font-medium'>{row.original.company}</p>
        <p className='text-xs text-muted-foreground'>{row.original.contact}</p>
      </div>
    ),
    filterFn: (row, _id, value: string) => {
      const q = value.toLowerCase()
      return [
        row.original.company,
        row.original.contact,
        row.original.email,
      ].some((v) => v.toLowerCase().includes(q))
    },
  },
  {
    accessorKey: 'stage',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Stage' />
    ),
    cell: ({ row }) => (
      <span className='inline-flex items-center gap-2 text-sm'>
        <span
          className={cn(
            'size-2 rounded-full',
            STAGE_META[row.original.stage].color
          )}
        />
        {STAGE_META[row.original.stage].label}
      </span>
    ),
    filterFn: arrayFilter,
  },
  {
    accessorKey: 'service',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Service' />
    ),
    cell: ({ row }) => <Badge variant='outline'>{row.original.service}</Badge>,
    filterFn: arrayFilter,
  },
  {
    accessorKey: 'source',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Source' />
    ),
    filterFn: arrayFilter,
  },
  {
    accessorKey: 'value',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Value' />
    ),
    cell: ({ row }) => (
      <span className='font-medium tabular-nums'>
        {money(row.original.value)}
      </span>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created' />
    ),
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
]

export function Leads() {
  const leads = useCrmStore((s) => s.leads)
  const deleteLeads = useCrmStore((s) => s.deleteLeads)
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})
  const [editing, setEditing] = useState<Lead | null>(null)
  const [creating, setCreating] = useState(false)
  const data = useMemo(() => leads, [leads])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getRowId: (r) => r.id,
    state: { sorting, columnFilters, rowSelection },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const exportCsv = () => {
    const rows = table.getFilteredRowModel().rows.map((r) => ({
      id: r.original.id,
      company: r.original.company,
      contact: r.original.contact,
      email: r.original.email,
      stage: STAGE_META[r.original.stage].label,
      service: r.original.service,
      source: r.original.source,
      value: r.original.value,
      created: r.original.createdAt.slice(0, 10),
      closed: r.original.closedAt?.slice(0, 10) ?? '',
      next_follow_up: r.original.nextFollowUp ?? '',
    }))
    downloadCsv(
      `growthdesk-leads-${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv(rows)
    )
    toast.success(`Exported ${rows.length} leads`)
  }

  return (
    <>
      <AppHeader fixed />
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Leads & clients
            </h2>
            <p className='text-muted-foreground'>
              Every enquiry in one place. Filter, export or open a lead to
              update it.
            </p>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' onClick={exportCsv}>
              <Download /> Export CSV
            </Button>
            <Button onClick={() => setCreating(true)}>
              <Plus /> New lead
            </Button>
          </div>
        </div>
        <div className='flex flex-1 flex-col gap-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
          <DataTableToolbar
            table={table}
            searchKey='company'
            searchPlaceholder='Search company, contact or email…'
            filters={[
              {
                columnId: 'stage',
                title: 'Stage',
                options: STAGES.map((s) => ({
                  label: STAGE_META[s].label,
                  value: s,
                })),
              },
              {
                columnId: 'service',
                title: 'Service',
                options: SERVICES.map((s) => ({ label: s, value: s })),
              },
              {
                columnId: 'source',
                title: 'Source',
                options: SOURCES.map((s) => ({ label: s, value: s })),
              },
            ]}
          />
          <div className='overflow-hidden rounded-md border'>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((h) => (
                      <TableHead key={h.id}>
                        {h.isPlaceholder
                          ? null
                          : flexRender(
                              h.column.columnDef.header,
                              h.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      className='cursor-pointer'
                      onClick={() => setEditing(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className='h-24 text-center'
                    >
                      No leads match these filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <DataTablePagination table={table} className='mt-auto' />
          <DataTableBulkActions table={table} entityName='lead'>
            <Button
              variant='destructive'
              size='sm'
              onClick={() => {
                const ids = table
                  .getFilteredSelectedRowModel()
                  .rows.map((r) => r.original.id)
                deleteLeads(ids)
                table.resetRowSelection()
                toast(
                  `Deleted ${ids.length} lead${ids.length === 1 ? '' : 's'}`
                )
              }}
            >
              <Trash2 /> Delete
            </Button>
          </DataTableBulkActions>
        </div>
      </Main>
      <LeadDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        lead={editing}
      />
      <LeadDialog open={creating} onOpenChange={setCreating} />
    </>
  )
}
