import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ToolBtn({
  icon,
  onClick,
  title,
  active,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  title: string;
  active?: boolean;
}) {
  return (
    <Button
      variant={active ? "secondary" : "ghost"}
      size="icon-sm"
      onClick={onClick}
      title={title}
      className={cn("size-7", active && "border-amber-200 bg-amber-50 text-amber-900")}
    >
      {icon}
    </Button>
  );
}

export function StatItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex min-w-0 items-center gap-1 text-muted-foreground">
      <span className="shrink-0">{icon}</span>
      <span className="truncate text-xs">{label}</span>
    </div>
  );
}
