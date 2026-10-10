import {
  Bot,
  Calendar,
  ExternalLink,
  FolderGit2,
  GitBranch,
  Layers,
  Mail,
  MessageSquare,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { apiFetch } from "@/lib/api"
import { useAuthStore } from "@/stores/auth-store"
import type { Chat, Repository } from "@/types/api"

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  const [repos, setRepos] = useState<Repository[]>([])
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [fetchedRepos, fetchedChats] = await Promise.all([
        apiFetch<Repository[]>("/repositories").catch(() => []),
        apiFetch<Chat[]>("/chats").catch(() => []),
      ])
      setRepos(fetchedRepos || [])
      setChats(fetchedChats || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const indexedCount = repos.filter((r) => r.status === "indexed").length
  const pendingCount = repos.filter((r) => r.status !== "indexed").length

  return (
    <div className="space-y-8">
      {/* Welcome & Profile Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-4 ring-primary/5">
              <UserIcon className="size-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  Welcome back, {user?.name || "Developer"}
                </h1>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold capitalize text-primary">
                  {user?.role || "user"}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>@{user?.username}</span>
                <span className="flex items-center gap-1">
                  <Mail className="size-3.5 text-muted-foreground" />
                  {user?.email}
                </span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="size-3.5" />
                  Authenticated
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadData()}
              disabled={loading}
              className="gap-1.5"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/repositories")}
              className="gap-1.5"
            >
              <Plus className="size-4" />
              Add Repository
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/chat")}
              className="gap-1.5 shadow-sm"
            >
              <MessageSquare className="size-4" />
              Start New Chat
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/80 transition-all hover:border-primary/40 hover:shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Repositories
            </CardTitle>
            <FolderGit2 className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{repos.length}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                {indexedCount} indexed
              </span>
              {pendingCount > 0 && ` • ${pendingCount} pending`}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 transition-all hover:border-primary/40 hover:shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Chats
            </CardTitle>
            <MessageSquare className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chats.length}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Conversations across codebases
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 transition-all hover:border-primary/40 hover:shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Indexed Code Chunks
            </CardTitle>
            <Layers className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {repos.reduce((acc, r) => acc + (r.chunk_count || 0), 0)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Across {repos.reduce((acc, r) => acc + (r.file_count || 0), 0)} files in Qdrant
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 transition-all hover:border-primary/40 hover:shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              RAG Engine
            </CardTitle>
            <Sparkles className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Active
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              LangGraph + FastEmbed + Groq
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout: Recent Chats & Connected Repos */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Chats Section */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Chats</CardTitle>
              <CardDescription>
                Your recent AI repository conversations
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/chat")}
              className="gap-1"
            >
              <Plus className="size-3.5" />
              New Chat
            </Button>
          </CardHeader>
          <CardContent className="flex-1">
            {chats.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-border/80 p-6 text-center">
                <Bot className="size-8 text-muted-foreground/60 mb-2" />
                <p className="text-sm font-medium text-foreground">No chats started yet</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Create a chat to ask questions, analyze architecture, and explore code.
                </p>
                <Button
                  size="sm"
                  className="mt-4"
                  onClick={() => navigate("/chat")}
                >
                  Create your first chat
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {chats.slice(0, 5).map((chat) => {
                  const relatedRepo = repos.find((r) => r.id === chat.repository_id)
                  return (
                    <div
                      key={chat.id}
                      onClick={() => navigate(`/chat/${chat.id}`)}
                      className="group flex cursor-pointer items-center justify-between rounded-xl border border-border/60 bg-card p-3.5 transition-all hover:border-primary/40 hover:bg-accent/40 hover:shadow-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="size-4 text-primary shrink-0" />
                          <h4 className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
                            {chat.name}
                          </h4>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          {relatedRepo ? (
                            <span className="truncate font-mono">
                              {relatedRepo.owner}/{relatedRepo.name}
                            </span>
                          ) : (
                            <span className="font-mono">repo_id: {chat.repository_id.slice(-6)}</span>
                          )}
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {new Date(chat.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Open
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Connected Repositories Section */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Connected Repositories</CardTitle>
              <CardDescription>
                Git codebases cloned and indexed into Qdrant
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/repositories")}
              className="gap-1"
            >
              <GitBranch className="size-3.5" />
              Manage Repos
            </Button>
          </CardHeader>
          <CardContent className="flex-1">
            {repos.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-border/80 p-6 text-center">
                <FolderGit2 className="size-8 text-muted-foreground/60 mb-2" />
                <p className="text-sm font-medium text-foreground">No repositories connected</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Connect a public GitHub repo to start embedding and chatting with code.
                </p>
                <Button
                  size="sm"
                  className="mt-4"
                  onClick={() => navigate("/repositories")}
                >
                  Add a repository
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {repos.slice(0, 5).map((repo) => (
                  <div
                    key={repo.id}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-3.5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="truncate text-sm font-semibold text-foreground">
                          {repo.owner}/{repo.name}
                        </h4>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${
                            repo.status === "indexed"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 animate-pulse"
                          }`}
                        >
                          {repo.status}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span>branch: {repo.branch}</span>
                        <span>{repo.file_count || 0} files</span>
                        <span>{repo.chunk_count || 0} chunks</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/chat?repo=${repo.id}`)}
                        className="gap-1 text-xs"
                      >
                        <MessageSquare className="size-3.5" />
                        Chat
                      </Button>
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <ExternalLink className="size-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
