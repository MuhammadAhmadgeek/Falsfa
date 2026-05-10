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

  return (
    <TooltipProvider>
      <div className={cn('min-h-screen bg-background')}>
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-65 p-0">
            <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className={cn('flex flex-col transition-all duration-300 ease-in-out', collapsed ? 'lg:pl-17' : 'lg:pl-65')}>
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
