import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Loader2, TrendingUp, Building2, Users, DollarSign } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as ReTooltip } from 'recharts'
import { toast } from 'sonner'

export default function AnalyticsPage() {
  const [overview, setOverview] = useState(null)
  const [revenue, setRevenue] = useState([])
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, revenueRes, schoolsRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/analytics/revenue'),
          api.get('/analytics/schools')
        ])
        
        if (overviewRes.data.success) setOverview(overviewRes.data.data)
        if (revenueRes.data.success) setRevenue(revenueRes.data.data)
        if (schoolsRes.data.success) setSchools(schoolsRes.data.data)
      } catch (err) {
        console.error(err)
        toast.error('Failed to load analytics data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Analytics</h1>
        <p className="text-muted-foreground">Monitor overall platform performance and revenue.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Total Platform Revenue</p>
                <h3 className="text-3xl font-bold mt-2">{formatCurrency(overview?.totalRevenue || 0)}</h3>
              </div>
              <div className="p-3 bg-emerald-500/20 rounded-full">
                <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Schools</p>
                <h3 className="text-3xl font-bold mt-2">{overview?.totalSchools || 0}</h3>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-full">
                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Students</p>
                <h3 className="text-3xl font-bold mt-2">{overview?.totalStudents || 0}</h3>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-full">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" /> Monthly Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenue}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <ReTooltip cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Bar dataKey="revenue" fill="url(#colorRevenue)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-400" /> School Performance Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               {schools.length > 0 ? (
                 schools.slice(0, 6).map((school, i) => (
                   <div key={school._id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                     <div className="flex items-center gap-3">
                       <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                         {i + 1}
                       </div>
                       <div>
                         <p className="font-medium text-sm">{school.name}</p>
                         <p className="text-xs text-muted-foreground uppercase">{school.plan} Plan</p>
                       </div>
                     </div>
                     <span className="text-sm font-mono text-muted-foreground">{school.code}</span>
                   </div>
                 ))
               ) : (
                 <p className="text-center py-8 text-muted-foreground text-sm">No school data available</p>
               )}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
