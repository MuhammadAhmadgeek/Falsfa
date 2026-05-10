import { useMemo } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useTenant } from '@/context/TenantContext'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, DollarSign, Settings,
  School, CreditCard, BarChart3, ClipboardList, CalendarDays,
  ChevronLeft, ChevronRight, LogOut, FileText,
} from 'lucide-react'

const NAV_ITEMS = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['superadmin', 'schooladmin', 'teacher'] },
  // Super Admin
  { title: 'Schools', href: '/schools', icon: School, roles: ['superadmin'] },
  { title: 'Subscriptions', href: '/subscriptions', icon: CreditCard, roles: ['superadmin'] },
  { title: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['superadmin'] },
  // School Admin
  { title: 'Students', href: '/students', icon: Users, roles: ['schooladmin'] },
  { title: 'Teachers', href: '/teachers', icon: GraduationCap, roles: ['schooladmin'] },
  { title: 'Examinations', href: '/examinations', icon: ClipboardList, roles: ['schooladmin', 'teacher'] },
  { title: 'Finance', href: '/finance', icon: DollarSign, roles: ['schooladmin'] },
  { title: 'Reports', href: '/reports', icon: FileText, roles: ['schooladmin', 'teacher'] },
  // Teacher
  { title: 'My Classes', href: '/my-classes', icon: BookOpen, roles: ['teacher'] },
  { title: 'Attendance', href: '/attendance', icon: CalendarDays, roles: ['teacher'] },
  // Common
  { title: 'Settings', href: '/settings', icon: Settings, roles: ['superadmin', 'schooladmin'] },
]

export default function Sidebar({ collapsed, onToggle }) {
  const { userRole, schoolConfig } = useTenant()
  const { logout } = useAuth()
  const location = useLocation()

  const filteredItems = useMemo(
    () => NAV_ITEMS.filter(item => userRole && item.roles.includes(userRole)),
    [userRole]
  )

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out',
        collapsed ? 'w-17' : 'w-65'
      )}
    >
      {/* Logo / Brand */}
      <div className="flex h-16 items-center gap-3 border-b px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
          {schoolConfig?.name?.charAt(0) || 'F'}
        </div>
        {!collapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-semibold">{schoolConfig?.name || 'Falsfa'}</span>
            <span className="truncate text-xs text-muted-foreground capitalize">{userRole} Panel</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
          const Icon = item.icon

          const linkContent = (
            <Link
              to={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-sidebar-accent text-primary shadow-sm'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5 shrink-0 transition-colors', isActive ? 'text-primary' : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80')} />
              {!collapsed && <span className="truncate">{item.title}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </Link>
          )

          if (collapsed) {
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" className="font-medium">{item.title}</TooltipContent>
              </Tooltip>
            )
          }
          return <div key={item.href}>{linkContent}</div>
        })}
      </nav>

      <Separator />

      {/* Footer */}
      <div className="p-3 space-y-1">
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={logout} className="w-full text-sidebar-foreground/70 hover:text-destructive">
                <LogOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Logout</TooltipContent>
          </Tooltip>
        ) : (
          <Button variant="ghost" onClick={logout} className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-destructive">
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Button>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-md hover:bg-accent transition-colors"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  )
}
