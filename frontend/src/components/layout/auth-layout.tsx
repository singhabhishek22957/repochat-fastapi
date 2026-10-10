import { MessageSquareCode } from "lucide-react"
import { Link, Outlet } from "react-router-dom"

export function AuthLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="border-b px-4 py-4">
        <Link
          to="/login"
          className="mx-auto flex w-full max-w-md items-center gap-2 font-semibold tracking-tight"
        >
          <MessageSquareCode className="size-5 text-primary" />
          RepoChat
        </Link>
      </header>
      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
