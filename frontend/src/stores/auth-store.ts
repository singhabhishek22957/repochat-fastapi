import { create } from "zustand"

import { apiFetch, setAccessToken } from "@/lib/api"
import type { LoginInput, RegisterInput } from "@/schemas/auth"
import type { TokenResponse, User } from "@/types/api"

type AuthState = {
  user: User | null
  loading: boolean
  initialized: boolean
  initialize: () => Promise<void>
  refreshUser: () => Promise<void>
  login: (payload: LoginInput) => Promise<void>
  register: (payload: RegisterInput) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,

  refreshUser: async () => {
    const me = await apiFetch<User>("/user/me")
    set({ user: me })
  },

  initialize: async () => {
    if (get().initialized) return

    const token = localStorage.getItem("access_token")
    if (!token) {
      set({ loading: false, initialized: true, user: null })
      return
    }

    try {
      await get().refreshUser()
    } catch {
      setAccessToken(null)
      set({ user: null })
    } finally {
      set({ loading: false, initialized: true })
    }
  },

  login: async (payload) => {
    const token = await apiFetch<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    })
    setAccessToken(token.access_token)
    await get().refreshUser()
  },

  register: async (payload) => {
    await apiFetch<null>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  logout: () => {
    void apiFetch<null>("/auth/logout", { method: "POST" }).catch(() => {})
    setAccessToken(null)
    set({ user: null })
  },
}))

// Auto-initialize auth state from stored token
void useAuthStore.getState().initialize()
