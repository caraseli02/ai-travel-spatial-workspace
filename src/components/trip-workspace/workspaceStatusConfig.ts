export const workspaceStatusConfig = {
  upcoming: {
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    dot: "bg-emerald-500",
    label: "Upcoming",
  },
  ongoing: {
    className: "border-amber-200 bg-amber-50 text-amber-900",
    dot: "bg-amber-500",
    label: "Ongoing",
  },
  completed: {
    className: "border-border bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
    label: "Completed",
  },
  planning: {
    className: "border-sky-200 bg-sky-50 text-sky-800",
    dot: "bg-sky-500",
    label: "Planning",
  },
} as const;
