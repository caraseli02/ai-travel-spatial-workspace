import { cn } from "@/lib/utils";

type WayfarerLogoProps = {
  className?: string;
};

export function WayfarerLogo({ className }: WayfarerLogoProps) {
  return (
    <span className={cn("text-[15px] font-semibold tracking-tight text-foreground", className)}>
      Wayfarer
    </span>
  );
}
