import {
  ExternalLink,
  FolderGit2,
  GitBranch,
  Loader2,
  MessageSquare,
  Plus,
  RefreshCw,
  Trash2,
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiFetch, ApiError } from "@/lib/api"
import { cn } from "@/lib/utils"
import type { Repository } from "@/types/api"

function statusClass(status: string) {
  switch (status) {
    case "indexed":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
    case "pending":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400 animate-pulse"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function RepositoriesPage() {
  const navigate = useNavigate()
  const [repoUrl, setRepoUrl] = useState("")
  const [repos, setRepos] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const loadRepos = useCallback(async () => {
    try {
      setLoading(true)
      const data = await apiFetch<Repository[]>("/repositories")
      setRepos(data || [])
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load repositories")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadRepos()
  }, [loadRepos])

  // Polling for pending repos until indexed
  useEffect(() => {
    const hasPending = repos.some((r) => r.status !== "indexed")
    if (!hasPending) return
    const timer = window.setInterval(() => {
      void loadRepos()
    }, 4000)
    return () => window.clearInterval(timer)
  }, [repos, loadRepos])

  async function addRepository(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await apiFetch<Repository>(
        `/repositories?repo_url=${encodeURIComponent(repoUrl.trim())}`,
        { method: "POST" },
      )
      setRepoUrl("")
      await loadRepos()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add repository")
    } finally {
      setSubmitting(false)
    }
  }

  async function removeRepository(id: string) {
    if (!confirm("Are you sure you want to remove this repository from RepoChat?")) return
    setError(null)
    try {
      await apiFetch<null>(`/repositories/${id}`, { method: "DELETE" })
      setRepos((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete repository")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Connected Repositories</h1>
        <p className="text-muted-foreground text-sm">
          Connect public GitHub repositories. The background worker clones files, chunks code, and generates FastEmbed vectors in Qdrant for RAG chat.
        </p>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Connect GitHub Repository</CardTitle>
          <CardDescription>
            Enter the repository URL (e.g., https://github.com/fastapi/fastapi)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={addRepository} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="repo-url">Repository URL</Label>
              <Input
                id="repo-url"
                placeholder="https://github.com/owner/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={submitting || !repoUrl.trim()} className="gap-2">
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              Add Repository
            </Button>
          </form>
          {error ? (
            <p className="mt-3 text-sm text-destructive">{error}</p>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your Repositories ({repos.length})</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void loadRepos()}
          disabled={loading}
          className="gap-1.5"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {loading && repos.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin mr-2 text-primary" />
          Loading repositories…
        </div>
      ) : repos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            <FolderGit2 className="size-10 text-muted-foreground/60 mx-auto mb-3" />
            <p className="font-medium text-foreground">No repositories connected yet.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Add your first GitHub repository above to start indexing and chatting.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {repos.map((repo) => (
            <Card key={repo.id} className="transition-all hover:border-primary/40 hover:shadow-sm">
              <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
                <div className="space-y-1">
                  <CardTitle className="text-base font-bold">
                    {repo.owner}/{repo.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 hover:text-foreground font-mono text-xs"
                    >
                      {repo.url}
                      <ExternalLink className="size-3" />
                    </a>
                  </CardDescription>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
                    statusClass(repo.status),
                  )}
                >
                  {repo.status}
                </span>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 text-sm pt-0">
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-mono">
                    <GitBranch className="size-3 text-muted-foreground" />
                    {repo.branch}
                  </span>
                  <span>Files: {repo.file_count || 0}</span>
                  <span>Chunks: {repo.chunk_count || 0}</span>
                  {repo.last_synced_at && (
                    <span>Synced: {new Date(repo.last_synced_at).toLocaleDateString()}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/chat?repo=${repo.id}`)}
                    className="gap-1.5 text-xs"
                  >
                    <MessageSquare className="size-3.5" />
                    Start Chat
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void removeRepository(repo.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
