import {
  ArrowRight,
  BookOpen,
  Bot,
  CheckCircle2,
  Code2,
  Cpu,
  FileCode2,
  FolderGit2,
  GitBranch,
  GraduationCap,
  Layers,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/auth-store"

export function HomePage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* ======================================================== */}
      {/* PUBLIC NAVBAR                                            */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 font-bold tracking-tight text-lg group">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground shadow-sm shadow-primary/25 transition-transform group-hover:scale-105">
              <Terminal className="size-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-wider">REPOCHAT</span>
              <span className="flex items-center gap-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                <Sparkles className="size-2.5" />
                RAG
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#for-students" className="hover:text-foreground transition-colors">
              For Students
            </a>
            <a href="#for-developers" className="hover:text-foreground transition-colors">
              For Developers
            </a>
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Button asChild size="sm" className="gap-2 shadow-sm">
                <Link to="/dashboard">
                  <span>Go to Dashboard</span>
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="text-sm">
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button asChild size="sm" className="gap-1.5 shadow-sm">
                  <Link to="/register">
                    <span>Get Started</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* HERO SECTION                                             */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32">
        {/* Glow ambient background */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30 dark:opacity-20">
          <div className="h-[400px] w-[600px] rounded-full bg-gradient-to-tr from-primary/50 to-indigo-500/40 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-6">
            <Sparkles className="size-3.5 text-primary" />
            <span>State-of-the-Art Codebase Intelligence powered by LangGraph RAG</span>
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
            Talk to Any <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500">Git Repository</span> in Seconds.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl leading-relaxed">
            Connect any public GitHub codebase. RepoChat clones, chunks, and semantically indexes the code into Qdrant so you can ask architectural questions, understand complex features, and analyze pros & cons with cited evidence.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="h-12 px-6 gap-2 text-base shadow-lg shadow-primary/20">
              <Link to="/register">
                <span>Start Free — Connect a Repo</span>
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-6 text-base">
              <Link to="/login">Sign in to Existing Chat</Link>
            </Button>
          </div>

          {/* Social Proof Badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-500" />
              Zero Hallucinations (Citations Grounded in Code)
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-500" />
              FastEmbed 384D Vector Search
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-500" />
              LangChain & LangGraph Workflows
            </span>
          </div>

          {/* Interactive UI Mockup Preview */}
          <div className="mt-14 mx-auto max-w-5xl rounded-2xl border border-border bg-card/80 p-2 shadow-2xl backdrop-blur-sm sm:p-4 text-left">
            <div className="flex items-center justify-between border-b border-border/80 px-4 py-3 bg-muted/30 rounded-t-xl text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-red-500/80 inline-block" />
                <span className="size-3 rounded-full bg-yellow-500/80 inline-block" />
                <span className="size-3 rounded-full bg-green-500/80 inline-block" />
                <span className="ml-2 font-mono font-medium text-foreground">
                  RepoChat • fast-food-donation / architecture-review
                </span>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                ● Qdrant Indexed
              </span>
            </div>

            <div className="p-4 sm:p-6 space-y-4 font-sans text-sm">
              {/* User Question Bubble */}
              <div className="flex justify-end">
                <div className="max-w-2xl rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-primary-foreground text-xs sm:text-sm">
                  <p className="font-semibold text-[11px] text-primary-foreground/80 mb-1">Developer Question</p>
                  How does user authentication work across this codebase, and what are the architectural pros and cons of the current approach?
                </div>
              </div>

              {/* AI Answer Bubble */}
              <div className="flex justify-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary mt-1">
                  <Bot className="size-4" />
                </div>
                <div className="max-w-3xl rounded-2xl rounded-tl-sm border border-border bg-card p-4 text-xs sm:text-sm space-y-2.5 text-foreground">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="font-semibold text-primary">RepoChat AI Assistant</span>
                    <span>openai/gpt-oss-120b</span>
                  </div>
                  <p className="leading-relaxed">
                    Based on the indexed files in <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">app/middlewares/auth.py</code> and <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">app/controllers/auth.py</code>, authentication is implemented using <strong>JWT bearer tokens and password hashing via Argon2</strong>:
                  </p>
                  <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-1.5 font-mono text-xs">
                    <p className="text-emerald-600 dark:text-emerald-400 font-semibold font-sans">✓ Key Strengths (Pros):</p>
                    <p className="text-muted-foreground">• Stateless token verification with dual cookie & Authorization header support.</p>
                    <p className="text-muted-foreground">• Modern Argon2id algorithm offering strong brute-force resistance.</p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-border/60 text-[11px] text-muted-foreground font-mono">
                    <FileCode2 className="size-3.5 text-primary" />
                    <span>Cited: backend/app/middlewares/auth.py (Chunk 2, Score: 0.89)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* HOW IT WORKS SECTION                                     */}
      {/* ======================================================== */}
      <section id="how-it-works" className="border-t border-border bg-muted/20 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-bold tracking-widest uppercase text-primary">
              Step-by-Step Pipeline
            </h2>
            <h3 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              How RepoChat Works
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              From raw GitHub URL to deep architectural conversation in four automated steps.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "01",
                icon: FolderGit2,
                title: "Connect Repository",
                desc: "Paste any public GitHub repository URL. RepoChat fetches branches, commits, and tree structure.",
              },
              {
                step: "02",
                icon: Layers,
                title: "Chunk & Embed",
                desc: "Code files are split by class and function boundaries, then converted into dense 384D vectors via FastEmbed.",
              },
              {
                step: "03",
                icon: Cpu,
                title: "LangGraph RAG",
                desc: "Every question triggers a stateful LangGraph workflow querying Qdrant with repository-level filters.",
              },
              {
                step: "04",
                icon: MessageSquare,
                title: "Architectural Answers",
                desc: "Get markdown-formatted answers with file citations, pros/cons analysis, and copyable code snippets.",
              },
            ].map((item, idx) => {
              const Icon = item.icon
              return (
                <div
                  key={idx}
                  className="relative rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <span className="font-mono text-2xl font-black text-muted-foreground/30">
                      {item.step}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-foreground mb-2">{item.title}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* WHO IS IT FOR: STUDENTS & DEVELOPERS                     */}
      {/* ======================================================== */}
      <section id="for-students" className="py-20 md:py-28 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <h2 className="text-xs font-bold tracking-widest uppercase text-primary">
              Built For You
            </h2>
            <h3 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Why Students & Developers Love RepoChat
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Whether you are learning a framework for the first time or onboarding onto a 50,000-line production system.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* CARD: For Students */}
            <div className="rounded-3xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-8 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <GraduationCap className="size-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold">For Students & Learners</h4>
                    <p className="text-xs text-muted-foreground">Learn from real-world open source projects</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      title: "Deconstruct Real-World Codebases",
                      desc: "Stop reading toy examples. Understand how actual production apps organize routing, middleware, database relations, and error handling.",
                    },
                    {
                      title: "Interview & Exam Preparation",
                      desc: "Ask the AI to explain design patterns, OOP principles, or architectural decisions used in top GitHub repositories.",
                    },
                    {
                      title: "Instant Code Explanations Without Jargon",
                      desc: "Ask 'Explain line 45 like I'm a beginner' or 'Why did the author use Redis here instead of Mongo?' and receive clear, patient explanations.",
                    },
                    {
                      title: "Learn Best Coding Practices",
                      desc: "Compare your project structure with popular repositories and get recommendations on how to level up your code quality.",
                    },
                  ].map((feat, i) => (
                    <div key={i} className="flex gap-3">
                      <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-sm font-semibold text-foreground">{feat.title}</h5>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                <Button asChild className="w-full gap-2">
                  <Link to="/register">
                    <span>Start Learning Free</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* CARD: For Developers */}
            <div id="for-developers" className="rounded-3xl border border-border bg-gradient-to-br from-card via-card to-indigo-500/5 p-8 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
                    <Code2 className="size-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold">For Engineers & Developers</h4>
                    <p className="text-xs text-muted-foreground">Slash onboarding time and review architectures</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      title: "10x Faster Team Onboarding",
                      desc: "Understand new microservices, dependencies, and business logic in 15 minutes instead of spending weeks reading through PRs.",
                    },
                    {
                      title: "Architectural Pros & Cons Evaluation",
                      desc: "Ask RepoChat to audit trade-offs: 'What are the bottlenecks of this async task worker?' or 'How is caching handled in Redis?'",
                    },
                    {
                      title: "Exact File Citations (No Hallucinations)",
                      desc: "Every AI response cites specific file paths and chunk relevance scores from Qdrant, so you can immediately inspect the source code.",
                    },
                    {
                      title: "Effortless Refactoring Suggestions",
                      desc: "Explore how to migrate from monolithic files to clean architecture, improve typing, or add background task handling.",
                    },
                  ].map((feat, i) => (
                    <div key={i} className="flex gap-3">
                      <CheckCircle2 className="size-5 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-sm font-semibold text-foreground">{feat.title}</h5>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                <Button asChild variant="outline" className="w-full gap-2 border-indigo-500/30 hover:border-indigo-500">
                  <Link to="/register">
                    <span>Connect Your First Repository</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* KEY FEATURES SECTION                                     */}
      {/* ======================================================== */}
      <section id="features" className="border-t border-border bg-muted/20 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <h2 className="text-xs font-bold tracking-widest uppercase text-primary">
              Core Capabilities
            </h2>
            <h3 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Engineered for Code Accuracy
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Built on production-grade asynchronous services and modern vector retrieval.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Zap,
                title: "LangGraph StateGraph",
                desc: "Stateful retrieval-augmented generation workflow ensuring queries are validated, retrieved, and generated with graph reliability.",
              },
              {
                icon: GitBranch,
                title: "Multi-Repo Management",
                desc: "Track and chat with multiple GitHub repositories simultaneously. Switch contexts seamlessly from the ChatGPT-style sidebar.",
              },
              {
                icon: ShieldCheck,
                title: "Strict Authentication",
                desc: "JWT-secured sessions with Argon2-protected credentials and private MongoDB conversation histories.",
              },
              {
                icon: BookOpen,
                title: "Full Markdown Code View",
                desc: "Syntax-highlighted code blocks with 1-click 'Copy Code' buttons, tables, and formatted lists in response streams.",
              },
              {
                icon: Cpu,
                title: "FastEmbed 384D Embeddings",
                desc: "Lightweight, lightning-fast text and code chunk embeddings running in-memory without external embedding API bottlenecks.",
              },
              {
                icon: Bot,
                title: "OpenAI GPT-OSS / Groq LLMs",
                desc: "High-throughput, ultra-low latency response generation designed for software development and architecture reviews.",
              },
            ].map((feat, i) => {
              const Icon = feat.icon
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-sm"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                    <Icon className="size-5" />
                  </div>
                  <h4 className="text-base font-bold text-foreground mb-1.5">{feat.title}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* CALL TO ACTION BANNER                                    */}
      {/* ======================================================== */}
      <section className="border-t border-border py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-primary/10 p-8 sm:p-14 text-center shadow-lg">
            <h3 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Ready to Understand Your Codebase Like Never Before?
            </h3>
            <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-muted-foreground leading-relaxed">
              Join students and developers using RepoChat to accelerate code reading, master open-source projects, and build better software.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg" className="h-12 px-8 gap-2 shadow-md">
                <Link to="/register">
                  <span>Get Started for Free</span>
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* PUBLIC FOOTER                                            */}
      {/* ======================================================== */}
      <footer className="border-t border-border bg-card/60 py-10 text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-wider text-foreground">REPOCHAT</span>
            <span>•</span>
            <span>AI-Powered Git Repository Conversation Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-foreground transition-colors">Sign in</Link>
            <Link to="/register" className="hover:text-foreground transition-colors">Register</Link>
            <span>FastAPI • LangGraph • Qdrant</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
