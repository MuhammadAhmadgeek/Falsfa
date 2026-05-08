import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ShieldX } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <ShieldX className="h-10 w-10 text-destructive" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Access Denied</h1>
          <p className="mt-2 text-muted-foreground">You don't have permission to view this page.</p>
        </div>
        <Button asChild>
          <Link to="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
