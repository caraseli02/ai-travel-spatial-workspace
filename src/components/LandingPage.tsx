import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUp,
  Calendar,
  CalendarClock,
  Camera,
  Check,
  CircleCheck,
  GitBranch,
  Globe,
  Hotel,
  Inbox,
  Layers,
  Menu,
  Plane,
  Play,
  Sparkles,
  Star,
  Users,
  Wallet,
  X,
} from "lucide-react";
import LandingWorkspacePreview, { FeatureKanbanPreview } from "./LandingWorkspacePreview";
import PricingSection from "./PricingSection";
import { WayfarerLogo } from "./WayfarerLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { DEMO_TRIP_ID } from "../models/trip";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Stories", href: "#stories" },
] as const;

const trustDestinations = [
  { flag: "🇯🇵", name: "Kyoto" },
  { flag: "🇵🇹", name: "Lisbon" },
  { flag: "🇦🇷", name: "Patagonia" },
  { flag: "🇮🇸", name: "Reykjavík" },
  { flag: "🇮🇩", name: "Bali" },
  { flag: "🇲🇦", name: "Marrakech" },
] as const;

const howItWorksSteps = [
  {
    num: "01",
    icon: Layers,
    title: "Capture everything",
    desc: "Paste links, screenshots, and half-formed ideas. Your inbox holds every loose thread in one calm place.",
  },
  {
    num: "02",
    icon: Sparkles,
    title: "Let AI organize",
    desc: "Wayfarer reads each item, tags it, and sorts it into days and categories — flights, stays, food, and must-sees.",
  },
  {
    num: "03",
    icon: Globe,
    title: "See it spatially",
    desc: "Your trip becomes a living canvas you can rearrange, connect, and actually feel before you go.",
  },
] as const;

const canvasBullets = [
  "Drag-and-drop cards grouped by day",
  "Connect related places with ink lines",
  "Polaroids, stays, flights, notes — all in one space",
] as const;

const inboxBullets = [
  "Understands links, images, and plain text",
  "Auto-detects dates, prices, and locations",
  "Sorts into days — you stay in control",
] as const;

const tripFilters = [
  { label: "All", icon: Globe, status: null },
  { label: "Upcoming", icon: Plane, status: "Upcoming" },
  { label: "Planning", icon: CalendarClock, status: "Planning" },
  { label: "Completed", icon: CircleCheck, status: "Completed" },
] as const;

