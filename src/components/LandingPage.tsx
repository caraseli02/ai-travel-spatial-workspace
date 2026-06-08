import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Star,
  Zap,
  Globe,
  MessageSquare,
  Check,
  ChevronRight,
  Compass,
  Lock,
} from "lucide-react";
import PricingSection from "./PricingSection";
import { WayfarerLogo } from "./WayfarerLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { DEMO_TRIP_ID } from "../models/trip";

const chatMessages = [
  { role: "user", text: "https://www.google.com/flights/r/SFO-KIX-Dec14 $743 JAL nonstop 🎉" },
  {
    role: "user",
    text: "Yuki said go to Fushimi Inari at 5am before crowds and try tofu kaiseki at Junsei near Nanzenji",
  },
  {
    role: "user",
    text: "https://booking.com/hotel/jp/hiiragiya-ryokan ← this looks incredible, checking availability",
  },
  {
    role: "ai",
    text: "Got it! I've organized your Kyoto trip. Found your JAL flight, Hiiragiya Ryokan, and added Yuki's tips to Day 2 & 4. Pulling in the details now…",
  },
];

const canvasPreviewCards = [
  {
    label: "JAL JL69 · SFO→KIX",
    sub: "Dec 14 · $743 nonstop",
    color: "bg-stone-50",
    rotate: "-rotate-1",
    tag: "Day 1",
    tagBg: "bg-amber-100 text-amber-700",
    x: "2%",
    y: "8%",
    icon: "✈️",
  },
  {
    label: "Hiiragiya Ryokan",
    sub: "¥45,000/night · 4.9★",
    color: "bg-stone-50",
    rotate: "rotate-1",
    tag: "Stay",
    tagBg: "bg-rose-100 text-rose-700",
    x: "36%",
    y: "2%",
    icon: "🏯",
    hasImage: true,
  },
  {
    label: "Fushimi Inari",
    sub: "Go at 5am! — Yuki",
    color: "bg-stone-50",
    rotate: "-rotate-2",
    tag: "Day 2",
    tagBg: "bg-orange-100 text-orange-700",
    x: "4%",
    y: "52%",
    icon: "⛩️",
    hasImage: true,
  },
  {
    label: '"Go at 5am!!"',
    sub: "Yuki's tip 🌅",
    color: "bg-amber-50",
    rotate: "rotate-2",
    tag: "",
    tagBg: "",
    x: "37%",
    y: "48%",
    icon: "",
  },
  {
    label: "Arashiyama Bamboo",
    sub: "Day 3 · Morning walk",
    color: "bg-stone-50",
    rotate: "rotate-1",
    tag: "Day 3",
    tagBg: "bg-emerald-100 text-emerald-700",
    x: "66%",
    y: "10%",
    icon: "🌿",
    hasImage: true,
  },
  {
    label: "Junsei Restaurant",
    sub: "Tofu kaiseki · Book ahead",
    color: "bg-rose-50",
    rotate: "-rotate-1",
    tag: "Dinner",
    tagBg: "bg-rose-100 text-rose-700",
    x: "66%",
    y: "55%",
    icon: "🍜",
  },
];

const canvasDayTabs = [
  {
    value: "day-1",
    label: "Day 1 · Arrival",
    className:
      "border-amber-200 bg-amber-100 text-primary data-active:bg-amber-100 data-active:text-primary",
  },
  {
    value: "day-2",
    label: "Day 2 · Explore",
    className:
      "border-orange-200 bg-orange-100 text-orange-700 data-active:bg-orange-100 data-active:text-orange-700",
  },
  {
    value: "day-3",
    label: "Day 3 · Nature",
    className:
      "border-emerald-200 bg-emerald-100 text-emerald-800 data-active:bg-emerald-100 data-active:text-emerald-800",
  },
] as const;

