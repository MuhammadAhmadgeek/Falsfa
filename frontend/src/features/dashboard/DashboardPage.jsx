import { useState, useEffect } from 'react'
import { useTenant } from '@/context/TenantContext'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, GraduationCap, BookOpen, DollarSign, TrendingUp, Calendar, Loader2 } from 'lucide-react'



export default function DashboardPage() {
  const { userRole, schoolConfig } = useTenant()
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const endpoint = userRole === 'superadmin' ? '/dashboard/stats' : '/dashboard/school-stats'
        const [statsRes, activityRes] = await Promise.all([
          api.get(endpoint),
          api.get('/dashboard/recent-activity')
        ])
        if (statsRes.data.success) {
          setStats(statsRes.data.data)
        }
        if (activityRes.data.success) {
          setRecentActivities(activityRes.data.data)
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err)
      } finally {
        setLoading(false)
      }
    }
    if (userRole) fetchStats()
  }, [userRole])

  const SCHOOL_STATS = [
    { title: 'Total Students', value: stats?.totalStudents || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Total Teachers', value: stats?.totalTeachers || 0, icon: GraduationCap, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Active Students', value: stats?.activeStudents || 0, icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Total Classes', value: stats?.totalClasses || 0, icon: DollarSign, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border p-6">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name}! 👋</h1>
        <p className="text-muted-foreground mt-1">
          {schoolConfig?.name} — {userRole === 'superadmin' ? 'Platform Overview' : "Here's what's happening today"}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SCHOOL_STATS.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title} className="group hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                        <span className="text-xs text-emerald-500 font-medium">Live</span>
                      </div>
                    </div>
                    <div className={`${stat.bg} ${stat.color} rounded-xl p-3 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                    <span className="text-lg mt-0.5">{activity.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{activity.text}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No recent activities
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Add Student', icon: '👤', color: 'from-blue-500/10 to-blue-600/5' },
                { label: 'Record Attendance', icon: '✅', color: 'from-emerald-500/10 to-emerald-600/5' },
                { label: 'Enter Marks', icon: '📝', color: 'from-purple-500/10 to-purple-600/5' },
                { label: 'Collect Fee', icon: '💳', color: 'from-amber-500/10 to-amber-600/5' },
                { label: 'Send Notice', icon: '📢', color: 'from-rose-500/10 to-rose-600/5' },
                { label: 'Generate Report', icon: '📊', color: 'from-cyan-500/10 to-cyan-600/5' },
              ].map((action) => (
                <button key={action.label} className={`flex items-center gap-3 rounded-xl bg-gradient-to-br ${action.color} border p-4 text-left hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer`}>
                  <span className="text-2xl">{action.icon}</span>
                  <span className="text-sm font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
