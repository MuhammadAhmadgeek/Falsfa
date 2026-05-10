/**
 * FinancePage.jsx - Management of fee structures, bulk voucher generation, and payment tracking.
 */
import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DollarSign, CheckCircle2, AlertCircle, Clock, Loader2, Plus, DownloadCloud, Search, Pencil, MoreHorizontal, Trash2, AlertTriangle, Printer } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { CLASSES, SECTIONS } from '../students/studentSchema'
import { useTenant } from '@/context/TenantContext'

export default function FinancePage() {
  const [summary, setSummary] = useState(null)
  const [structures, setStructures] = useState([])
  const [vouchers, setVouchers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [sumRes, structRes, vouchRes] = await Promise.all([
        api.get('/fees/summary'),
        api.get('/fees/structures'),
        api.get('/fees')
      ])
      if (sumRes.data.success) setSummary(sumRes.data.data)
      if (structRes.data.success) setStructures(structRes.data.data)
      if (vouchRes.data.success) setVouchers(vouchRes.data.data)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load finance data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Finance Management</h1>
        <p className="text-muted-foreground">Manage fee structures, generate vouchers, and track payments.</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-background border h-11 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Overview</TabsTrigger>
          <TabsTrigger value="structures" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Fee Structures</TabsTrigger>
          <TabsTrigger value="vouchers" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Vouchers & Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab summary={summary} loading={loading} />
        </TabsContent>

        <TabsContent value="structures">
          <StructuresTab structures={structures} onRefresh={fetchData} loading={loading} />
        </TabsContent>

        <TabsContent value="vouchers">
          <VouchersTab vouchers={vouchers} onRefresh={fetchData} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function OverviewTab({ summary, loading }) {
  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Total Collected</p>
              <h3 className="text-3xl font-bold mt-2">{formatCurrency(summary?.collected || 0)}</h3>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-full">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Total Pending</p>
              <h3 className="text-3xl font-bold mt-2">{formatCurrency(summary?.pending || 0)}</h3>
            </div>
            <div className="p-3 bg-amber-500/20 rounded-full">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Total Overdue</p>
              <h3 className="text-3xl font-bold mt-2">{formatCurrency(summary?.overdue || 0)}</h3>
            </div>
            <div className="p-3 bg-red-500/20 rounded-full">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StructuresTab({ structures, onRefresh, loading }) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingStruct, setEditingStruct] = useState(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const { schoolConfig } = useTenant()
  const combinedClasses = [...new Set([...CLASSES, ...(schoolConfig?.customClasses || [])])]
  
  const handleOpenEdit = (struct) => {
    setEditingStruct(struct)
    setOpen(true)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const formData = new FormData(e.target)
    const payload = Object.fromEntries(formData)
    // Convert to numbers
    ;['tuitionFee', 'examFee', 'libraryFee', 'miscFee'].forEach(k => payload[k] = Number(payload[k]))
    if (payload.section === "all") payload.section = ""
    
    try {
      if (editingStruct) {
        await api.put(`/fees/structures/${editingStruct._id}`, payload)
        toast.success('Fee structure updated')
      } else {
        await api.post('/fees/structures', payload)
        toast.success('Fee structure saved')
      }
      setOpen(false)
      setEditingStruct(null)
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    setDeleting(true)
    try {
      await api.delete(`/fees/structures/${id}`)
      toast.success('Fee structure removed')
      onRefresh()
    } catch (err) {
      toast.error('Failed to remove fee structure')
    } finally {
      setDeleting(false)
      setDeleteConfirmId(null)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Class Fee Structures</CardTitle>
          <CardDescription>Define the fee breakdown for each class.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={(val) => {
          setOpen(val);
          if (!val) setEditingStruct(null);
        }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Structure</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingStruct ? 'Update Fee Structure' : 'Add Fee Structure'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Class</Label>
                  <Select name="class" defaultValue={editingStruct?.class} disabled={!!editingStruct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {combinedClasses.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Academic Year</Label>
                  <Input name="academicYear" defaultValue={editingStruct?.academicYear || "2024-2025"} required />
                </div>
                <div className="space-y-2">
                  <Label>Section (Optional)</Label>
                  <Select name="section" defaultValue={editingStruct?.section || "all"}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Sections" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sections</SelectItem>
                      {SECTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          Section {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tuition Fee (PKR)</Label>
                  <Input type="number" name="tuitionFee" required defaultValue={editingStruct?.tuitionFee || 0} />
                </div>
                <div className="space-y-2">
                  <Label>Exam Fee (PKR)</Label>
                  <Input type="number" name="examFee" required defaultValue={editingStruct?.examFee || 0} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Library Fee (PKR)</Label>
                  <Input type="number" name="libraryFee" required defaultValue={editingStruct?.libraryFee || 0} />
                </div>
                <div className="space-y-2">
                  <Label>Misc Fee (PKR)</Label>
                  <Input type="number" name="miscFee" required defaultValue={editingStruct?.miscFee || 0} />
                </div>
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Structure
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Tuition</TableHead>
                <TableHead>Exam</TableHead>
                <TableHead>Library</TableHead>
                <TableHead>Misc</TableHead>
                <TableHead>Total Fee</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {structures.map(s => (
                <TableRow key={s._id}>
                  <TableCell className="font-medium">{s.class}</TableCell>
                  <TableCell>{s.section || 'All'}</TableCell>
                  <TableCell>{formatCurrency(s.tuitionFee)}</TableCell>
                  <TableCell>{formatCurrency(s.examFee)}</TableCell>
                  <TableCell>{formatCurrency(s.libraryFee)}</TableCell>
                  <TableCell>{formatCurrency(s.miscFee)}</TableCell>
                  <TableCell className="font-bold text-primary">
                    {formatCurrency(s.totalFee)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 ml-2">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer" onClick={() => handleOpenEdit(s)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-destructive focus:bg-destructive/10" onClick={() => setDeleteConfirmId(s._id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {structures.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No fee structures defined yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}

      <Dialog open={!!deleteConfirmId} onOpenChange={(val) => !val && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground">
            Are you sure you want to remove this fee structure? This action cannot be undone.
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => handleDelete(deleteConfirmId)} disabled={deleting}>
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </CardContent>
    </Card>
  )
}

function VouchersTab({ vouchers, onRefresh, loading }) {
  const [search, setSearch] = useState('')
  const [openGen, setOpenGen] = useState(false)
  const [openPay, setOpenPay] = useState(false)
  const [selectedVoucher, setSelectedVoucher] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const { schoolConfig } = useTenant()
  const combinedClasses = [...new Set([...CLASSES, ...(schoolConfig?.customClasses || [])])]

  const filtered = vouchers.filter(v => 
    v.studentName.toLowerCase().includes(search.toLowerCase()) || 
    v.class.toLowerCase().includes(search.toLowerCase()) ||
    v.month.toLowerCase().includes(search.toLowerCase())
  )

  const handleGenerate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const formData = new FormData(e.target)
    try {
      const res = await api.post('/fees/generate', Object.fromEntries(formData))
      toast.success(res.data.message || 'Vouchers generated')
      setOpenGen(false)
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const formData = new FormData(e.target)
    try {
      await api.put(`/fees/${selectedVoucher._id}`, {
        status: 'paid',
        paidDate: new Date(),
        ...Object.fromEntries(formData)
      })
      toast.success('Payment Recorded: Voucher marked as paid')
      setOpenPay(false)
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status) => {
    const map = {
      pending: { color: 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' },
      paid: { color: 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' },
      overdue: { color: 'bg-red-500/10 text-red-500 hover:bg-red-500/20' }
    }
    const badgeStyle = map[status] || { color: 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20' }
    return <Badge className={`uppercase text-[10px] ${badgeStyle.color} border-0`}>{status}</Badge>
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search student, class, month..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Dialog open={openGen} onOpenChange={setOpenGen}>
          <DialogTrigger asChild>
            <Button size="sm"><DownloadCloud className="mr-2 h-4 w-4" /> Bulk Generate Vouchers</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Generate Vouchers</DialogTitle></DialogHeader>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-2">
                <Label>Class</Label>
                <Select name="class">
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class (or All)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {combinedClasses.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Section</Label>
                <Select name="section" defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Select Section (or All)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sections</SelectItem>
                    {SECTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        Section {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Month Label</Label>
                <Input name="month" placeholder="e.g. May 2025" required />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" name="dueDate" required />
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Generate
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class/Sec</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Net Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(v => (
                <TableRow key={v._id}>
                  <TableCell className="font-medium">{v.studentName}</TableCell>
                  <TableCell>{v.class} {v.section ? `- ${v.section}` : ''}</TableCell>
                  <TableCell>{v.month}</TableCell>
                  <TableCell>{formatCurrency(v.netAmount)}</TableCell>
                  <TableCell>{getStatusBadge(v.status)}</TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-2">
                    <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => window.open(`/finance/voucher/${v._id}`, '_blank')}>
                      <Printer className="h-3 w-3" /> Print
                    </Button>
                    {v.status !== 'paid' && (
                      <Button size="sm" variant="outline" className="h-8" onClick={() => { setSelectedVoucher(v); setOpenPay(true) }}>
                        Receive Payment
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No vouchers found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}

        {/* Payment Dialog */}
        <Dialog open={openPay} onOpenChange={setOpenPay}>
          <DialogContent>
            <DialogHeader><DialogTitle>Receive Payment - {selectedVoucher?.studentName}</DialogTitle></DialogHeader>
            <form onSubmit={handlePayment} className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg flex justify-between items-center mb-4">
                <span className="text-sm font-medium">Amount Due:</span>
                <span className="text-xl font-bold text-primary">{formatCurrency(selectedVoucher?.netAmount || 0)}</span>
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <select name="paymentMethod" className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="cash">Cash</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="online">Online</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Receipt No. (Optional)</Label>
                <Input name="receiptNo" placeholder="Receipt or Transaction ID" />
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirm Payment
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