const previewTrips = [
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

const inboxItems = [
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

const testimonials = [
  {
    quote:
      "I planned a two-week Japan trip in one evening. Seeing it all on the canvas finally made the journey feel real.",
    name: "Mara L.",
    role: "Solo traveler",
    avatarClass: "bg-amber-500",
  },
  {
    quote:
      "We stopped losing screenshots in the group chat. Everything just… landed on the right day by itself.",
    name: "Daniel & Priya",
    role: "Honeymooners",
    avatarClass: "bg-primary",
  },
  {
    quote:
      "The first planner that thinks the way I travel — by place and feeling, not by spreadsheet.",
    name: "Tomás R.",
    role: "Digital nomad",
    avatarClass: "bg-emerald-500",
  },
] as const;

const footerLinks = {
  Product: ["Features", "Pricing", "Spatial canvas", "Changelog"],
  Company: ["About", "Blog", "Careers"],
  Legal: ["Privacy", "Terms"],
} as const;

const footerLinkHrefs: Partial<Record<string, string>> = {
  Features: "#features",
  Pricing: "#pricing",
  "Spatial canvas": "#features",
};

const socialLinks = [
  { href: "https://x.com", label: "X (Twitter)", icon: X },
  { href: "https://github.com", label: "GitHub", icon: GitBranch },
] as const;

export default function LandingPage() {
  const navigate = useNavigate();
  const onEnterDemo = () => navigate(`/trips/${DEMO_TRIP_ID}`);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <LandingNav onEnterDemo={onEnterDemo} />
      <HeroSection onEnterDemo={onEnterDemo} />
      <TrustStrip />
      <HowItWorksSection />
      <SpatialCanvasFeature onEnterDemo={onEnterDemo} />
      <TripListFeature onEnterDemo={onEnterDemo} />
      <AiInboxFeature onEnterDemo={onEnterDemo} />
      <PricingSection onCtaClick={onEnterDemo} />
      <TestimonialsSection />
      <CtaSection onEnterDemo={onEnterDemo} />
      <LandingFooter />
    </div>
  );
}

function LandingNav({ onEnterDemo }: { onEnterDemo: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 right-0 left-0 z-50 flex h-[68px] items-center justify-between border-b border-border bg-background/92 px-4 backdrop-blur-md md:px-12">
        <WayfarerLogo />
        <div className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="transition-colors hover:text-foreground">
              {link.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            type="button"
            variant="ghost"
            className="hidden md:inline-flex"
            disabled
            title="Sign in coming soon"
          >
            Sign in
          </Button>
          <Button onClick={onEnterDemo} size="sm" className="md:h-9 md:px-4 md:py-2 md:text-sm">
            <span className="md:hidden">Start</span>
            <span className="hidden md:inline">Start planning</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 rounded-lg md:hidden"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </nav>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" className="w-[min(100vw,20rem)]">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 px-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2 px-4">
            <Button type="button" variant="outline" disabled title="Sign in coming soon">
              Sign in
            </Button>
            <Button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onEnterDemo();
              }}
            >
              Start planning
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function HeroSection({ onEnterDemo }: { onEnterDemo: () => void }) {
  return (
    <section className="px-4 pt-24 pb-10 md:px-12 md:pt-28 md:pb-14">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-7 text-center md:gap-7">
        <Badge
          variant="outline"
          className="gap-2 border-primary/20 bg-primary/5 px-3 py-1.5 text-primary"
        >
          <Sparkles className="size-3.5" />
          AI-native trip planning
        </Badge>

        <h1 className="max-w-4xl font-serif text-[32px] leading-[1.05] font-semibold md:text-[64px]">
          Plan trips you can
          <br />
          actually see.
        </h1>

        <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground md:text-lg">
          Wayfarer turns scattered links, screenshots, and half-formed ideas into a living spatial
          canvas — organized by AI, day by day, ready the moment you land.
        </p>

        <PromptCta onEnterDemo={onEnterDemo} />

        <div className="flex items-center gap-3 pt-1">
          <div className="flex -space-x-2">
            {["bg-amber-500", "bg-primary", "bg-emerald-500", "bg-rose-500"].map((color) => (
              <div
                key={color}
                className={cn("size-6 rounded-full border-2 border-background md:size-[26px]", color)}
              />
            ))}
          </div>
          <p className="text-[13px] font-medium text-muted-foreground">
            <span className="md:hidden">Loved by 12,000+ travelers</span>
            <span className="hidden md:inline">Loved by 12,000+ travelers planning smarter</span>
          </p>
        </div>

        <LandingWorkspacePreview />
      </div>
    </section>
  );
}

function PromptCta({ onEnterDemo }: { onEnterDemo: () => void }) {
  return (
    <div className="w-full max-w-[660px]">
      <div className="flex flex-col gap-2.5 rounded-2xl border border-border bg-background p-3 shadow-[0_4px_16px_rgba(12,10,9,0.05)] md:flex-row md:items-center md:gap-3 md:rounded-full md:p-2 md:pl-4 md:shadow-[0_8px_24px_rgba(12,10,9,0.08)]">
        <div className="flex flex-1 items-center gap-2 md:gap-3 md:px-0 md:py-0">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary md:size-[30px]">
            <Sparkles className="size-4 text-primary-foreground" />
          </div>
          <Input
            readOnly
            aria-readonly="true"
            aria-label="Describe your dream trip"
            placeholder='Describe your dream trip… "7 relaxed days in Kyoto for two"'
            className="h-auto cursor-pointer border-0 bg-transparent px-0 text-[13px] shadow-none focus-visible:ring-0 md:text-[15px]"
            onClick={onEnterDemo}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onEnterDemo();
              }
            }}
          />
        </div>
        <Button
          onClick={onEnterDemo}
          className="h-10 w-full rounded-xl md:h-11 md:w-auto md:shrink-0 md:rounded-full"
        >
          Start planning
          <ArrowUp className="size-4" />
        </Button>
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground md:text-left">
        Try the demo — full trip planning opens in one click.
      </p>
    </div>
  );
}

