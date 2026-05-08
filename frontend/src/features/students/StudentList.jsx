import { useState, useMemo } from 'react'
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, getSortedRowModel, flexRender,
} from '@tanstack/react-table'
import { useStudents } from './useStudents'
import StudentForm from './StudentForm'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search, Plus, MoreHorizontal, Eye, Pencil, CreditCard,
  ChevronLeft, ChevronRight, Users, ArrowUpDown,
} from 'lucide-react'

const STATUS_CONFIG = {
  active: { label: 'Active', variant: 'success' },
  suspended: { label: 'Suspended', variant: 'warning' },
  graduated: { label: 'Graduated', variant: 'default' },
}

const columns = [
  {
    accessorKey: 'fullName',
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Student Name <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
          {row.original.fullName.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <p className="font-medium text-sm">{row.original.fullName}</p>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'rollNumber',
    header: 'Roll No.',
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.rollNumber}</span>,
  },
  {
    accessorKey: 'class',
    header: 'Class',
    cell: ({ row }) => (
      <span className="text-sm">{row.original.class}{row.original.section ? `-${row.original.section}` : ''}</span>
    ),
  },
  {
    accessorKey: 'parentContact',
    header: 'Parent Contact',
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.parentContact}</span>,
  },
  {
    accessorKey: 'enrollmentDate',
    header: 'Enrolled',
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(row.original.enrollmentDate)}</span>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const s = STATUS_CONFIG[row.original.status]
      return <Badge variant={s.variant}>{s.label}</Badge>
    },
    filterFn: (row, _id, filterValue) => {
      if (filterValue === 'all') return true
      return row.original.status === filterValue
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer"><Eye className="mr-2 h-4 w-4" /> View Profile</DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer"><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer"><CreditCard className="mr-2 h-4 w-4" /> Generate ID Card</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

export default function StudentList() {
  const { data: students, isLoading } = useStudents()
  const [formOpen, setFormOpen] = useState(false)
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredData = useMemo(() => {
    if (statusFilter === 'all') return students
    return students.filter(s => s.status === statusFilter)
  }, [students, statusFilter])

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  const counts = useMemo(() => ({
    total: students.length,
    active: students.filter(s => s.status === 'active').length,
    suspended: students.filter(s => s.status === 'suspended').length,
    graduated: students.filter(s => s.status === 'graduated').length,
  }), [students])

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Student Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{counts.total} students enrolled</p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="shadow-lg shadow-primary/25">
          <Plus className="mr-2 h-4 w-4" /> Add Student
        </Button>
      </div>

      {/* Mini stat badges */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: 'Active', count: counts.active, color: 'bg-emerald-500/10 text-emerald-600' },
          { label: 'Suspended', count: counts.suspended, color: 'bg-amber-500/10 text-amber-600' },
          { label: 'Graduated', count: counts.graduated, color: 'bg-blue-500/10 text-blue-600' },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-lg px-3 py-1.5 text-xs font-medium`}>
            {s.label}: {s.count}
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, roll number..."
                className="pl-9"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="graduated">Graduated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(hg => (
                <TableRow key={hg.id}>
                  {hg.headers.map(header => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow key={row.id} className="hover:bg-muted/50 transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                    No students found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <p className="text-sm text-muted-foreground">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}–
            {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of{' '}
            {table.getFilteredRowModel().rows.length}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <StudentForm open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  )
}
