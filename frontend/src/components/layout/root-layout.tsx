import { useEffect } from "react"
import { Outlet } from "react-router-dom"

import { useAuthStore } from "@/stores/auth-store"

export function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    void initialize()
  }, [initialize])

  return <Outlet />
}
