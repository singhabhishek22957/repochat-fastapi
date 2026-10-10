import {
  FolderGit2,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Sparkles,
  Terminal,
} from "lucide-react"
import { Link, NavLink, Outlet, useLocation } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/auth-store"
import { cn } from "@/lib/utils"

export function AppShell() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const location = useLocation()

  const isChatRoute = location.pathname.startsWith("/chat")

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Chat", href: "/chat", icon: MessageSquare },
    { label: "Repositories", href: "/repositories", icon: FolderGit2 },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      {/* ======================================================== */}
      {/* HEADER                                                   */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2.5 font-bold tracking-tight text-lg group">
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground shadow-sm shadow-primary/25 transition-transform group-hover:scale-105">
                <Terminal className="size-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground to-foreground/80">
                  REPOCHAT
                </span>
                <span className="flex items-center gap-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  <Sparkles className="size-2.5" />
                  RAG
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive =
                  item.href === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(item.href)
                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all",
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </NavLink>
                )
              })}
            </nav>
          </div>

          {/* User Controls */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 border-r border-border pr-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground font-semibold text-xs uppercase">
                {user?.name?.slice(0, 2) || "U"}
              </div>
              <div className="text-left leading-tight">
                <p className="text-xs font-semibold truncate max-w-[120px]">{user?.name}</p>
                <p className="text-[11px] text-muted-foreground truncate max-w-[120px]">
                  @{user?.username}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="gap-1.5 text-xs text-muted-foreground hover:text-destructive hover:border-destructive/30"
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden border-t border-border px-4 py-2 gap-1 bg-muted/20 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              item.href === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.href)
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-accent",
                )}
              >
                <Icon className="size-3.5" />
                {item.label}
              </NavLink>
            )
          })}
        </div>
      </header>

      {/* ======================================================== */}
      {/* MAIN CONTENT AREA                                        */}
      {/* ======================================================== */}
      <main className="flex-1">
        <div className={`mx-auto ${isChatRoute ? "max-w-7xl p-3 sm:p-5" : "max-w-6xl px-4 py-6 sm:py-8"}`}>
          <Outlet />
        </div>
      </main>

      {/* ======================================================== */}
      {/* FOOTER                                                   */}
      {/* ======================================================== */}
      <footer className="border-t border-border bg-card/60 backdrop-blur-sm text-xs text-muted-foreground py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-wider text-foreground">REPOCHAT</span>
            <span>•</span>
            <span>Talk to your Git repository with LangGraph RAG</span>
          </div>

          <div className="flex items-center gap-6">
            <span>Powered by FastAPI + LangChain + Qdrant</span>
            <div className="flex items-center gap-1.5 text-foreground/80">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
