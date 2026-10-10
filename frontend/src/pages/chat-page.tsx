import {
  AlertCircle,
  Bot,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileCode2,
  FolderGit2,
  Loader2,
  MessageSquare,
  MessageSquarePlus,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Send,
  Sparkles,
  Trash2,
  User as UserIcon,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"

import { MarkdownRenderer } from "@/components/chat/markdown-renderer"
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
import { useAuthStore } from "@/stores/auth-store"
import type { Chat, Message, Repository } from "@/types/api"

export function ChatPage() {
  const { chatId } = useParams<{ chatId?: string }>()
  const [searchParams] = useSearchParams()
  const preselectedRepoId = searchParams.get("repo")
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  // Sidebar & chats list state
  const [chats, setChats] = useState<Chat[]>([])
  const [repos, setRepos] = useState<Repository[]>([])
  const [loadingChats, setLoadingChats] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Active chat state
  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [inputText, setInputText] = useState("")
  const [sending, setSending] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)

  // New chat form state
  const [newChatName, setNewChatName] = useState("")
  const [newChatDesc, setNewChatDesc] = useState("")
  const [selectedRepoId, setSelectedRepoId] = useState<string>(preselectedRepoId || "")
  const [creatingChat, setCreatingChat] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // Inline "Add Repository" inside dropdown state
  const [showAddRepoInline, setShowAddRepoInline] = useState(false)
  const [inlineRepoUrl, setInlineRepoUrl] = useState("")
  const [addingInlineRepo, setAddingInlineRepo] = useState(false)
  const [inlineRepoError, setInlineRepoError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Load chats and repositories
  const loadSidebarData = useCallback(async () => {
    try {
      setLoadingChats(true)
      const [fetchedChats, fetchedRepos] = await Promise.all([
        apiFetch<Chat[]>("/chats").catch(() => []),
        apiFetch<Repository[]>("/repositories").catch(() => []),
      ])
      setChats(fetchedChats || [])
      setRepos(fetchedRepos || [])
    } finally {
      setLoadingChats(false)
    }
  }, [])

  useEffect(() => {
    void loadSidebarData()
  }, [loadSidebarData])

  // Set preselected repo if passed in URL
  useEffect(() => {
    if (preselectedRepoId) {
      setSelectedRepoId(preselectedRepoId)
    }
  }, [preselectedRepoId])

  // Load active chat and its messages when chatId changes
  useEffect(() => {
    if (!chatId) {
      setActiveChat(null)
      setMessages([])
      return
    }

    const currentChat = chats.find((c) => c.id === chatId)
    if (currentChat) {
      setActiveChat(currentChat)
    } else {
      // Fetch single chat if not found in sidebar list
      apiFetch<Chat>(`/chats/${chatId}`)
        .then((c) => setActiveChat(c))
        .catch(() => setActiveChat(null))
    }

    // Fetch messages for this chat
    setLoadingMessages(true)
    setChatError(null)
    apiFetch<Message[]>(`/chats/${chatId}/messages`)
      .then((msgs) => {
        setMessages(msgs || [])
        setTimeout(scrollToBottom, 100)
      })
      .catch((err) => {
        setChatError(err instanceof ApiError ? err.message : "Failed to load messages")
      })
      .finally(() => {
        setLoadingMessages(false)
      })
  }, [chatId, chats])

  // Handle Send Message
  async function handleSendMessage(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!inputText.trim() || !chatId || sending) return

    const content = inputText.trim()
    setInputText("")
    setChatError(null)
    setSending(true)

    // Optimistically append user message
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      chat_id: chatId,
      user_id: user?.id || "user",
      role: "user",
      content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempUserMsg])
    setTimeout(scrollToBottom, 50)

    try {
      const assistantMsg = await apiFetch<Message>(`/chats/${chatId}/messages`, {
        method: "POST",
        body: JSON.stringify({ content }),
      })
      setMessages((prev) => [...prev, assistantMsg])
      setTimeout(scrollToBottom, 100)
    } catch (err) {
      setChatError(err instanceof ApiError ? err.message : "Failed to get AI response")
    } finally {
      setSending(false)
    }
  }

  // Handle Create New Chat
  async function handleCreateChat(e: React.FormEvent) {
    e.preventDefault()
    setCreateError(null)

    if (!selectedRepoId) {
      setCreateError("Please select a repository for this chat.")
      return
    }
    if (!newChatName.trim()) {
      setCreateError("Please enter a chat name.")
      return
    }

    setCreatingChat(true)
    try {
      const createdChat = await apiFetch<Chat>("/chats", {
        method: "POST",
        body: JSON.stringify({
          name: newChatName.trim(),
          description: newChatDesc.trim() || undefined,
          repository_id: selectedRepoId,
        }),
      })

      setChats((prev) => [createdChat, ...prev])
      setNewChatName("")
      setNewChatDesc("")
      navigate(`/chat/${createdChat.id}`)
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : "Failed to create chat")
    } finally {
      setCreatingChat(false)
    }
  }

  // Handle Inline Add Repository inside dropdown
  async function handleAddInlineRepo(e: React.FormEvent) {
    e.preventDefault()
    setInlineRepoError(null)
    if (!inlineRepoUrl.trim()) return

    setAddingInlineRepo(true)
    try {
      const newRepo = await apiFetch<Repository>(
        `/repositories?repo_url=${encodeURIComponent(inlineRepoUrl.trim())}`,
        { method: "POST" },
      )
      setRepos((prev) => [newRepo, ...prev])
      setSelectedRepoId(newRepo.id)
      setInlineRepoUrl("")
      setShowAddRepoInline(false)
    } catch (err) {
      setInlineRepoError(err instanceof ApiError ? err.message : "Failed to add repository")
    } finally {
      setAddingInlineRepo(false)
    }
  }

  // Handle Delete Chat
  async function handleDeleteChat(cId: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this chat and its messages?")) return

    try {
      await apiFetch<null>(`/chats/${cId}`, { method: "DELETE" })
      setChats((prev) => prev.filter((c) => c.id !== cId))
      if (chatId === cId) {
        navigate("/chat")
      }
    } catch {
      alert("Failed to delete chat")
    }
  }

  const activeRepo = repos.find((r) => r.id === activeChat?.repository_id)

  return (
    <div className="flex h-[calc(100vh-8.5rem)] overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* ChatGPT-style Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-72" : "w-0 -ml-72 md:ml-0 md:w-16"
        } transition-all duration-200 flex flex-col border-r border-border bg-muted/20 shrink-0 overflow-hidden`}
      >
        <div className="flex items-center justify-between p-3 border-b border-border/80">
          <Button
            onClick={() => navigate("/chat")}
            size="sm"
            className="flex-1 gap-2 shadow-sm"
          >
            <MessageSquarePlus className="size-4" />
            <span className={!sidebarOpen ? "hidden md:inline" : ""}>New Chat</span>
          </Button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-2 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="size-4" />
            ) : (
              <PanelLeftOpen className="size-4" />
            )}
          </button>
        </div>

        {/* Chats List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingChats ? (
            <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
              <Loader2 className="size-4 animate-spin mr-2" />
              Loading chats…
            </div>
          ) : chats.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">
              No chat history yet.
            </div>
          ) : (
            chats.map((c) => {
              const isSelected = c.id === chatId
              const repo = repos.find((r) => r.id === c.repository_id)
              return (
                <div
                  key={c.id}
                  onClick={() => navigate(`/chat/${c.id}`)}
                  className={`group relative flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-colors ${
                    isSelected
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <MessageSquare className="size-3.5 shrink-0" />
                      <span className="truncate">{c.name}</span>
                    </div>
                    {repo && (
                      <span className="mt-0.5 block truncate text-[10px] text-muted-foreground/80 font-mono">
                        {repo.name}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => void handleDeleteChat(c.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-opacity"
                    title="Delete chat"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              )
            })
          )}
        </div>
      </aside>

      {/* Main Chat Interface */}
      <main className="flex flex-1 flex-col overflow-hidden bg-background">
        {!chatId ? (
          /* ======================================================== */
          /* New Chat Creation Screen                                 */
          /* ======================================================== */
          <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto p-4 sm:p-8">
            <div className="w-full max-w-xl space-y-6">
              <div className="text-center space-y-2">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-4 ring-primary/5">
                  <Bot className="size-7" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">RepoChat Assistant</h2>
                <p className="text-sm text-muted-foreground">
                  Select an indexed repository and start an intelligent code conversation powered by LangGraph RAG.
                </p>
              </div>

              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Start New Chat</CardTitle>
                  <CardDescription>
                    Configure the repository context and topic.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateChat} className="space-y-4">
                    {createError && (
                      <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                        <AlertCircle className="size-4 shrink-0" />
                        <span>{createError}</span>
                      </div>
                    )}

                    {/* Repository Dropdown with inline "+ Add New Repository" */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="repo-select">Target Repository</Label>
                        <button
                          type="button"
                          onClick={() => setShowAddRepoInline(!showAddRepoInline)}
                          className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                        >
                          <Plus className="size-3" />
                          {showAddRepoInline ? "Cancel new repo" : "Add new repo"}
                        </button>
                      </div>

                      {showAddRepoInline ? (
                        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 space-y-2.5">
                          <p className="text-xs font-medium text-foreground">
                            Connect public GitHub Repository:
                          </p>
                          <div className="flex gap-2">
                            <Input
                              placeholder="https://github.com/owner/repository"
                              value={inlineRepoUrl}
                              onChange={(e) => setInlineRepoUrl(e.target.value)}
                              className="text-xs h-9 bg-background"
                            />
                            <Button
                              type="button"
                              size="sm"
                              disabled={addingInlineRepo || !inlineRepoUrl.trim()}
                              onClick={handleAddInlineRepo}
                              className="h-9 gap-1"
                            >
                              {addingInlineRepo ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <FolderGit2 className="size-3.5" />
                              )}
                              Add
                            </Button>
                          </div>
                          {inlineRepoError && (
                            <p className="text-[11px] text-destructive">{inlineRepoError}</p>
                          )}
                        </div>
                      ) : (
                        <select
                          id="repo-select"
                          value={selectedRepoId}
                          onChange={(e) => {
                            if (e.target.value === "ADD_NEW") {
                              setShowAddRepoInline(true)
                            } else {
                              setSelectedRepoId(e.target.value)
                            }
                          }}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          required
                        >
                          <option value="">-- Choose a repository --</option>
                          {repos.map((r) => (
                            <option key={r.id} value={r.id}>
                              [{r.status.toUpperCase()}] {r.owner}/{r.name} ({r.branch})
                            </option>
                          ))}
                          <option value="ADD_NEW">➕ + Add / Connect New Repository...</option>
                        </select>
                      )}
                    </div>

                    {/* Chat Name */}
                    <div className="space-y-2">
                      <Label htmlFor="chat-name">Chat Name</Label>
                      <Input
                        id="chat-name"
                        placeholder="e.g. Architecture Overview, API Flow Review"
                        value={newChatName}
                        onChange={(e) => setNewChatName(e.target.value)}
                        required
                      />
                    </div>

                    {/* Chat Description */}
                    <div className="space-y-2">
                      <Label htmlFor="chat-desc">Description (Optional)</Label>
                      <Input
                        id="chat-desc"
                        placeholder="e.g. Exploring authentication middleware and database models"
                        value={newChatDesc}
                        onChange={(e) => setNewChatDesc(e.target.value)}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={creatingChat}
                      className="w-full gap-2 mt-2"
                    >
                      {creatingChat ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Creating chat…
                        </>
                      ) : (
                        <>
                          <MessageSquare className="size-4" />
                          Create & Start Chatting
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Starter Suggestions */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">
                  Recommended Discussion Prompts
                </p>
                <div className="grid gap-2 sm:grid-cols-2 text-left">
                  {[
                    "Explain the overall repository architecture and how modules connect.",
                    "What are the pros and cons of the tech stack and patterns used?",
                    "How does authentication and authorization work in this codebase?",
                    "Where are key API controllers and database models defined?",
                  ].map((prompt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setNewChatName(prompt.slice(0, 40) + "…")
                        setNewChatDesc(prompt)
                      }}
                      className="rounded-xl border border-border/70 bg-card p-3 text-xs text-muted-foreground transition-all hover:border-primary/40 hover:bg-accent/40 hover:text-foreground text-left"
                    >
                      💡 {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* Active Chat Screen (ChatGPT Style)                       */
          /* ======================================================== */
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-card/60 backdrop-blur-sm">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Bot className="size-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-sm text-foreground">
                    {activeChat?.name || "Chat"}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {activeRepo ? (
                      <a
                        href={activeRepo.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-mono hover:text-foreground"
                      >
                        {activeRepo.owner}/{activeRepo.name}
                        <ExternalLink className="size-2.5" />
                      </a>
                    ) : (
                      <span>Repository ID: {activeChat?.repository_id.slice(-6)}</span>
                    )}
                    <span>•</span>
                    <span className="capitalize">{activeRepo?.status || "ready"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/chat")}
                  className="gap-1 text-xs"
                >
                  <Plus className="size-3.5" />
                  New Chat
                </Button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {loadingMessages ? (
                <div className="flex h-48 flex-col items-center justify-center text-sm text-muted-foreground">
                  <Loader2 className="size-6 animate-spin mb-2 text-primary" />
                  Loading conversation history…
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center text-center text-muted-foreground">
                  <Sparkles className="size-8 text-primary/60 mb-2" />
                  <p className="text-sm font-medium text-foreground">
                    Start asking questions about this repository
                  </p>
                  <p className="text-xs text-muted-foreground max-w-sm mt-1">
                    Ask about specific functions, architecture, pros/cons, or suggest improvements.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.role === "user"
                  const timeFormatted = new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3.5 ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      {!isUser && (
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-2 ring-primary/5 mt-0.5">
                          <Bot className="size-4" />
                        </div>
                      )}

                      <div
                        className={`max-w-3xl rounded-2xl px-4 py-3 shadow-sm ${
                          isUser
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-card border border-border/80 rounded-tl-sm text-foreground"
                        }`}
                      >
                        {/* Role Header & Timestamp */}
                        <div
                          className={`mb-1.5 flex items-center justify-between gap-3 text-[11px] ${
                            isUser ? "text-primary-foreground/80" : "text-muted-foreground"
                          }`}
                        >
                          <span className="font-semibold capitalize">
                            {isUser ? user?.name || "You" : "RepoChat AI"}
                          </span>
                          <span>{timeFormatted}</span>
                        </div>

                        {/* Message Content */}
                        {isUser ? (
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">
                            {msg.content}
                          </p>
                        ) : (
                          <div className="space-y-3">
                            <MarkdownRenderer content={msg.content} />

                            {/* Source Citations Accordion */}
                            {msg.sources && msg.sources.length > 0 && (
                              <SourcesCitation sources={msg.sources} />
                            )}
                          </div>
                        )}
                      </div>

                      {isUser && (
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground mt-0.5">
                          <UserIcon className="size-4" />
                        </div>
                      )}
                    </div>
                  )
                })
              )}

              {/* Sending / Thinking State */}
              {sending && (
                <div className="flex gap-3.5 justify-start">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-2 ring-primary/5 mt-0.5">
                    <Bot className="size-4 animate-pulse" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm border border-border/80 bg-card px-4 py-3 shadow-sm text-foreground">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="size-3.5 animate-spin text-primary" />
                      <span>RepoChat AI is retrieving code chunks & analyzing...</span>
                    </div>
                  </div>
                </div>
              )}

              {chatError && (
                <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{chatError}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input Area (ChatGPT style) */}
            <div className="border-t border-border bg-card/60 p-3 sm:p-4 backdrop-blur-sm">
              <form onSubmit={handleSendMessage} className="mx-auto max-w-3xl">
                <div className="relative flex items-center rounded-2xl border border-border bg-background shadow-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
                  <textarea
                    rows={1}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        void handleSendMessage()
                      }
                    }}
                    placeholder={`Ask RepoChat about ${activeRepo?.name || "this repository"}… (Press Enter to send)`}
                    className="flex-1 resize-none bg-transparent px-4 py-3 text-sm focus:outline-none max-h-32 leading-relaxed"
                    disabled={sending}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!inputText.trim() || sending}
                    className="mr-2 size-8 rounded-xl shrink-0 transition-transform active:scale-95"
                  >
                    {sending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                  </Button>
                </div>
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  RepoChat LangGraph RAG indexes and grounds responses in repository files.
                </p>
              </form>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function SourcesCitation({ sources }: { sources: Array<{ file_path?: string; chunk_index?: number; score?: number }> }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="mt-3 border-t border-border/50 pt-2 text-xs">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-medium transition-colors"
      >
        <FileCode2 className="size-3.5 text-primary" />
        <span>Sources ({sources.length} repository chunks cited)</span>
        {expanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
      </button>

      {expanded && (
        <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {sources.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1.5 font-mono text-[11px]"
            >
              <span className="truncate text-foreground/90" title={s.file_path}>
                {s.file_path || "chunk"}
              </span>
              <span className="ml-2 text-muted-foreground shrink-0">
                {s.score ? `Score: ${s.score}` : `Chunk ${s.chunk_index ?? idx}`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
