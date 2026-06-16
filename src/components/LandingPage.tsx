import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUp,
  Calendar,
  CalendarClock,
  Camera,
  Check,
  CircleCheck,
  Globe,
  Hotel,
  Inbox,
  Layers,
  Link2,
  Lock,
  Plane,
  Play,
  Share2,
  Sparkles,
  Star,
  Users,
  X,
  Wallet,
} from "lucide-react";
import PricingSection from "./PricingSection";
import { WayfarerLogo } from "./WayfarerLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  { label: "All", icon: Globe, active: true },
  { label: "Upcoming", icon: Plane, active: false },
  { label: "Planning", icon: CalendarClock, active: false },
  { label: "Completed", icon: CircleCheck, active: false },
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
    image: "/images/arashiyama.jpg",
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

const heroCanvasCards = [
  {
    label: "JAL JL69 · SFO→KIX",
    sub: "Dec 14 · $743",
    icon: "✈️",
    tag: "Day 1",
    tagBg: "bg-amber-100 text-primary",
    image: null as string | null,
  },
  {
    label: "Fushimi Inari",
    sub: "Go at 5am — Yuki",
    icon: "⛩️",
    tag: "Day 2",
    tagBg: "bg-orange-100 text-orange-700",
    image: "/images/fushimi-inari.jpg",
  },
  {
    label: "Hiiragiya Ryokan",
    sub: "¥45,000/night · 4.9★",
    icon: "🏯",
    tag: "Stay",
    tagBg: "bg-rose-100 text-rose-700",
    image: "/images/ryokan.jpg",
  },
  {
    label: '"Go at 5am!!"',
    sub: "Yuki's tip 🌅",
    icon: "",
    tag: "",
    tagBg: "",
    image: null,
    sticky: true,
  },
  {
    label: "Arashiyama Bamboo",
    sub: "Day 3 · Morning walk",
    icon: "🌿",
    tag: "Day 3",
    tagBg: "bg-emerald-100 text-emerald-800",
    image: "/images/arashiyama.jpg",
  },
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
      <PricingSection />
      <TestimonialsSection />
      <CtaSection onEnterDemo={onEnterDemo} />
      <LandingFooter />
    </div>
  );
}

function LandingNav({ onEnterDemo }: { onEnterDemo: () => void }) {
  return (
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
        <Button variant="ghost" className="hidden md:inline-flex">
          Sign in
        </Button>
        <Button onClick={onEnterDemo} size="sm" className="md:h-9 md:px-4 md:py-2 md:text-sm">
          Start planning
        </Button>
      </div>
    </nav>
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
            Loved by 12,000+ travelers planning smarter
          </p>
        </div>

        <ProductWindow />
      </div>
    </section>
  );
}

