import { LayoutGrid, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WorkspaceView } from "./workspaceViewTypes";

export function WorkspaceViewSwitcher({
  value,
  onValueChange,
}: {
  value: WorkspaceView;
  onValueChange: (view: WorkspaceView) => void;
}) {
  const options: { value: WorkspaceView; label: string; icon: React.ReactNode }[] = [
    { value: "canvas", label: "Canvas", icon: <LayoutGrid className="size-3.5" /> },
    { value: "map", label: "Map", icon: <MapIcon className="size-3.5" /> },
  ];

  return (
    <div
      role="group"
      aria-label="Workspace view"
      className="pointer-events-auto inline-flex items-center gap-0.5 rounded-xl border border-border bg-muted p-1 text-muted-foreground shadow-sm"
    >
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <Button
            key={option.value}
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`${option.label} view`}
            aria-pressed={isActive}
            onClick={() => onValueChange(option.value)}
            className={cn(
              "h-auto gap-1 rounded-lg border border-transparent px-2 py-1.5 text-xs shadow-none md:gap-1.5 md:px-3",
              isActive
                ? "bg-card font-semibold text-foreground shadow-sm"
                : "font-medium text-muted-foreground hover:text-foreground",
            )}
          >
            <span className={cn(isActive ? "text-primary" : "text-muted-foreground")}>{option.icon}</span>
            <span className="hidden md:inline">{option.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
