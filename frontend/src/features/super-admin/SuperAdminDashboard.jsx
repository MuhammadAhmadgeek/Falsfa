import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  DollarSign, School, AlertTriangle, Clock, TrendingUp, TrendingDown,
  Search, Building2, Loader2, Users,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts'

const PLAN_COLORS = {
  free: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
  basic: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
  premium: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  pro: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  enterprise: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
}

// Monthly data placeholder (would come from analytics API)
const MONTHLY_DATA = [
  { month: 'Jul', schools: 2, revenue: 4000 },
  { month: 'Aug', schools: 3, revenue: 6000 },
  { month: 'Sep', schools: 4, revenue: 8000 },
  { month: 'Oct', schools: 5, revenue: 10000 },
  { month: 'Nov', schools: 6, revenue: 12000 },
  { month: 'Dec', schools: 7, revenue: 14000 },
]

function StatsCards({ stats, loading }) {
  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  const cards = [
    { title: 'Total Revenue', value: formatCurrency(stats?.totalRevenue || 0), change: stats?.revenueGrowth || 0, icon: DollarSign, gradient: 'from-emerald-500/20 to-emerald-600/5', iconColor: 'text-emerald-400' },
    { title: 'Active Schools', value: String(stats?.activeSchools || 0), change: stats?.schoolGrowth || 0, icon: School, gradient: 'from-blue-500/20 to-blue-600/5', iconColor: 'text-blue-400' },
    { title: 'Total Students', value: String(stats?.totalStudents || 0), change: 0, icon: Users, gradient: 'from-amber-500/20 to-amber-600/5', iconColor: 'text-amber-400' },
    { title: 'Total Teachers', value: String(stats?.totalTeachers || 0), change: 0, icon: Clock, gradient: 'from-violet-500/20 to-violet-600/5', iconColor: 'text-violet-400' },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        const isPositive = card.change >= 0
        return (
          <Card key={card.title} className="group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 overflow-hidden relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-50`} />
            <CardContent className="p-5 relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-3xl font-bold mt-2 tracking-tight">{card.value}</p>
                  {card.change !== 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      {isPositive ? <TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> : <TrendingDown className="h-3.5 w-3.5 text-red-400" />}
                      <span className={`text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>{isPositive ? '+' : ''}{card.change}%</span>
                    </div>
                  )}
                </div>
                <div className={`${card.iconColor} rounded-xl p-3 bg-white/5 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function GrowthCharts() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-400" /> School Registrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={MONTHLY_DATA}>
              <defs>
                <linearGradient id="schoolGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 28%, 17%)" />
              <XAxis dataKey="month" tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <ReTooltip contentStyle={{ backgroundColor: 'hsl(222, 47%, 9%)', border: '1px solid hsl(215, 28%, 17%)', borderRadius: '8px', color: '#fff' }} />
              <Area type="monotone" dataKey="schools" stroke="hsl(217, 91%, 60%)" fill="url(#schoolGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-400" /> Monthly Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={MONTHLY_DATA}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 28%, 17%)" />
              <XAxis dataKey="month" tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
              <ReTooltip contentStyle={{ backgroundColor: 'hsl(222, 47%, 9%)', border: '1px solid hsl(215, 28%, 17%)', borderRadius: '8px', color: '#fff' }} formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="url(#revGrad)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function SchoolManagementTable() {
  const [schools, setSchools] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await api.get('/schools')
        setSchools(res.data.data || [])
      } catch (err) {
        console.error('Failed to fetch schools:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSchools()
  }, [])

  const filtered = schools.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase())
  )

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.put(`/schools/${id}`, { isActive: !currentStatus })
      setSchools(prev => prev.map(s => s._id === id ? { ...s, isActive: !s.isActive } : s))
    } catch (err) {
      console.error('Toggle failed:', err)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-base">Registered Schools</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search schools..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>School Name</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-center">Students</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-center">Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(school => (
                <TableRow key={school._id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{school.code}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {school.name.charAt(0)}
                      </div>
                      <span className="font-medium text-sm">{school.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${PLAN_COLORS[school.plan] || PLAN_COLORS.basic} text-[10px] uppercase tracking-wider border`}>
                      {school.plan}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-sm">{school.stats?.totalStudents || 0}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{school.email}</TableCell>
                  <TableCell className="text-center">
                    <Switch checked={school.isActive} onCheckedChange={() => toggleStatus(school._id, school.isActive)} />
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No schools found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats')
        if (res.data.success) setStats(res.data.data)
      } catch (err) {
        console.error('Failed to fetch stats:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">Monitor all schools, revenue, and subscriptions</p>
      </div>
      <StatsCards stats={stats} loading={loading} />
      <GrowthCharts />
      <SchoolManagementTable />
    </div>
  )
}
