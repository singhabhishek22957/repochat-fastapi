import {
  AlertCircle,
  ArrowLeft,
  AtSign,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sparkles,
  Terminal,
  User as UserIcon,
} from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ApiError } from "@/lib/api"
import { registerSchema } from "@/schemas/auth"
import { useAuthStore } from "@/stores/auth-store"

export function RegisterPage() {
  const register = useAuthStore((s) => s.register)
  const login = useAuthStore((s) => s.login)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // If already logged in, redirect to dashboard
  if (user) {
    navigate("/dashboard", { replace: true })
  }

  function updateField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Validate using Zod schema
    const parsed = registerSchema.safeParse({
      ...form,
      role: "user",
    })

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Please check your inputs"
      setError(firstError)
      return
    }

    setSubmitting(true)
    try {
      // 1. Register user in backend
      await register(parsed.data)

      // 2. Automatically log user in for instant onboarding
      try {
        await login({
          identifier: parsed.data.email,
          password: parsed.data.password,
        })
        navigate("/dashboard", { replace: true })
      } catch {
        // Fallback to login page if auto-login fails
        navigate("/login", { replace: true })
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12 antialiased selection:bg-primary/20 selection:text-primary overflow-hidden">
      {/* Ambient background glow effects */}
      <div className="pointer-events-none absolute -top-40 right-1/2 translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-indigo-500/20 via-primary/20 to-transparent blur-[140px] opacity-70" />
      <div className="pointer-events-none absolute -bottom-40 left-1/4 w-[500px] h-[400px] bg-gradient-to-br from-primary/15 to-indigo-500/15 blur-[140px] opacity-60" />

      <div className="relative w-full max-w-md space-y-6">
        {/* Back to Home Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to RepoChat</span>
        </Link>

        {/* Register Card */}
        <div className="rounded-3xl border border-border/80 bg-card/90 p-8 shadow-2xl backdrop-blur-xl">
          {/* Brand & Heading */}
          <div className="text-center space-y-2 mb-6">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground shadow-sm shadow-primary/25 transition-transform group-hover:scale-105">
                <Terminal className="size-5" />
              </div>
              <span className="font-extrabold tracking-wider text-xl text-foreground">
                REPOCHAT
              </span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                RAG
              </span>
            </Link>
            <h2 className="text-2xl font-bold tracking-tight text-foreground pt-1">
              Create your account
            </h2>
            <p className="text-xs text-muted-foreground">
              Start chatting with your GitHub codebases using LangGraph RAG
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium">
                Full Name
              </Label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="pl-10 h-10 bg-background/60 text-xs sm:text-sm"
                  required
                />
              </div>
            </div>

            {/* Username */}
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-xs font-medium">
                Username
              </Label>
              <div className="relative">
                <AtSign className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="alexmorgan"
                  value={form.username}
                  onChange={(e) => updateField("username", e.target.value)}
                  className="pl-10 h-10 bg-background/60 text-xs sm:text-sm"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="alex@example.com"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="pl-10 h-10 bg-background/60 text-xs sm:text-sm"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 3 characters"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className="pl-10 pr-10 h-10 bg-background/60 text-xs sm:text-sm"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-10 font-semibold shadow-md shadow-primary/20 gap-2 mt-2"
            >
              {submitting ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating account…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Create Account & Start
                </>
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary hover:underline underline-offset-4"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-[11px] text-muted-foreground text-center">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="size-3 text-emerald-500" />
            Connect Any GitHub Repo
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="size-3 text-emerald-500" />
            Grounded AI with Qdrant
          </span>
        </div>
      </div>
    </div>
  )
}