function TrustStrip() {
  return (
    <section className="border-y border-border bg-background px-4 py-10 md:px-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4">
        <p className="text-center text-xs font-semibold tracking-[0.15em] text-muted-foreground uppercase">
          Trusted for trips to over 1,200 destinations
        </p>
        <div className="grid w-full max-w-lg grid-cols-2 gap-2.5 sm:max-w-none sm:flex sm:flex-wrap sm:justify-center">
          {trustDestinations.map((dest) => (
            <div
              key={dest.name}
              className="flex items-center justify-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-1.5 sm:justify-start"
            >
              <span className="text-sm">{dest.flag}</span>
              <span className="text-sm font-medium">{dest.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-[68px] bg-muted px-4 py-16 md:px-12 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-3xl text-center md:mb-14">
          <p className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">
            How it works
          </p>
          <h2 className="mb-3 font-serif text-[26px] leading-tight md:text-[42px]">
            From chaos to clarity in three steps
          </h2>
          <p className="text-[15px] text-muted-foreground md:text-[17px]">
            No more scattered tabs and group-chat screenshots. Wayfarer takes the mess and hands
            back a plan you can see.
          </p>
        </div>
        <div className="grid gap-7 md:grid-cols-3">
          {howItWorksSteps.map((step) => (
            <Card key={step.num} className="rounded-2xl py-7 shadow-sm">
              <CardContent className="flex flex-col gap-4 px-7">
                <div className="flex items-start justify-between">
                  <div className="flex size-[52px] items-center justify-center rounded-[14px] border border-primary/15 bg-primary/5 text-primary">
                    <step.icon size={22} />
                  </div>
                  <span className="font-serif text-3xl font-semibold text-muted-foreground/30">
                    {step.num}
                  </span>
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function SpatialCanvasFeature({ onEnterDemo }: { onEnterDemo: () => void }) {
  return (
    <section id="features" className="scroll-mt-[68px] px-4 py-16 md:px-12 md:py-24">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 lg:flex-row lg:gap-[72px]">
        <div className="flex flex-col gap-5 lg:flex-1">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            Spatial canvas
          </p>
          <h2 className="font-serif text-[26px] leading-tight md:text-[40px]">
            Your trip as a living moodboard
          </h2>
          <p className="text-[15px] leading-relaxed text-muted-foreground md:text-[17px]">
            Lists flatten a trip. The canvas gives it space. Drag cards into days, cluster the places
            that belong together, and draw connections between a hotel and the dinner spot down the
            street — the way you actually think about a journey.
          </p>
          <ul className="flex flex-col gap-3 pt-1">
            {canvasBullets.map((bullet) => (
              <li key={bullet} className="flex items-center gap-2.5 text-[15px] font-medium">
                <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Check className="size-3.5 text-primary" />
                </span>
                {bullet}
              </li>
            ))}
          </ul>
          <Button variant="outline" onClick={onEnterDemo} className="mt-2 w-fit gap-2">
            Explore the canvas
            <ArrowRight className="size-4" />
          </Button>
        </div>

        <div className="h-[360px] w-full rounded-[20px] border border-border shadow-lg md:h-[440px] lg:w-[600px] lg:shrink-0">
          <FeatureKanbanPreview />
        </div>
      </div>
    </section>
  );
}

function TripListFeature({ onEnterDemo }: { onEnterDemo: () => void }) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const filteredTrips = previewTrips.filter(
    (trip) => activeFilter === null || trip.status === activeFilter,
  );

  return (
    <section className="bg-stone-950 px-4 py-16 text-stone-50 md:px-12 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-10 max-w-3xl text-center md:mb-11">
          <p className="mb-3 text-xs font-semibold tracking-widest text-orange-400 uppercase">
            Your trip hub
          </p>
          <h2 className="mb-3 font-serif text-[26px] leading-tight md:text-[42px]">
            One calm home for every journey
          </h2>
          <p className="text-[15px] text-stone-400 md:text-[17px]">
            Past, present, and someday — every trip lives in one quiet dashboard. Filter by status,
            or just start a new one with a sentence.
          </p>
        </div>

        <div className="mb-10 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2 md:flex md:flex-wrap md:justify-center">
          {tripFilters.map((filter) => (
            <Button
              key={filter.label}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveFilter(filter.status)}
              className={cn(
                "h-auto min-w-[7rem] justify-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium",
                activeFilter === filter.status
                  ? "border-white/15 bg-white/10 text-stone-50 hover:bg-white/10 hover:text-stone-50"
                  : "border-white/5 bg-white/5 text-stone-400 hover:bg-white/10 hover:text-stone-50",
              )}
            >
              <filter.icon className="size-3.5" />
              {filter.label}
            </Button>
          ))}
        </div>

        {filteredTrips.length === 0 ? (
          <p className="text-center text-sm text-stone-400">No trips in this view yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3 md:gap-6">
            {filteredTrips.map((trip, index) => (
              <div key={trip.title} className={cn(index === 2 && "hidden md:block")}>
                <PreviewTripCard trip={trip} onOpen={onEnterDemo} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function AiInboxFeature({ onEnterDemo }: { onEnterDemo: () => void }) {
  return (
    <section className="px-4 py-16 md:px-12 md:py-24">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 lg:flex-row-reverse lg:gap-[72px]">
        <div className="flex flex-col gap-5 lg:flex-1">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">AI inbox</p>
          <h2 className="font-serif text-[26px] leading-tight md:text-[40px]">
            Paste anything. We&apos;ll make sense of it.
          </h2>
          <p className="text-[15px] leading-relaxed text-muted-foreground md:text-[17px]">
            A booking confirmation, a friend&apos;s voice note, a screenshot from Instagram. Drop it
            in and Wayfarer recognizes flights, stays, and places — then files each one onto the
            right day, automatically.
          </p>
          <ul className="flex flex-col gap-3 pt-1">
            {inboxBullets.map((bullet) => (
              <li key={bullet} className="flex items-center gap-2.5 text-[15px] font-medium">
                <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Check className="size-3.5 text-primary" />
                </span>
                {bullet}
              </li>
            ))}
          </ul>
          <Button variant="outline" onClick={onEnterDemo} className="mt-2 w-fit gap-2">
            See it in action
            <ArrowRight className="size-4" />
          </Button>
        </div>

        <InboxMock className="w-full lg:w-[560px] lg:shrink-0" />
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section id="stories" className="scroll-mt-[68px] px-4 py-16 md:px-12 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">
            Stories
          </p>
          <h2 className="font-serif text-[26px] leading-tight md:text-[42px]">
            Travelers who stopped dreading the planning
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name} className="rounded-2xl py-7 shadow-sm">
              <CardContent className="flex flex-col gap-4 px-7">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="font-serif text-lg leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-1">
                  <div className={cn("size-10 rounded-full", t.avatarClass)} />
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-[13px] text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection({ onEnterDemo }: { onEnterDemo: () => void }) {
  return (
    <section className="bg-stone-950 px-4 py-16 md:px-12 md:py-24">
      <div
        className="mx-auto flex max-w-5xl flex-col items-center gap-5 rounded-[28px] px-6 py-14 text-center text-white md:gap-6 md:px-16 md:py-[76px]"
        style={{
          background: "linear-gradient(300deg, #f97316 0%, #9a3412 100%)",
          boxShadow: "0 24px 60px rgba(154, 52, 18, 0.35)",
        }}
      >
        <p className="text-[13px] font-semibold tracking-widest text-white/80 uppercase">
          Ready when you are
        </p>
        <h2 className="max-w-3xl font-serif text-[32px] leading-tight font-semibold md:text-[52px]">
          Your next trip is waiting.
        </h2>
        <p className="max-w-lg text-[15px] leading-relaxed text-white/90 md:text-lg">
          Start with a single sentence and watch it become a trip you can actually see. Your first
          one is on us.
        </p>
        <div className="flex w-full max-w-md flex-col gap-3 pt-2 sm:max-w-none sm:flex-row sm:justify-center">
          <Button
            onClick={onEnterDemo}
            size="lg"
            className="h-auto gap-2 rounded-full bg-white px-6 py-3.5 text-orange-900 hover:bg-white/90"
          >
            Start planning free
            <ArrowRight className="size-4" />
          </Button>
          <Button
            onClick={onEnterDemo}
            size="lg"
            variant="outline"
            className="h-auto gap-2 rounded-full border-white/30 bg-white/10 px-6 py-3.5 text-white hover:bg-white/20 hover:text-white"
          >
            <Play className="size-4" />
            Try the demo trip
          </Button>
        </div>
        <p className="text-[13px] text-white/70">
          Free forever for your first trip · No credit card required
        </p>
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className="border-t border-white/10 bg-stone-900 px-4 py-12 text-stone-400 md:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-9">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between lg:gap-12">
          <div className="shrink-0 space-y-3.5 lg:max-w-sm">
            <WayfarerLogo className="[&_span]:text-stone-50" />
            <p className="text-sm leading-relaxed">
              The AI-native workspace for trips you can see. Capture anything, organize
              automatically, plan spatially.
            </p>
          </div>
          <div className="grid min-w-0 flex-1 gap-8 sm:grid-cols-3 sm:gap-x-10">
            {Object.entries(footerLinks).map(([heading, links]) => (
              <div key={heading} className="flex min-w-[8rem] flex-col gap-3">
                <p className="text-[13px] font-semibold text-stone-50">{heading}</p>
                {links.map((link) => {
                  const href = footerLinkHrefs[link];
                  if (href) {
                    return (
                      <a
                        key={link}
                        href={href}
                        className="text-sm transition-colors hover:text-stone-50"
                      >
                        {link}
                      </a>
                    );
                  }
                  return (
                    <span key={link} className="text-sm text-stone-500">
                      {link}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="h-px bg-white/10" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px]">© 2026 Wayfarer. Made for people who love the going.</p>
          <div className="flex gap-4">
            {socialLinks.map(({ href, label, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-stone-400 transition-colors hover:text-stone-50"
              >
                <Icon className="size-[18px]" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function PreviewTripCard({
  trip,
  onOpen,
}: {
  trip: (typeof previewTrips)[number];
  onOpen: () => void;
}) {
  return (
    <Card
      className="overflow-hidden rounded-2xl border-white/10 bg-stone-900 py-0 text-stone-50 ring-0"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      <div className="relative h-44 overflow-hidden">
        <img src={trip.image} alt={trip.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent" />
        <Badge
          variant="secondary"
          className={cn(
            "absolute top-3 left-3 rounded-2xl bg-stone-900/80 text-xs font-semibold",
            trip.statusColor,
          )}
        >
          {trip.status}
        </Badge>
        <div className="absolute right-3 bottom-3 left-3">
          <p className="text-lg font-semibold">{trip.title}</p>
          <p className="flex items-center gap-1 text-sm text-stone-400">
            <span>{trip.flag}</span>
            {trip.country}
          </p>
        </div>
      </div>
      <CardContent className="space-y-3 px-4 py-4">
        <div className="space-y-2 text-[13px] text-stone-400">
          <p className="flex items-center gap-2">
            <Calendar className="size-3.5 shrink-0" />
            {trip.dates}
          </p>
          <p className="flex items-center gap-2">
            <Users className="size-3.5 shrink-0" />
            {trip.travelers}
          </p>
          <p className="flex items-center gap-2">
            <Wallet className="size-3.5 shrink-0" />
            {trip.budget}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {trip.tags.map((tag) => (
            <span
              key={tag}
              className="max-w-[110px] truncate rounded-2xl border border-white/10 px-2 py-0.5 text-[10px] font-medium text-stone-400"
            >
              {tag}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function InboxMock({ className }: { className?: string }) {
  return (
    <Card className={cn("overflow-hidden rounded-[18px] py-0 shadow-lg", className)}>
      <div className="flex items-center justify-between border-b border-border px-4 py-4">
        <div className="flex items-center gap-2">
          <Inbox className="size-[18px]" />
          <span className="font-semibold">Inbox</span>
        </div>
        <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
          3 new
        </Badge>
      </div>
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-3.5">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary">
          <Sparkles className="size-3.5 text-primary-foreground" />
        </div>
        <p className="flex-1 text-sm text-muted-foreground">Paste a link, screenshot, or note…</p>
        <ArrowUp className="size-[18px] text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-2.5 p-4">
        {inboxItems.map((item) => (
          <div
            key={item.title}
            className="flex items-center gap-3 rounded-xl border border-border bg-background p-3"
          >
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-[10px]",
                item.iconBg,
              )}
            >
              <item.icon className="size-[19px]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{item.title}</p>
              <p className="truncate text-xs text-muted-foreground">{item.sub}</p>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold",
                item.tagClass,
              )}
            >
              {item.tag}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
