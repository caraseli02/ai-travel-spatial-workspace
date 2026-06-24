import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Sparkles, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "./types";

interface ChatHistorySidebarProps {
  messages: ChatMessage[];
  isProcessing: boolean;
  onClear: () => void;
  onClose: () => void;
}

export function ChatHistorySidebar({
  messages,
  isProcessing,
  onClear,
  onClose,
}: ChatHistorySidebarProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 380, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="z-10 flex shrink-0 flex-col overflow-hidden border-r border-border bg-sidebar"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Chat History</h2>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClear}
              title="Clear chat"
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon-sm" onClick={onClose} className="text-muted-foreground">
            <X className="size-4" />
          </Button>
        </div>
      </div>

      <div ref={chatScrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-xl border border-border bg-muted">
              <MessageSquare className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Start a conversation to plan your trips</p>
          </div>
        ) : (
          messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex gap-3", message.role === "user" && "flex-row-reverse")}
            >
              <div
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-lg",
                  message.role === "user" ? "bg-muted" : "bg-primary",
                )}
              >
                {message.role === "user" ? (
                  <span className="text-[10px] font-bold text-muted-foreground">You</span>
                ) : (
                  <Sparkles className="size-3.5 text-primary-foreground" />
                )}
              </div>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  message.role === "user"
                    ? "bg-muted text-foreground"
                    : "border border-border bg-card text-muted-foreground",
                )}
              >
                {message.content.split("\n").map((line, lineIndex) => {
                  const parts = line.split(/\*\*(.*?)\*\*/g);
                  return (
                    <span key={lineIndex}>
                      {parts.map((part, partIndex) =>
                        partIndex % 2 === 1 ? (
                          <strong key={partIndex} className="font-semibold text-foreground">
                            {part}
                          </strong>
                        ) : (
                          part
                        ),
                      )}
                      {lineIndex < message.content.split("\n").length - 1 && <br />}
                    </span>
                  );
                })}
              </div>
            </motion.div>
          ))
        )}
        {isProcessing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="size-3.5 animate-pulse text-primary-foreground" />
            </div>
            <div className="rounded-2xl border border-border bg-card px-4 py-3">
              <div className="flex gap-1">
                <span
                  className="size-2 animate-bounce rounded-full bg-muted-foreground"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="size-2 animate-bounce rounded-full bg-muted-foreground"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="size-2 animate-bounce rounded-full bg-muted-foreground"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </motion.div>
  );
}
