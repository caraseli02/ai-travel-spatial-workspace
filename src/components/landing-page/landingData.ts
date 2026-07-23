import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
  Camera,
  CircleCheck,
  GitBranch,
  Globe,
  Hotel,
  Plane,
  X,
} from "lucide-react";

export const navLinks = [{ label: "How it works", href: "#how-it-works" }] as const;

export const trustDestinations = [
  { flag: "🇯🇵", name: "Kyoto" },
  { flag: "🇵🇹", name: "Lisbon" },
  { flag: "🇦🇷", name: "Patagonia" },
  { flag: "🇮🇸", name: "Reykjavík" },
  { flag: "🇮🇩", name: "Bali" },
  { flag: "🇲🇦", name: "Marrakech" },
] as const;

export const howItWorksSteps = [
  {
    num: "01",
    title: "Capture everything",
    desc: "Paste links, screenshots, and half-formed ideas. Your inbox holds every loose thread in one calm place.",
  },
  {
    num: "02",
    title: "Let AI organize",
    desc: "Wayfarer reads each item, tags it, and sorts it into days and categories — flights, stays, food, and must-sees.",
  },
  {
    num: "03",
    title: "See it spatially",
    desc: "Your trip becomes a living canvas you can rearrange, connect, and actually feel before you go.",
  },
] as const;

export const inboxBullets = [
  "Understands links, images, and plain text",
  "Auto-detects dates, prices, and locations",
  "Sorts into days — you stay in control",
] as const;

export const tripFilters: {
  label: string;
  icon: LucideIcon;
  status: string | null;
}[] = [
  { label: "All", icon: Globe, status: null },
  { label: "Upcoming", icon: Plane, status: "Upcoming" },
  { label: "Planning", icon: CalendarClock, status: "Planning" },
  { label: "Completed", icon: CircleCheck, status: "Completed" },
];

export const previewTrips = [
  {
    title: "7 Days in Kyoto",
    country: "Japan",
    flag: "🇯🇵",
    dates: "Dec 14–21, 2025",
    travelers: "2 travelers",
    budget: "Budget: $3,200",
    status: "Upcoming",
    statusColor: "text-emerald-400",
    image: "/images/fushimi-inari.jpg",
    tags: ["Fushimi Inari", "Arashiyama", "Nishiki Market"],
  },
  {
    title: "Lisbon & the Coast",
    country: "Portugal",
    flag: "🇵🇹",
    dates: "Flexible dates",
    travelers: "2 travelers",
    budget: "Budget: $2,400",
    status: "Planning",
    statusColor: "text-amber-400",
    image: "/images/gion.jpg",
    tags: ["Alfama", "Sintra", "Belém"],
  },
  {
    title: "Iceland Ring Road",
    country: "Iceland",
    flag: "🇮🇸",
    dates: "Mar 3–12, 2026",
    travelers: "4 travelers",
    budget: "Budget: $5,100",
    status: "Upcoming",
    statusColor: "text-emerald-400",
    image: "/images/iceland-ring-road.jpg",
    tags: ["Blue Lagoon", "Goðafoss", "Vík"],
  },
] as const;

export type PreviewTrip = (typeof previewTrips)[number];

export const inboxItems = [
  {
    title: "Flight SFO → KIX",
    sub: "United 837 · Dec 14, 11:25am",
    icon: Plane,
    iconBg: "bg-blue-100 text-blue-600",
    tag: "Day 1",
    tagClass: "bg-emerald-500/10 text-emerald-600",
  },
  {
    title: "Hiiragiya Ryokan",
    sub: "booking.com/hiiragiya · 3 nights",
    icon: Hotel,
    iconBg: "bg-amber-100 text-amber-700",
    tag: "Day 1",
    tagClass: "bg-emerald-500/10 text-emerald-600",
  },
  {
    title: "Fushimi Inari at sunrise",
    sub: "instagram screenshot · photo",
    icon: Camera,
    iconBg: "bg-fuchsia-100 text-fuchsia-700",
    tag: "Organizing…",
    tagClass: "bg-primary/10 text-primary",
  },
] as const;

export const footerLinks = {
  Product: ["How it works", "Changelog"],
  Company: ["About", "Blog", "Careers"],
  Legal: ["Privacy", "Terms"],
} as const;

export const footerLinkHrefs: Partial<Record<string, string>> = {
  "How it works": "#how-it-works",
};

export const socialLinks = [
  { href: "https://x.com", label: "X (Twitter)", icon: X },
  { href: "https://github.com", label: "GitHub", icon: GitBranch },
] as const;
