"use client";

import { CheckCircle2, Loader2, Search, Calendar, Dumbbell } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { DisplayMessage, ToolCallMessage } from "@/features/trainer/api/use-chat";

const TOOL_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  search_exercises: { label: "Searching exercises", icon: Search },
  create_workout_template: { label: "Creating workout template", icon: Dumbbell },
  schedule_workout: { label: "Scheduling workout", icon: Calendar },
};

function ToolCallCard({ message }: { message: ToolCallMessage }) {
  const meta = TOOL_META[message.toolName] ?? { label: message.toolName, icon: Dumbbell };
  const Icon = meta.icon;
  const done = message.status === "done";

  return (
    <div className="flex justify-start">
      <div
        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-all ${
          done
            ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
            : "border-orange-500/20 bg-orange-500/5 text-orange-400"
        }`}
      >
        {done ? (
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        ) : (
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
        )}
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span className="font-medium">
          {done ? meta.label.replace("ing", "ed").replace("Creating", "Created").replace("Searching", "Searched").replace("Scheduling", "Scheduled") : meta.label + "..."}
        </span>
      </div>
    </div>
  );
}

export function ChatMessage({ message }: { message: DisplayMessage }) {
  if (message.role === "tool_call") {
    return <ToolCallCard message={message} />;
  }

  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-orange-500/20 text-white border border-orange-500/30"
            : "bg-white/5 text-zinc-200 border border-white/10"
        }`}
      >
        {!isUser && (
          <p className="mb-1 text-xs font-medium text-orange-400">AI Trainer</p>
        )}
        {message.content ? (
          isUser ? (
            <div className="whitespace-pre-wrap break-words">{message.content}</div>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                em: ({ children }) => <em className="italic text-zinc-300">{children}</em>,
                ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-zinc-200">{children}</li>,
                h1: ({ children }) => <h1 className="mb-2 text-base font-semibold text-white">{children}</h1>,
                h2: ({ children }) => <h2 className="mb-1.5 text-sm font-semibold text-white">{children}</h2>,
                h3: ({ children }) => <h3 className="mb-1 text-sm font-medium text-zinc-100">{children}</h3>,
                code: ({ children, className }) => {
                  const isBlock = className?.includes("language-");
                  return isBlock ? (
                    <code className="block overflow-x-auto rounded-lg bg-black/40 p-3 font-mono text-xs text-zinc-300">
                      {children}
                    </code>
                  ) : (
                    <code className="rounded bg-black/40 px-1 py-0.5 font-mono text-xs text-orange-300">
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => <pre className="mb-2">{children}</pre>,
                blockquote: ({ children }) => (
                  <blockquote className="mb-2 border-l-2 border-orange-500/50 pl-3 text-zinc-400 italic">
                    {children}
                  </blockquote>
                ),
                hr: () => <hr className="my-2 border-white/10" />,
                a: ({ children, href }) => (
                  <a href={href} className="text-orange-400 underline underline-offset-2 hover:text-orange-300" target="_blank" rel="noreferrer">
                    {children}
                  </a>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )
        ) : (
          <span className="flex gap-1 pt-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:0ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:300ms]" />
          </span>
        )}
      </div>
    </div>
  );
}
