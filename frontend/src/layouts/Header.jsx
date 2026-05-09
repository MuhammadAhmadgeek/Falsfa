import { useAuth } from '@/context/AuthContext'
import { useTenant } from '@/context/TenantContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, Search, Menu, UserCircle, Settings, LogOut, CheckCheck } from 'lucide-react'
import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Link } from 'react-router-dom'

const ROLE_COLORS = {
  superadmin: 'destructive',
  schooladmin: 'default',
  teacher: 'secondary',
  student: 'outline',
}

const ROLE_LABELS = {
  superadmin: 'Super Admin',
  schooladmin: 'School Admin',
  teacher: 'Teacher',
  student: 'Student',
}

export default function Header({ onMobileMenuToggle }) {
  const { user, logout, switchRole } = useAuth()
  const { userRole } = useTenant()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'

  const fetchNotifications = async () => {
    try {
      const [countRes, listRes] = await Promise.all([
        api.get('/notifications/count'),
        api.get('/notifications')
      ])
      if (countRes.data.success) setUnreadCount(countRes.data.data.count)
      if (listRes.data.success) setNotifications(listRes.data.data)
    } catch (err) {
      console.error('Failed to fetch notifications', err)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Optional: Set up interval for polling here if needed
  }, [])

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all')
      fetchNotifications()
    } catch (err) {
      console.error(err)
    }
  }

  const markOneRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      fetchNotifications()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMobileMenuToggle}>
        <Menu className="h-5 w-5" />
      </Button>

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search..." className="pl-9 bg-muted/50 border-0 focus-visible:ring-1" />
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Role Switcher (Demo) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
              <Badge variant={ROLE_COLORS[userRole]} className="text-[10px] px-1.5">
                {ROLE_LABELS[userRole]}
              </Badge>
              Switch Role
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Demo Role Switcher</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.keys(ROLE_LABELS).map(role => (
              <DropdownMenuItem key={role} onClick={() => switchRole(role)} className="cursor-pointer">
                {ROLE_LABELS[role]}
                {role === userRole && <span className="ml-auto text-primary">✓</span>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between px-2 py-1.5">
              <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllRead} className="h-auto p-1 text-xs hove:bg-transparent text-primary">
                  <CheckCheck className="mr-1 h-3 w-3" /> Mark all read
                </Button>
              )}
            </div>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No notifications
              </div>
            ) : (
              notifications.map((notif) => (
                <DropdownMenuItem 
                  key={notif._id} 
                  className={`flex flex-col items-start p-3 gap-1 cursor-pointer border-b last:border-0 ${!notif.isRead ? 'bg-primary/5' : ''}`}
                  onClick={() => !notif.isRead && markOneRead(notif._id)}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium text-sm">{notif.title}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground line-clamp-2 leading-snug">
                    {notif.message}
                  </span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden md:block text-sm font-medium">{user?.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">{user?.name}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link to="/profile">
                <UserCircle className="mr-2 h-4 w-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link to="/settings">
                <Settings className="mr-2 h-4 w-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
