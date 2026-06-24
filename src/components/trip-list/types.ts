import type { LucideIcon } from "lucide-react";

export type TripStatusFilter = "all" | "upcoming" | "ongoing" | "planning" | "completed";

export interface ChatMessage {
  role: "user" | "ai";
  content: string;
  id: string;
}

export interface TripFilterTab {
  key: TripStatusFilter;
  label: string;
  icon: LucideIcon;
  count: number;
}
