import { Check, Copy } from "lucide-react"
import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

type CodeBlockProps = {
  className?: string
  children?: React.ReactNode
}

function CodeBlock({ className, children, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const match = /language-(\w+)/.exec(className || "")
  const language = match ? match[1] : ""
  const codeContent = String(children).replace(/\n$/, "")

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(codeContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  // Inline code check
  const isInline = !match && !codeContent.includes("\n")
  if (isInline) {
    return (
      <code
        className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold text-foreground"
        {...props}
      >
        {children}
      </code>
    )
  }

  return (
    <div className="group relative my-3 overflow-hidden rounded-lg border border-border bg-zinc-950 text-zinc-50 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-400">
        <span className="font-mono uppercase tracking-wider">{language || "code"}</span>
        <button
          onClick={handleCopy}
          type="button"
          className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto p-4 text-xs font-mono leading-relaxed">
        <pre>
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      </div>
    </div>
  )
}

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            return (
              <CodeBlock className={className} {...props}>
                {children}
              </CodeBlock>
            )
          },
          h1({ children }) {
            return (
              <h1 className="mb-3 mt-4 border-b border-border pb-1.5 text-xl font-bold tracking-tight text-foreground">
                {children}
              </h1>
            )
          },
          h2({ children }) {
            return (
              <h2 className="mb-2 mt-3.5 border-b border-border/60 pb-1 text-lg font-semibold tracking-tight text-foreground">
                {children}
              </h2>
            )
          },
          h3({ children }) {
            return (
              <h3 className="mb-2 mt-3 text-base font-semibold tracking-tight text-foreground">
                {children}
              </h3>
            )
          },
          p({ children }) {
            return <p className="mb-2.5 last:mb-0 text-foreground/90">{children}</p>
          },
          ul({ children }) {
            return <ul className="mb-3 ml-4 list-disc space-y-1 text-foreground/90">{children}</ul>
          },
          ol({ children }) {
            return <ol className="mb-3 ml-4 list-decimal space-y-1 text-foreground/90">{children}</ol>
          },
          li({ children }) {
            return <li className="pl-0.5">{children}</li>
          },
          blockquote({ children }) {
            return (
              <blockquote className="my-2.5 border-l-2 border-primary/60 bg-muted/30 py-1 pl-3 italic text-muted-foreground">
                {children}
              </blockquote>
            )
          },
          table({ children }) {
            return (
              <div className="my-3 overflow-x-auto rounded-lg border border-border">
                <table className="min-w-full divide-y divide-border text-left text-xs">
                  {children}
                </table>
              </div>
            )
          },
          th({ children }) {
            return (
              <th className="bg-muted px-3 py-2 font-semibold text-foreground">
                {children}
              </th>
            )
          },
          td({ children }) {
            return <td className="border-t border-border/50 px-3 py-2 text-foreground/90">{children}</td>
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
              >
                {children}
              </a>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
