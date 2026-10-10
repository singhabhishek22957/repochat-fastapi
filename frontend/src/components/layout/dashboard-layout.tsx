import { GitBranch, LogOut, MessageSquareCode } from "lucide-react"
import { Link, NavLink, Outlet } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/stores/auth-store"
import { cn } from "@/lib/utils"

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-primary/10 text-primary"
      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
  )

export function DashboardLayout() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <MessageSquareCode className="size-5 text-primary" />
            RepoChat
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-muted-foreground sm:inline">
              {user?.name}
            </span>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-xl border bg-card p-3 shadow-sm">
          <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Workspace
          </p>
          <nav className="flex flex-col gap-1">
            <NavLink to="/" end className={navLinkClass}>
              <GitBranch className="size-4" />
              Repositories
            </NavLink>
          </nav>
          <Separator className="my-3" />
          <p className="px-3 text-xs text-muted-foreground">
            Connect GitHub repos and chat with your codebase once indexing completes.
          </p>
        </aside>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
