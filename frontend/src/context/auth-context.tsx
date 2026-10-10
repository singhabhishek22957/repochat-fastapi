import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { apiFetch, setAccessToken } from "@/lib/api"
import type { TokenResponse, User } from "@/types/api"

type AuthContextValue = {
  user: User | null
  loading: boolean
  login: (identifier: string, password: string) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

type RegisterPayload = {
  name: string
  username: string
  email: string
  password: string
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const me = await apiFetch<User>("/user/me")
    setUser(me)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      setLoading(false)
      return
    }
    refreshUser()
      .catch(() => {
        setAccessToken(null)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [refreshUser])

  const login = useCallback(async (identifier: string, password: string) => {
    const token = await apiFetch<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    })
    setAccessToken(token.access_token)
    await refreshUser()
  }, [refreshUser])

  const register = useCallback(async (payload: RegisterPayload) => {
    await apiFetch<null>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }, [])

  const logout = useCallback(() => {
    setAccessToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshUser }),
    [user, loading, login, register, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return ctx
}