const howItWorksSteps = [
  {
    num: "01",
    icon: <MessageSquare size={22} />,
    title: "Dump everything in",
    desc: "Paste any URL, forward a WhatsApp message, type a half-formed idea. Wayfarer is your trip's inbox — it accepts anything.",
    iconClass: "bg-amber-100 text-primary",
  },
  {
    num: "02",
    icon: <Sparkles size={22} />,
    title: "AI silently organizes",
    desc: "Behind the scenes, Wayfarer extracts dates, prices, locations, and tips — and places them on the canvas without asking.",
    iconClass: "bg-orange-100 text-orange-700",
  },
  {
    num: "03",
    icon: <Globe size={22} />,
    title: "Your spatial trip emerges",
    desc: "The canvas fills up. Cards cluster by day. Lines connect related ideas. Your trip starts looking exactly how it feels in your head.",
    iconClass: "bg-emerald-100 text-emerald-800",
  },
] as const;

const featureGridItems = [
  {
    emoji: "✈️",
    label: "Flights",
    count: "Auto-extracted",
    className: "border-amber-200 bg-amber-50",
  },
  {
    emoji: "🏯",
    label: "Hotels",
    count: "With pricing",
    className: "border-rose-200 bg-rose-50",
  },
  {
    emoji: "🗺️",
    label: "Activities",
    count: "From any link",
    className: "border-emerald-200 bg-emerald-50",
  },
  {
    emoji: "💬",
    label: "Tips",
    count: "From messages",
    className: "border-blue-200 bg-blue-50",
  },
  {
    emoji: "📍",
    label: "Locations",
    count: "Spatially grouped",
    className: "border-purple-200 bg-purple-50",
  },
  {
    emoji: "📎",
    label: "Articles",
    count: "Clipped & tagged",
    className: "border-orange-200 bg-orange-50",
  },
] as const;

