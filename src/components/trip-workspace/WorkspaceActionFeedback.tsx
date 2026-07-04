import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface WorkspaceFeedback {
  tone: "success" | "error";
  title: string;
  message: string;
}

interface WorkspaceActionFeedbackProps {
  feedback: WorkspaceFeedback | null;
  onDismiss: () => void;
}

export function WorkspaceActionFeedback({ feedback, onDismiss }: WorkspaceActionFeedbackProps) {
  if (!feedback) return null;

  const isError = feedback.tone === "error";
  const Icon = isError ? AlertCircle : CheckCircle2;

  return (
    <div className="pointer-events-none absolute inset-x-3 top-3 z-[740] flex justify-center md:inset-x-auto md:right-3">
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
