import { cn } from "@/lib/utils";

export interface WorkspaceStatItem {
  icon: React.ReactNode;
  label: string;
}

export interface WorkspaceTripStatsPillProps {
  items: WorkspaceStatItem[];
  trailing?: React.ReactNode;
  className?: string;
}

function StatItem({ icon, label }: WorkspaceStatItem) {
  return (
    <div className="flex min-w-0 shrink-0 items-center gap-1 text-muted-foreground">
      <span className="shrink-0">{icon}</span>
      <span className="truncate text-xs">{label}</span>
    </div>
  );
}

export function WorkspaceTripStatsPill({ items, trailing, className }: WorkspaceTripStatsPillProps) {
  return (
    <div
      className={cn(
        "flex max-w-[min(100%,28rem)] shrink-0 select-none items-center gap-1.5 overflow-hidden rounded-xl border border-border bg-card px-2 py-1.5 shadow-sm md:gap-2 md:px-2.5 md:py-2 lg:max-w-none lg:gap-2.5 lg:px-3",
        className,
      )}
    >
      {items.map((item, index) => (
        <div key={index} className="contents">
          {index > 0 ? <div className="h-3 w-px shrink-0 bg-border" /> : null}
          <StatItem {...item} />
        </div>
      ))}
      {trailing ? (
        <>
          <div className="hidden h-3 w-px shrink-0 bg-border lg:block" />
          {trailing}
        </>
      ) : null}
    </div>
  );
}
