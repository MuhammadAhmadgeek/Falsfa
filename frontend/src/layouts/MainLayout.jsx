import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useTenant } from '@/context/TenantContext'
import Sidebar from './Sidebar'
import Header from './Header'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Toaster } from '@/components/ui/sonner'

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { userRole } = useTenant()

  const isSuperAdmin = userRole === 'superadmin'

  return (
    <TooltipProvider>
      <div className={cn('min-h-screen bg-background', isSuperAdmin && 'theme-navy')}>
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-[260px] p-0">
            <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className={cn('flex flex-col transition-all duration-300 ease-in-out', collapsed ? 'lg:pl-[68px]' : 'lg:pl-[260px]')}>
          <Header onMobileMenuToggle={() => setMobileOpen(true)} />
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
        <Toaster />
      </div>
    </TooltipProvider>
  )
}
