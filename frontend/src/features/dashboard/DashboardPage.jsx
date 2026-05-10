import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTenant } from '@/context/TenantContext'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Loader2,
  Building,
  Settings,
  CheckCircle,
  FileText,
  CreditCard,
  Bell,
  BarChart2,
  Activity
} from 'lucide-react'

export default function DashboardPage() {
  const { userRole, schoolConfig } = useTenant()
  const { user } = useAuth()
  const navigate = useNavigate()
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

  const getStatsCards = () => {
    switch(userRole) {
      case 'superadmin':
        return [
          { title: 'Total Schools', value: stats?.totalSchools || 0, icon: Building, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { title: 'Active Tenants', value: stats?.activeSchools || 0, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { title: 'Total Revenue', value: `PKR ${stats?.totalRevenue || 0}`, icon: DollarSign, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { title: 'Pending Onboarding', value: stats?.pendingSchools || 0, icon: Users, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ]
      case 'admin':
        return [
          { title: 'Total Students', value: stats?.totalStudents || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { title: 'Total Teachers', value: stats?.totalTeachers || 0, icon: GraduationCap, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { title: 'Active Students', value: stats?.activeStudents || 0, icon: CheckCircle, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { title: 'Total Classes', value: stats?.totalClasses || 0, icon: BookOpen, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ]
      case 'teacher':
        return [
          { title: 'My Classes', value: stats?.myClasses || 0, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { title: 'My Students', value: stats?.myStudents || 0, icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { title: 'Pending Tasks', value: stats?.pendingTasks || 0, icon: Activity, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { title: 'Avg Attendance', value: `${stats?.avgAttendance || 0}%`, icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ]
      case 'student':
        return [
          { title: 'My Attendance', value: `${stats?.attendance || 0}%`, icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { title: 'Pending Fee', value: `PKR ${stats?.pendingFee || 0}`, icon: DollarSign, color: 'text-rose-500', bg: 'bg-rose-500/10' },
          { title: 'Current Grade', value: stats?.grade || 'N/A', icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { title: 'Assignments', value: stats?.assignments || 0, icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        ]
      default:
        return []
    }
  }

  const getQuickActions = () => {
    switch(userRole) {
      case 'superadmin':
        return [
          { label: 'Manage Schools', icon: <Building className="w-6 h-6 text-blue-600" />, color: 'from-blue-500/10 to-blue-600/5', path: '/schools' },
          { label: 'Platform Settings', icon: <Settings className="w-6 h-6 text-emerald-600" />, color: 'from-emerald-500/10 to-emerald-600/5', path: '/settings' },
          { label: 'View Revenue', icon: <DollarSign className="w-6 h-6 text-amber-600" />, color: 'from-amber-500/10 to-amber-600/5', path: '/analytics' },
        ]
      case 'admin':
        return [
          { label: 'Add Student', icon: <Users className="w-6 h-6 text-blue-600" />, color: 'from-blue-500/10 to-blue-600/5', path: '/students' },
          { label: 'Add Teacher', icon: <GraduationCap className="w-6 h-6 text-emerald-600" />, color: 'from-emerald-500/10 to-emerald-600/5', path: '/teachers' },
          { label: 'Collect Fee', icon: <CreditCard className="w-6 h-6 text-amber-600" />, color: 'from-amber-500/10 to-amber-600/5', path: '/finance' },
          { label: 'School Settings', icon: <Settings className="w-6 h-6 text-purple-600" />, color: 'from-purple-500/10 to-purple-600/5', path: '/settings' },
          { label: 'Send Notice', icon: <Bell className="w-6 h-6 text-rose-600" />, color: 'from-rose-500/10 to-rose-600/5', path: '/dashboard' },
          { label: 'Generate Report', icon: <BarChart2 className="w-6 h-6 text-cyan-600" />, color: 'from-cyan-500/10 to-cyan-600/5', path: '/examinations' },
        ]
      case 'teacher':
        return [
          { label: 'Record Attendance', icon: <CheckCircle className="w-6 h-6 text-emerald-600" />, color: 'from-emerald-500/10 to-emerald-600/5', path: '/attendance' },
          { label: 'View Schedule', icon: <Calendar className="w-6 h-6 text-blue-600" />, color: 'from-blue-500/10 to-blue-600/5', path: '/my-classes' },
        ]
      case 'student':
        return [
          { label: 'View Results', icon: <FileText className="w-6 h-6 text-purple-600" />, color: 'from-purple-500/10 to-purple-600/5', path: '/dashboard' },
          { label: 'Pay Fee', icon: <CreditCard className="w-6 h-6 text-amber-600" />, color: 'from-amber-500/10 to-amber-600/5', path: '/dashboard' },
          { label: 'View Schedule', icon: <Calendar className="w-6 h-6 text-blue-600" />, color: 'from-blue-500/10 to-blue-600/5', path: '/dashboard' },
        ]
      default:
        return []
    }
  }

  const roleLabels = {
    superadmin: 'Platform Overview',
    admin: "School Administrator Dashboard",
    teacher: "Teacher's Portal",
    student: "Student Dashboard"
  }

  const STATS_CARDS = getStatsCards()
  const QUICK_ACTIONS = getQuickActions()

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border p-6">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'User'}! 👋</h1>
        <p className="text-muted-foreground mt-1">
          {userRole === 'superadmin' ? 'Falsfa SaaS' : schoolConfig?.name} — {roleLabels[userRole] || "Here's what's happening today"}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS_CARDS.map((stat, i) => {
            const Icon = stat.icon
            return (
              <Card key={`${stat.title}-${i}`} className="group hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
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
              <Activity className="h-5 w-5 text-primary" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                    <span className="text-lg mt-0.5">{activity.icon || '📌'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{activity.text}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground text-center py-8">
                  <Activity className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                  No recent activities to show
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {QUICK_ACTIONS.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {QUICK_ACTIONS.map((action, i) => (
                  <button 
                    key={`${action.label}-${i}`} 
                    onClick={() => action.path && navigate(action.path)}
                    className={`flex items-center gap-3 rounded-xl bg-gradient-to-br ${action.color} border p-4 text-left hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer`}
                  >
                    <div className="bg-white/50 dark:bg-black/20 p-2 rounded-lg">
                      {action.icon}
                    </div>
                    <span className="text-sm font-medium">{action.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
