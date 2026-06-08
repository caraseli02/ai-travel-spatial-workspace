import { Compass } from "lucide-react";
import { cn } from "@/lib/utils";

type WayfarerLogoProps = {
  showWordmark?: boolean;
  iconSize?: number;
  className?: string;
};

export function WayfarerLogo({ showWordmark = true, iconSize = 15, className }: WayfarerLogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex size-7 items-center justify-center rounded-lg bg-primary">
        <Compass
          size={iconSize}
          color="white"
          strokeWidth={2.5}
          className="text-primary-foreground"
        />
      </div>
      {showWordmark && (
        <span className="text-[15px] font-semibold tracking-tight text-foreground">Wayfarer</span>
      )}
    </div>
  );
}