const features = [
  {
    icon: <MessageSquare size={20} />,
    title: "Paste anything",
    desc: "Google Flights links, WhatsApp messages, Reddit threads, booking confirmations — just dump it all in.",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: <Sparkles size={20} />,
    title: "AI extracts structure",
    desc: "Wayfarer reads between the lines: dates, places, tips, prices — silently organized as you type.",
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  {
    icon: <Globe size={20} />,
    title: "Spatial canvas",
    desc: "Not a spreadsheet. A living moodboard that mirrors how your brain actually plans a trip.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: <Zap size={20} />,
    title: "Quiet competence",
    desc: "No flashy animations, no onboarding wizards. Structure emerges from your chaos, invisibly.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
];

const testimonials = [
  {
    text: '"I used to have 14 browser tabs, a Notion doc, and 3 WhatsApp threads for every trip. Wayfarer is the first thing that actually matches how I think."',
    name: "Camille R.",
    role: "Frequent traveler, Paris",
    avatar: "🇫🇷",
  },
  {
    text: '"The canvas metaphor is genius. I can literally see my trip taking shape. It feels like planning with a really organized friend."',
    name: "Kenji M.",
    role: "Digital nomad, Tokyo",
    avatar: "🇯🇵",
  },
  {
    text: '"Finally something that handles the messy research phase. Everything I paste just... lands in the right place."',
    name: "Sofia A.",
    role: "Travel blogger, Buenos Aires",
    avatar: "🇦🇷",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const onEnterDemo = () => navigate(`/trips/${DEMO_TRIP_ID}`);
  const [typedText, setTypedText] = useState("");
  const [msgIdx, setMsgIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [showCanvas, setShowCanvas] = useState(false);

  const currentMsg = chatMessages[msgIdx]?.text || "";

  useEffect(() => {
    if (msgIdx >= chatMessages.length) {
      setTimeout(() => setShowCanvas(true), 400);
      return;
    }
    if (charIdx < currentMsg.length) {
      const t = setTimeout(
        () => {
          setTypedText((prev) => prev + currentMsg[charIdx]);
          setCharIdx((c) => c + 1);
        },
        msgIdx === 3 ? 18 : 28,
      );
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setMsgIdx((m) => m + 1);
        setCharIdx(0);
        setTypedText("");
      }, 600);
      return () => clearTimeout(t);
    }
  }, [charIdx, msgIdx, currentMsg]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-border bg-background/92 px-6 py-4 backdrop-blur-md md:px-12">
        <WayfarerLogo />
        <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#" className="transition-colors hover:text-foreground">
            How it works
          </a>
          <a href="#" className="transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#" className="transition-colors hover:text-foreground">
            Pricing
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="hidden md:inline-flex">
            Sign in
          </Button>
          <Button onClick={onEnterDemo}>Try demo</Button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-28 pb-16 px-6 md:px-12 overflow-hidden">
        {/* Subtle background gradient blobs */}
        <div
          className="absolute top-20 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #fde68a 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-60 left-0 w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, #fecaca 0%, transparent 70%)" }}
        />

        <div className="max-w-7xl mx-auto">
          {/* Badge */}
          <Badge
            variant="outline"
            className="mb-8 gap-2 border-amber-200 bg-amber-100 px-3 py-1.5 text-primary"
          >
            <Sparkles className="size-3" />
            AI-native travel workspace · Now in beta
          </Badge>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div>
              <h1 className="mb-6 font-serif text-5xl leading-tight text-foreground md:text-6xl">
                The travel workspace
                <br />
                <em className="text-primary">
                  that thinks how
                  <br />
                  you think.
                </em>
              </h1>
              <p className="mb-8 max-w-md text-lg leading-relaxed text-muted-foreground">
                Paste your messy links, WhatsApp tips, and half-formed ideas. Wayfarer silently
                turns them into a beautiful spatial canvas — like a really organized travel
                companion.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={onEnterDemo}
                  size="lg"
                  className="group h-auto px-6 py-3.5 hover:shadow-lg"
                >
                  Explore the demo
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Button>
                <Button variant="outline" size="lg" className="h-auto px-6 py-3.5">
                  Watch 2-min walkthrough
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-500" /> Free to try
                </span>
                <span className="flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-500" /> No credit card
                </span>
                <span className="flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-500" /> Private by default
                </span>
              </div>
            </div>

            {/* Right: Live demo preview */}
            <div className="relative">
              <LiveChatPreview
                messages={chatMessages}
                msgIdx={msgIdx}
                typedText={typedText}
                showCanvas={showCanvas}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CANVAS SHOWCASE */}
      <section className="bg-muted px-6 py-20 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              The Canvas
            </p>
            <h2 className="mb-4 font-serif text-4xl text-foreground md:text-5xl">
              Chaos, beautifully organized.
            </h2>
            <p className="mx-auto max-w-xl leading-relaxed text-muted-foreground">
              Your pasted links and messages arrange themselves into a spatial moodboard. Not a
              list. Not a table. A canvas that feels alive.
            </p>
          </div>

          {/* Big canvas preview */}
          <div className="canvas-bg relative h-[520px] w-full overflow-hidden rounded-2xl border border-border">
            {/* Day tabs */}
            <Tabs defaultValue="day-1" className="absolute top-4 left-4 z-20">
              <TabsList className="h-auto flex-wrap gap-2 bg-transparent p-0">
                {canvasDayTabs.map((day) => (
                  <TabsTrigger
                    key={day.value}
                    value={day.value}
                    className={cn(
                      "h-auto rounded-full border px-2.5 py-1 text-xs shadow-none",
                      day.className,
                    )}
                  >
                    {day.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Canvas cards */}
            {canvasPreviewCards.map((card, i) => (
              <div
                key={i}
                className={`absolute ${card.rotate} canvas-item cursor-pointer`}
                style={{ left: card.x, top: card.y }}
              >
                <div
                  className={cn(
                    card.color,
                    "rounded-lg p-2.5 polaroid-shadow hover:polaroid-shadow-hover",
                    i === 3 ? "w-[160px]" : "w-[180px]",
                  )}
                >
                  {card.hasImage && (
                    <div className="mb-2 h-20 w-full overflow-hidden rounded bg-border">
                      <img
                        src={
                          i === 1
                            ? "/images/ryokan.jpg"
                            : i === 2
                              ? "/images/fushimi-inari.jpg"
                              : "/images/arashiyama.jpg"
                        }
                        alt={card.label}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex items-start gap-1.5">
                    {card.icon && <span className="text-sm">{card.icon}</span>}
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-foreground">{card.label}</p>
                      <p className="mt-0.5 text-xs leading-tight text-muted-foreground">
                        {card.sub}
                      </p>
                    </div>
                  </div>
                  {card.tag && (
                    <span
                      className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full ${card.tagBg}`}
                    >
                      {card.tag}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* SVG connection lines */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 1 }}
            >
              <line
                x1="13%"
                y1="18%"
                x2="40%"
                y2="12%"
                stroke="#c4b5a0"
                strokeWidth="1.5"
                strokeDasharray="5,4"
                opacity="0.6"
              />
              <line
                x1="25%"
                y1="68%"
                x2="44%"
                y2="62%"
                stroke="#c4b5a0"
                strokeWidth="1.5"
                strokeDasharray="5,4"
                opacity="0.6"
              />
            </svg>

            {/* Bottom fade */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-muted to-transparent" />

            {/* CTA overlay */}
            <div className="absolute right-6 bottom-6">
              <Button onClick={onEnterDemo} className="shadow-sm hover:shadow-md">
                Explore full canvas <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* PHOTO STRIP */}
      <section className="overflow-hidden py-10">
        <div className="flex animate-none gap-4 px-6">
          {[
            { src: "/images/fushimi-inari.jpg", label: "Fushimi Inari" },
            { src: "/images/arashiyama.jpg", label: "Arashiyama" },
            { src: "/images/nishiki-market.jpg", label: "Nishiki Market" },
            { src: "/images/gion.jpg", label: "Gion District" },
            { src: "/images/ryokan.jpg", label: "Hiiragiya Ryokan" },
            { src: "/images/kinkakuji.jpg", label: "Kinkaku-ji" },
          ].map((photo) => (
            <div
              key={photo.label}
              className="group relative h-[260px] w-[200px] shrink-0 cursor-pointer overflow-hidden rounded-2xl"
            >
              <img
                src={photo.src}
                alt={photo.label}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-40 transition-opacity duration-300 group-hover:opacity-60" />
              <div className="absolute right-3 bottom-3 left-3">
                <p className="text-xs font-semibold text-white">{photo.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-20 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              How it works
            </p>
            <h2 className="font-serif text-4xl text-foreground">Capture first. Structure later.</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {howItWorksSteps.map((step, i) => (
              <Card
                key={step.num}
                className="relative border-none bg-transparent shadow-none ring-0"
              >
                <CardContent className="p-0">
                  <div className="mb-4 flex items-start gap-4">
                    <div
                      className={cn(
                        "flex size-11 shrink-0 items-center justify-center rounded-xl",
                        step.iconClass,
                      )}
                    >
                      {step.icon}
                    </div>
                    <span className="mt-1 text-5xl font-bold text-border">{step.num}</span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                  {i < 2 && (
                    <div className="absolute top-5 right-0 hidden translate-x-1/2 md:block">
                      <ChevronRight size={18} className="text-border" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* BEFORE / AFTER SECTION */}
      <section className="px-6 py-16 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              The problem
            </p>
            <h2 className="font-serif text-4xl text-foreground">Sound familiar?</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="border-red-200 bg-red-50 ring-red-200/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="text-lg">😩</span>
                  Before Wayfarer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "14 open browser tabs for flights, hotels, and activities",
                    "WhatsApp messages from friends buried under memes",
                    "A Notion doc that never quite captures the feeling",
                    "Booking.com & Google Flights links sent to yourself",
                    "Printed itinerary immediately out of date",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-stone-600">
                      <span className="mt-0.5 shrink-0 text-red-400">✗</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 bg-emerald-50 ring-emerald-200/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="text-lg">😌</span>
                  With Wayfarer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "One canvas with every detail, spatially organized",
                    "WhatsApp tips auto-pinned as sticky notes",
                    "Flight & hotel cards with full details extracted",
                    "Days cluster naturally — see the whole trip at once",
                    "Live canvas updates as plans evolve",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-stone-600">
                      <span className="mt-0.5 shrink-0 text-emerald-500">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-muted px-6 py-20 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Features
              </p>
              <h2 className="mb-8 font-serif text-4xl text-foreground">
                Designed for how
                <br />
                people actually plan.
              </h2>
              <div className="space-y-6">
                {features.map((f) => (
                  <div key={f.title} className="flex gap-4">
                    <div
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg",
                        f.bg,
                        f.color,
                      )}
                    >
                      {f.icon}
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold text-foreground">{f.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {featureGridItems.map((item) => (
                <Card key={item.label} className={cn("border", item.className)}>
                  <CardContent className="p-4">
                    <span className="mb-2 block text-2xl">{item.emoji}</span>
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.count}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <PricingSection />

      {/* TESTIMONIALS */}
      <section className="px-6 py-20 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Early access
            </p>
            <h2 className="font-serif text-4xl text-foreground">Travelers love it.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name}>
                <CardContent className="pt-6">
                  <div className="mb-4 flex gap-1">
                    {[...Array(5)].map((_, si) => (
                      <Star key={si} size={13} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="mb-5 text-sm leading-relaxed text-muted-foreground">{t.text}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{t.avatar}</span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="dark bg-background px-6 py-24 md:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-8 flex size-12 items-center justify-center rounded-2xl bg-primary">
            <Compass size={24} className="text-primary-foreground" />
          </div>
          <h2 className="mb-5 font-serif text-4xl text-foreground md:text-5xl">
            Ready to plan your next trip
            <br />
            without the chaos?
          </h2>
          <p className="mb-10 text-lg leading-relaxed text-muted-foreground">
            Join 4,200+ travelers who've traded browser tabs for a canvas.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={onEnterDemo} size="lg" className="h-auto px-8 py-4">
              Try the live demo <ArrowRight size={16} />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-auto border-stone-700 px-8 py-4 text-muted-foreground"
            >
              <Lock size={14} /> Request early access
            </Button>
          </div>
          <p className="mt-6 text-xs text-muted-foreground/80">
            No credit card · Private by default · Free beta
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="dark flex items-center justify-between border-t border-border bg-background px-6 py-8 text-xs text-muted-foreground md:px-12">
        <div className="flex items-center gap-2">
          <Compass size={13} className="text-primary" />
          <span>Wayfarer · 2024</span>
        </div>
        <div className="flex gap-6">
          <a href="#" className="transition-colors hover:text-foreground">
            Privacy
          </a>
          <a href="#" className="transition-colors hover:text-foreground">
            Terms
          </a>
          <a href="#" className="transition-colors hover:text-foreground">
            Twitter
          </a>
        </div>
      </footer>
    </div>
  );
}

function messageBubbleClass(role: "user" | "ai") {
  return cn(
    "max-w-xs rounded-xl border px-3 py-2 text-xs leading-relaxed text-foreground",
    role === "user" ? "border-border bg-muted" : "border-amber-200 bg-amber-100",
  );
}

function AiAvatar() {
  return (
    <div className="mt-0.5 mr-2 flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-100">
      <Sparkles size={11} className="text-primary" />
    </div>
  );
}

// --- Sub-component: Live Chat Preview in Hero ---
function LiveChatPreview({
  messages,
  msgIdx,
  typedText,
  showCanvas,
}: {
  messages: typeof chatMessages;
  msgIdx: number;
  typedText: string;
  showCanvas: boolean;
}) {
  return (
    <div className="relative">
      {/* Chat panel */}
      <div
        className={cn(
          "overflow-hidden rounded-2xl border border-border bg-card shadow-lg transition-all duration-700",
          showCanvas ? "pointer-events-none absolute inset-0 scale-95 opacity-0" : "opacity-100",
        )}
      >
        {/* Chat header */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <div className="flex gap-1.5">
            <div className="size-3 rounded-full bg-red-400" />
            <div className="size-3 rounded-full bg-amber-400" />
            <div className="size-3 rounded-full bg-emerald-400" />
          </div>
          <span className="ml-2 text-xs text-muted-foreground">7 Days in Kyoto · Inbox</span>
          <div className="ml-auto flex items-center gap-1 text-xs text-primary">
            <Sparkles size={11} />
            AI active
          </div>
        </div>

        {/* Messages */}
        <div className="min-h-[280px] space-y-3 p-4">
          {messages.slice(0, msgIdx).map((msg, i) => (
            <div
              key={i}
              className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
            >
              {msg.role === "ai" && <AiAvatar />}
              <div className={messageBubbleClass(msg.role)}>{msg.text}</div>
            </div>
          ))}

          {/* Currently typing */}
          {msgIdx < messages.length && (
            <div
              className={cn(
                "flex",
                messages[msgIdx].role === "user" ? "justify-end" : "justify-start",
              )}
            >
              {messages[msgIdx].role === "ai" && <AiAvatar />}
              <div className={messageBubbleClass(messages[msgIdx].role)}>
                {typedText}
                <span className="cursor-blink">|</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 border-t border-border px-4 py-3">
          <div className="flex-1 rounded-lg border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
            Paste a link or message…
          </div>
          <Button size="icon-sm" className="shrink-0">
            <ArrowRight size={13} />
          </Button>
        </div>
      </div>

      {/* Canvas preview (after typing) */}
      <div
        className={cn(
          "transition-all duration-700",
          showCanvas
            ? "scale-100 opacity-100"
            : "pointer-events-none absolute inset-0 scale-105 opacity-0",
        )}
      >
        <div className="canvas-bg relative h-[380px] overflow-hidden rounded-2xl border border-border shadow-lg">
          {/* Mini canvas cards */}
          <div className="absolute top-4 left-3 -rotate-1.5">
            <MiniCard
              label="JAL JL69 · SFO→KIX"
              sub="Dec 14 · $743"
              icon="✈️"
              tagClass="bg-amber-100 text-primary"
              tag="Day 1"
            />
          </div>
          <div className="absolute top-2 left-[44%] rotate-1">
            <MiniCard
              label="Hiiragiya Ryokan"
              sub="¥45,000/night · 4.9★"
              icon="🏯"
              hasImg
              imgSrc="/images/ryokan.jpg"
              tagClass="bg-rose-100 text-rose-700"
              tag="Stay"
            />
          </div>
          <div className="absolute top-[52%] left-2.5 -rotate-2">
            <MiniCard
              label="Fushimi Inari"
              sub="5am · No crowds"
              icon="⛩️"
              hasImg
              imgSrc="/images/fushimi-inari.jpg"
              tagClass="bg-orange-100 text-orange-700"
              tag="Day 2"
            />
          </div>
          <div className="absolute top-1/2 left-[42%] rotate-2">
            <StickyMini text='"Go at 5am!!" — Yuki 🌅' />
          </div>
          <div className="absolute top-[22%] left-[68%] rotate-1.5">
            <MiniCard
              label="Arashiyama Bamboo"
              sub="Day 3 · Morning"
              icon="🌿"
              hasImg
              imgSrc="/images/arashiyama.jpg"
              tagClass="bg-emerald-100 text-emerald-800"
              tag="Day 3"
            />
          </div>

          {/* Connection lines */}
          <svg className="ink-line pointer-events-none absolute inset-0 h-full w-full">
            <line x1="22%" y1="22%" x2="45%" y2="15%" opacity="0.7" />
            <line x1="20%" y1="65%" x2="43%" y2="60%" opacity="0.7" />
          </svg>

          {/* AI label */}
          <Badge
            variant="outline"
            className="absolute top-3 right-3 gap-1 border-amber-200 bg-amber-100 text-primary"
          >
            <Sparkles size={10} />
            Organized by AI
          </Badge>
        </div>
      </div>

      {/* Toggle hint */}
      {showCanvas && (
        <div className="mt-3 text-center">
          <span className="text-xs text-muted-foreground">
            Canvas auto-generated from your 3 pastes ↑
          </span>
        </div>
      )}
    </div>
  );
}

function MiniCard({
  label,
  sub,
  icon,
  hasImg,
  imgSrc,
  tag,
  tagClass,
}: {
  label: string;
  sub: string;
  icon: string;
  hasImg?: boolean;
  imgSrc?: string;
  tag: string;
  tagClass: string;
}) {
  return (
    <div className="w-[155px] rounded-lg bg-card p-2 polaroid-shadow">
      {hasImg && imgSrc && (
        <div className="mb-1.5 h-14 w-full overflow-hidden rounded bg-border">
          <img src={imgSrc} alt={label} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="flex items-start gap-1">
        <span className="text-xs">{icon}</span>
        <div>
          <p className="text-xs leading-tight font-semibold text-foreground">{label}</p>
          <p className="text-xs leading-tight text-muted-foreground">{sub}</p>
        </div>
      </div>
      <span className={cn("mt-1.5 inline-block rounded-full px-1.5 py-0.5 text-[10px]", tagClass)}>
        {tag}
      </span>
    </div>
  );
}

function StickyMini({ text }: { text: string }) {
  return (
    <div className="sticky-shadow w-[140px] rounded-lg bg-amber-100 px-2.5 py-2">
      <p className="text-xs leading-relaxed text-foreground">{text}</p>
    </div>
  );
}
