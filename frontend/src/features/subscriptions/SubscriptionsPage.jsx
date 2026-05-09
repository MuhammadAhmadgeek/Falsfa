import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Search, CreditCard, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

const PLAN_COLORS = {
  free: 'bg-slate-500/15 text-slate-500 hover:bg-slate-500/25',
  basic: 'bg-blue-500/15 text-blue-500 hover:bg-blue-500/25',
  premium: 'bg-violet-500/15 text-violet-500 hover:bg-violet-500/25',
  pro: 'bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25',
}

export default function SubscriptionsPage() {
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchSubscriptions = async () => {
    try {
      const res = await api.get('/schools/subscriptions')
      if (res.data.success) {
        setSchools(res.data.data)
      }
    } catch (err) {
      toast.error('Failed to load subscriptions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const filtered = schools.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Subscriptions Management</h1>
        <p className="text-muted-foreground">Manage school billing plans and active subscriptions.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Active Subscriptions</CardTitle>
            <CardDescription>View and upgrade plans for all registered schools.</CardDescription>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search schools..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School Name</TableHead>
                  <TableHead>Current Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(school => (
                  <TableRow key={school._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                          {school.name.charAt(0)}
                        </div>
                        {school.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`uppercase text-[10px] tracking-wider border-0 shadow-none ${PLAN_COLORS[school.plan] || PLAN_COLORS.free}`}>
                        {school.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {school.isActive ? (
                        <div className="flex items-center gap-1 text-emerald-500 text-xs font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Active
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-muted-foreground text-xs font-medium">
                          <div className="h-2 w-2 rounded-full bg-muted-foreground" /> Inactive
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(school.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <UpgradeModal school={school} onRefresh={fetchSubscriptions} />
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No subscriptions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function UpgradeModal({ school, onRefresh }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState(school.plan)

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      await api.put(`/schools/subscriptions/${school._id}`, { plan })
      toast.success(`${school.name} plan updated to ${plan}`)
      setOpen(false)
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update plan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><CreditCard className="mr-2 h-4 w-4" /> Change Plan</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Subscription</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
            <span className="font-medium text-sm">{school.name}</span>
            <Badge variant="outline" className="uppercase text-[10px]">{school.plan}</Badge>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Select New Plan</p>
            <Select value={plan} onValueChange={setPlan}>
              <SelectTrigger>
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free Plan (Basic Features)</SelectItem>
                <SelectItem value="basic">Basic Plan (Standard Support)</SelectItem>
                <SelectItem value="pro">Pro Plan (Advanced Features)</SelectItem>
                <SelectItem value="premium">Premium Plan (Unlimited)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={handleUpgrade} disabled={loading || plan === school.plan} className="w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Confirm Update
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
