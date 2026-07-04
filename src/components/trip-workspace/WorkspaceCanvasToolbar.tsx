import { Grid3x3, Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface WorkspaceCanvasToolbarProps {
  zoomPercent: number;
  preview?: boolean;
  showGridToggle?: boolean;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onReset?: () => void;
}

function ToolbarButton({
  icon,
  onClick,
  title,
  active,
  preview,
}: {
  icon: React.ReactNode;
  onClick?: () => void;
  title: string;
  active?: boolean;
  preview?: boolean;
}) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="icon-sm"
      onClick={onClick}
      title={title}
      disabled={preview}
      tabIndex={preview ? -1 : undefined}
      className={cn("size-7", active && "border-amber-200 bg-amber-50 text-amber-900")}
    >
      {icon}
    </Button>
  );
}

export function WorkspaceCanvasToolbar({
  zoomPercent,
  preview = false,
  showGridToggle = false,
  onZoomIn,
  onZoomOut,
  onReset,
}: WorkspaceCanvasToolbarProps) {
  return (
    <div
      className="flex items-center gap-1 rounded-xl border border-border bg-card px-1 py-1 shadow-sm"
      aria-hidden={preview ? true : undefined}
    >
      <ToolbarButton
        icon={<ZoomIn size={14} />}
        onClick={onZoomIn}
        title="Zoom in"
        preview={preview}
      />
      <span className="px-1 font-mono text-xs text-muted-foreground tabular-nums">{zoomPercent}%</span>
      <ToolbarButton
        icon={<ZoomOut size={14} />}
        onClick={onZoomOut}
        title="Zoom out"
        preview={preview}
      />
      <div className="mx-0.5 hidden h-4 w-px bg-border sm:block" />
      <div className="hidden sm:contents">
        <ToolbarButton
          icon={<Maximize2 size={14} />}
          onClick={onReset}
          title="Reset view"
          preview={preview}
        />
      </div>
      {showGridToggle ? (
        <ToolbarButton
          icon={<Grid3x3 size={14} />}
          title="Grid view"
          active
          preview={preview}
        />
      ) : null}
    </div>
  );
}