function PromptCta({ onEnterDemo }: { onEnterDemo: () => void }) {
  return (
    <div className="w-full max-w-[660px]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:rounded-full md:border md:border-border md:bg-background md:p-2 md:pl-4 md:shadow-[0_8px_24px_rgba(12,10,9,0.08)]">
        <div className="flex flex-1 items-center gap-3 rounded-full border border-border bg-background px-4 py-3 md:border-0 md:bg-transparent md:px-0 md:py-0">
          <div className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-primary">
            <Sparkles className="size-4 text-primary-foreground" />
          </div>
          <p className="text-left text-sm text-muted-foreground md:text-[15px]">
            Describe your dream trip… &ldquo;7 relaxed days in Kyoto for two&rdquo;
          </p>
        </div>
        <Button onClick={onEnterDemo} className="h-11 w-full rounded-full md:w-auto md:shrink-0">
          Start planning
          <ArrowUp className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function ProductWindow() {
  return (
    <div className="mt-2 w-full max-w-[1180px] overflow-hidden rounded-2xl border border-border bg-background shadow-[0_30px_60px_rgba(12,10,9,0.15)]">
      <div className="flex h-11 items-center gap-2 border-b border-border px-4">
        <div className="flex gap-1.5">
          <div className="size-2.5 rounded-full bg-red-400" />
          <div className="size-2.5 rounded-full bg-amber-400" />
          <div className="size-2.5 rounded-full bg-emerald-400" />
        </div>
        <div className="flex h-[26px] items-center gap-1.5 rounded-full bg-muted px-3">
          <Lock className="size-2.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">wayfarer.app/trips/kyoto</span>
        </div>
        <div className="flex-1" />
        <Share2 className="size-4 text-muted-foreground" />
      </div>

      <div className="canvas-bg relative min-h-[320px] p-4 md:h-[600px] md:p-0">
        <div className="flex flex-col gap-3 md:hidden">
          <DayLabel label="Day 1 — Arrival" color="bg-amber-500" />
          {heroCanvasCards.slice(0, 2).map((card) => (
            <CanvasCard key={card.label} card={card} className="w-full" />
          ))}
          <DayLabel label="Day 2 — Higashiyama" color="bg-primary" />
          {heroCanvasCards.slice(2, 4).map((card) => (
            <CanvasCard key={card.label} card={card} className="w-full" />
          ))}
          <DayLabel label="Day 3 — Arashiyama" color="bg-emerald-500" />
          <CanvasCard card={heroCanvasCards[4]} className="w-full" />
        </div>

        <div className="relative hidden h-full md:block">
          <DayLabel
            label="Day 1 — Arrival"
            color="bg-amber-500"
            className="absolute top-6 left-10"
          />
          <DayLabel
            label="Day 2 — Higashiyama"
            color="bg-primary"
            className="absolute top-6 left-[352px]"
          />
          <DayLabel
            label="Day 3 — Arashiyama"
            color="bg-emerald-500"
            className="absolute top-6 left-[628px]"
          />
          <div className="absolute top-[58px] left-10">
            <CanvasCard card={heroCanvasCards[0]} />
          </div>
          <div className="absolute top-[250px] left-10">
            <StickyNote text='"Laundry is cheap in Kyoto — bring half what you think 🧳"' />
          </div>
          <div className="absolute top-[58px] left-[352px]">
            <CanvasCard card={heroCanvasCards[1]} />
          </div>
          <div className="absolute top-[316px] left-[352px]">
            <MiniArticleCard label="Nishiki Market" image="/images/nishiki-market.jpg" />
          </div>
          <div className="absolute top-[58px] left-[628px]">
            <CanvasCard card={heroCanvasCards[2]} />
          </div>
          <div className="absolute top-[320px] left-[628px]">
            <StickyNote text='"Go at 5am!!" — Yuki 🌅' />
          </div>
          <div className="absolute top-[58px] left-[908px]">
            <CanvasCard card={heroCanvasCards[4]} />
          </div>
          <svg className="ink-line pointer-events-none absolute inset-0 h-full w-full">
            <line x1="18%" y1="22%" x2="38%" y2="18%" opacity="0.7" />
            <line x1="16%" y1="58%" x2="36%" y2="54%" opacity="0.7" />
          </svg>
        </div>
      </div>
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
    <section id="how-it-works" className="bg-muted px-4 py-16 md:px-12 md:py-24">
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
                  <span className="font-serif text-3xl font-semibold text-border">{step.num}</span>
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
    <section id="features" className="px-4 py-16 md:px-12 md:py-24">
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

        <div className="canvas-bg relative h-[360px] w-full overflow-hidden rounded-[20px] border border-border shadow-lg md:h-[440px] lg:w-[600px] lg:shrink-0">
          <div className="flex flex-col gap-3 p-4 md:hidden">
            <DayLabel label="Day 2 — Higashiyama" color="bg-primary" />
            <CanvasCard
              card={{
                label: "Fushimi Inari",
                sub: "Go at 5am — Yuki",
                icon: "⛩️",
                tag: "Day 2",
                tagBg: "bg-orange-100 text-orange-700",
                image: "/images/fushimi-inari.jpg",
              }}
              className="w-full"
            />
            <StickyNote text='"Go at 5am!!" — Yuki 🌅' className="w-full" />
            <CanvasCard
              card={{
                label: "Hiiragiya Ryokan",
                sub: "¥45,000/night",
                icon: "🏯",
                tag: "Stay",
                tagBg: "bg-rose-100 text-rose-700",
                image: "/images/ryokan.jpg",
              }}
              className="w-full"
            />
          </div>
          <div className="relative hidden h-full md:block">
            <DayLabel
              label="Day 2 — Higashiyama"
              color="bg-primary"
              className="absolute top-6 left-7"
            />
            <div className="absolute top-[58px] left-7">
              <CanvasCard
                card={{
                  label: "Fushimi Inari",
                  sub: "Go at 5am — Yuki",
                  icon: "⛩️",
                  tag: "Day 2",
                  tagBg: "bg-orange-100 text-orange-700",
                  image: "/images/fushimi-inari.jpg",
                }}
              />
            </div>
            <div className="absolute top-[322px] left-10">
              <StickyNote text='"Go at 5am!!" — Yuki 🌅' />
            </div>
            <div className="absolute top-24 left-[300px]">
              <CanvasCard
                card={{
                  label: "Hiiragiya Ryokan",
                  sub: "¥45,000/night",
                  icon: "🏯",
                  tag: "Stay",
                  tagBg: "bg-rose-100 text-rose-700",
                  image: "/images/ryokan.jpg",
                }}
              />
            </div>
            <svg className="ink-line pointer-events-none absolute inset-0 h-full w-full">
              <line x1="28%" y1="42%" x2="52%" y2="38%" opacity="0.7" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

function TripListFeature({ onEnterDemo }: { onEnterDemo: () => void }) {
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
            search by feeling, or just start a new one with a sentence.
          </p>
        </div>

        <div className="mb-10 grid grid-cols-2 gap-2 md:flex md:flex-wrap md:justify-center md:gap-2">
          {tripFilters.map((filter) => (
            <Button
              key={filter.label}
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                "h-auto justify-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium",
                filter.active
                  ? "border-white/15 bg-white/10 text-stone-50 hover:bg-white/10 hover:text-stone-50"
                  : "border-white/5 bg-white/5 text-stone-400 hover:bg-white/10 hover:text-stone-50",
              )}
            >
              <filter.icon className="size-3.5" />
              {filter.label}
            </Button>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {previewTrips.map((trip) => (
            <PreviewTripCard key={trip.title} trip={trip} onOpen={onEnterDemo} />
          ))}
        </div>
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
    <section id="stories" className="px-4 py-16 md:px-12 md:py-24">
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
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="max-w-xs space-y-3.5">
            <WayfarerLogo className="[&_span]:text-stone-50" />
            <p className="text-sm leading-relaxed">
              The AI-native workspace for trips you can see. Capture anything, organize
              automatically, plan spatially.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {Object.entries(footerLinks).map(([heading, links]) => (
              <div key={heading} className="flex flex-col gap-3">
                <p className="text-[13px] font-semibold text-stone-50">{heading}</p>
                {links.map((link) => (
                  <a key={link} href="#" className="text-sm transition-colors hover:text-stone-50">
                    {link}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="h-px bg-white/10" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px]">© 2026 Wayfarer. Made for people who love the going.</p>
          <div className="flex gap-4">
            <X className="size-[18px] cursor-pointer transition-colors hover:text-stone-50" aria-label="X" />
            <Share2 className="size-[18px] cursor-pointer transition-colors hover:text-stone-50" aria-label="Share" />
            <Link2 className="size-[18px] cursor-pointer transition-colors hover:text-stone-50" aria-label="GitHub" />
          </div>
        </div>
      </div>
    </footer>
  );
}

function DayLabel({
  label,
  color,
  className,
}: {
  label: string;
  color: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className={cn("size-2 rounded-full", color)} />
      <span className="text-xs font-semibold text-foreground">{label}</span>
    </div>
  );
}

type CanvasCardData = {
  label: string;
  sub: string;
  icon: string;
  tag: string;
  tagBg: string;
  image: string | null;
  sticky?: boolean;
};

function CanvasCard({ card, className }: { card: CanvasCardData; className?: string }) {
  if (card.sticky) {
    return <StickyNote text={card.label} className={className} />;
  }

  return (
    <div
      className={cn(
        "w-[180px] rounded-lg bg-card p-2.5 polaroid-shadow",
        className,
      )}
    >
      {card.image && (
        <div className="mb-2 h-20 w-full overflow-hidden rounded bg-border">
          <img src={card.image} alt={card.label} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="flex items-start gap-1.5">
        {card.icon && <span className="text-sm">{card.icon}</span>}
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold">{card.label}</p>
          <p className="text-xs leading-tight text-muted-foreground">{card.sub}</p>
        </div>
      </div>
      {card.tag && (
        <span className={cn("mt-2 inline-block rounded-full px-2 py-0.5 text-xs", card.tagBg)}>
          {card.tag}
        </span>
      )}
    </div>
  );
}

function StickyNote({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn("sticky-shadow w-[160px] rounded-lg bg-amber-100 px-2.5 py-2", className)}>
      <p className="text-xs leading-relaxed text-foreground">{text}</p>
    </div>
  );
}

function MiniArticleCard({ label, image }: { label: string; image: string }) {
  return (
    <div className="w-[180px] rounded-lg bg-card p-2 polaroid-shadow">
      <div className="mb-1.5 h-16 w-full overflow-hidden rounded bg-border">
        <img src={image} alt={label} className="h-full w-full object-cover" />
      </div>
      <p className="text-xs font-semibold">{label}</p>
    </div>
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
