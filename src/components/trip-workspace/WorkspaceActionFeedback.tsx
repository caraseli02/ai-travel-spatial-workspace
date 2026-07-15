import { useState } from "react";
import { AlertCircle, CheckCircle2, Copy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface WorkspaceFeedback {
  tone: "success" | "error";
  title: string;
  message: string;
  copyUrl?: string;
}

interface WorkspaceActionFeedbackProps {
  feedback: WorkspaceFeedback | null;
  avoidDetailPanel?: boolean;
  onDismiss: () => void;
}

export function WorkspaceActionFeedback({
  feedback,
  avoidDetailPanel = false,
  onDismiss,
}: WorkspaceActionFeedbackProps) {
  const [copied, setCopied] = useState(false);

  if (!feedback) return null;

  const isError = feedback.tone === "error";
  const Icon = isError ? AlertCircle : CheckCircle2;

  async function handleManualCopy() {
    if (!feedback?.copyUrl) return;
    try {
      await navigator.clipboard.writeText(feedback.copyUrl);
      setCopied(true);
      return;
    } catch {
      // fall through to legacy copy
    }

    const textarea = document.createElement("textarea");
    textarea.value = feedback.copyUrl;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    if (ok) setCopied(true);
  }

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-3 z-[810] flex justify-center",
        "bottom-[calc(5.5rem+env(safe-area-inset-bottom))] md:inset-x-auto md:top-3 md:bottom-auto",
        avoidDetailPanel ? "md:right-72" : "md:right-3",
      )}
    >
      <div
        role={isError ? "alert" : "status"}
        aria-live={isError ? "assertive" : "polite"}
        className={cn(
          "pointer-events-auto flex w-full max-w-sm items-start gap-2 rounded-lg border bg-card px-3 py-2.5 text-sm shadow-lg",
          isError ? "border-destructive/30 text-destructive" : "border-emerald-200 text-emerald-900",
        )}
      >
        <Icon className="mt-0.5 size-4 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground">{feedback.title}</p>
          <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{feedback.message}</p>
          {feedback.copyUrl ? (
            <div className="mt-2 flex items-center gap-1.5">
              <Input
                readOnly
                value={feedback.copyUrl}
                aria-label="Trip link"
                className="h-8 flex-1 text-xs text-foreground"
                onFocus={(event) => event.currentTarget.select()}
              />
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                className="size-8 shrink-0"
                onClick={() => void handleManualCopy()}
                aria-label="Copy trip link"
              >
                <Copy className="size-3.5" />
              </Button>
            </div>
          ) : null}
          {copied ? (
            <p className="mt-1 text-xs font-medium text-emerald-700">Link copied.</p>
          ) : null}
        </div>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onDismiss}
          aria-label="Dismiss workspace feedback"
          className="size-6 shrink-0 text-muted-foreground hover:bg-muted"
        >
          <X className="size-3" />
        </Button>
      </div>
    </div>
  );
}
