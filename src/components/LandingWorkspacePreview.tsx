import { useMemo, useState } from "react";
import {
  Calendar,
  ChevronRight,
  CircleCheck,
  Clock,
  Grid3x3,
  Lock,
  MapPin,
  Maximize2,
  Plus,
  Send,
  Share2,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  ArticleCard,
  CanvasCardRenderer,
  FlightCard,
  HotelCard,
  PolaroidCard,
  StickyCard,
} from "./CanvasCards";
import { TripMapView, WorkspaceViewSwitcher, type WorkspaceView } from "./TripWorkspaceViews";
import { createDemoTrip } from "../data/tripData";
import type { CanvasCard } from "../models/trip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const previewId = (name: string) => `landing-preview-${name}`;

const kanbanColumns: {
  label: string;
  dotClass: string;
  cardCount: string;
  cards: CanvasCard[];
}[] = [
  {
    label: "Day 1 — Arrival",
    dotClass: "bg-amber-500",
    cardCount: "3 cards",
    cards: [
      {
        id: previewId("flight"),
        type: "flight",
        x: 0,
        y: 0,
        rotation: 0,
        title: "Flight",
        subtitle: "Dec 14 · Departs 11:05am · 12h 40m nonstop",
        tag: "Day 1 · Arrival",
        tagColor: "amber",
        price: "$743",
        day: 1,
      },
      {
        id: previewId("ryokan"),
        type: "hotel",
        x: 0,
        y: 0,
        rotation: 0,
        title: "Hiiragiya Ryokan",
        subtitle: "Dec 14–17 · ¥45,000/night · 4.9★",
        image: "/images/ryokan.jpg",
        tag: "Stay",
        tagColor: "amber",
        day: 1,
      },
      {
        id: previewId("pack-light"),
        type: "sticky",
        x: 0,
        y: 0,
        rotation: 0,
        title: "Pack light!",
        subtitle: "Ryokan provides yukata & toiletries. Just bring camera + layers.",
        color: "#fef3c7",
        day: 1,
      },
    ],
  },
  {
    label: "Day 2 — Fushimi Inari + Gion",
    dotClass: "bg-primary",
    cardCount: "3 cards",
    cards: [
      {
        id: previewId("fushimi"),
        type: "polaroid",
        x: 0,
        y: 0,
        rotation: 0,
        title: "Fushimi Inari",
        subtitle: "Go at 5am — Yuki",
        image: "/images/fushimi-inari.jpg",
        tag: "Day 2",
        tagColor: "orange",
        day: 2,
      },
      {
        id: previewId("yuki"),
        type: "sticky",
        x: 0,
        y: 0,
        rotation: 0,
        title: "Yuki says:",
        subtitle: '"Go at 5am!! The light through the torii is incredible and zero tourists 🌅"',
        color: "#fef3c7",
        day: 2,
      },
      {
        id: previewId("nishiki"),
        type: "article",
        x: 0,
        y: 0,
        rotation: 0,
        title: "Nishiki Market",
        subtitle: "Kyoto's kitchen — street food heaven",
        image: "/images/nishiki-market.jpg",
        tag: "Day 2",
        tagColor: "orange",
        day: 2,
      },
    ],
  },
  {
    label: "Day 3 — Arashiyama",
    dotClass: "bg-emerald-500",
    cardCount: "3 cards",
    cards: [
      {
        id: previewId("arashiyama"),
        type: "polaroid",
        x: 0,
        y: 0,
        rotation: 0,
        title: "Arashiyama Bamboo",
        subtitle: "Early morning walk",
        image: "/images/arashiyama.jpg",
        tag: "Day 3",
        tagColor: "orange",
        day: 3,
      },
      {
        id: previewId("jr-pass"),
        type: "sticky",
        x: 0,
        y: 0,
        rotation: 0,
        title: "JR Pass ✓",
        subtitle: "Arashiyama is covered! Take the Sagano Scenic Railway.",
        color: "#d1fae5",
        day: 3,
      },
      {
        id: previewId("tenryu"),
        type: "article",
        x: 0,
        y: 0,
        rotation: 0,
        title: "Tenryu-ji Garden",
        subtitle: "UNESCO World Heritage · Zen garden with Arashiyama mountain backdrop",
        tag: "Day 3 · Must-see",
        tagColor: "orange",
        day: 3,
      },
    ],
  },
  {
    label: "Day 4 — Gion + Logistics",
    dotClass: "bg-rose-500",
    cardCount: "4 cards",
    cards: [
      {
        id: previewId("gion"),
        type: "polaroid",
        x: 0,
        y: 0,
        rotation: 0,
        title: "Gion at Dusk",
        subtitle: "Traditional machiya district",
        image: "/images/gion.jpg",
        tag: "Day 4",
        tagColor: "orange",
        day: 4,
      },
      {
        id: previewId("dinner"),
        type: "sticky",
        x: 0,
        y: 0,
        rotation: 0,
        title: "Dinner: Junsei",
        subtitle: "Tofu kaiseki near Nanzenji. Book 2 weeks ahead!",
        color: "#ffe4e6",
        day: 4,
      },
      {
        id: previewId("wifi"),
        type: "note",
        x: 0,
        y: 0,
        rotation: 0,
        title: "Pocket WiFi",
        subtitle: "Pick up at KIX airport · ¥600/day · Pre-book online",
        day: 4,
      },
    ],
  },
];

function PreviewCard({ card }: { card: CanvasCard }) {
  switch (card.type) {
    case "flight":
      return <FlightCard card={card} embedded />;
    case "hotel":
      return <HotelCard card={card} embedded />;
    case "sticky":
      return <StickyCard card={card} embedded />;
    case "polaroid":
      return <PolaroidCard card={card} embedded />;
    case "article":
      return <ArticleCard card={card} embedded />;
    default:
      return <CanvasCardRenderer card={card} embedded />;
  }
}

function BrowserChrome({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 border-b border-[#e7e3dc] bg-background",
        compact ? "h-10 px-3" : "h-11 px-4",
      )}
    >
      <div className="flex gap-1.5">
        <div className="size-2.5 rounded-full bg-red-400" />
        <div className="size-2.5 rounded-full bg-amber-400" />
        <div className="size-2.5 rounded-full bg-emerald-400" />
      </div>
      <div
        className={cn(
          "flex items-center gap-1.5 rounded-full bg-muted",
          compact ? "h-[22px] flex-1 px-2.5" : "h-[26px] min-w-0 flex-1 px-3 md:w-[300px] md:flex-none",
        )}
      >
        <Lock className="size-2.5 shrink-0 text-muted-foreground" />
        <span className="truncate text-[11px] text-muted-foreground md:text-xs">
          wayfarer.app/trips/kyoto
        </span>
      </div>
      {!compact && (
        <>
          <div className="hidden flex-1 md:block" />
          <Share2 className="hidden size-4 text-muted-foreground md:block" />
        </>
      )}
    </div>
  );
}

function InboxPreview() {
  return (
    <aside className="hidden w-[280px] shrink-0 flex-col border-r border-[#e7e3dc] bg-[#fefcf8] md:flex">
      <div className="space-y-1 border-b border-[#e7e3dc] px-4 pb-3 pt-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-stone-800">Inbox</p>
          <Badge
            variant="outline"
            className="gap-1 rounded-full border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-normal text-amber-800"
          >
            <Sparkles className="size-2.5" />
            AI active
          </Badge>
        </div>
        <p className="text-xs leading-snug text-stone-500">
          Paste links, messages, or notes — Wayfarer will organize them on the canvas.
        </p>
      </div>

      <div className="border-b border-[#f5f3ef] p-3">
        <div className="relative min-h-[76px] rounded-xl border-[1.5px] border-[#e7e3dc] bg-[#f5f3ef] p-3">
          <p className="text-xs text-stone-400">Try: &quot;Top 7 hidden Kyoto temples...&quot;</p>
          <div className="absolute bottom-2 right-2 flex size-7 items-center justify-center rounded-lg bg-[#e7e3dc]">
            <Send className="size-3 text-stone-500" />
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-hidden p-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold tracking-wide text-stone-500">TO ORGANIZE</p>
            <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">
              4
            </span>
          </div>
          <div className="rounded-lg border border-[#e7e3dc] bg-background p-3">
            <p className="text-sm font-semibold text-stone-800">Reddit · r/JapanTravel</p>
            <p className="mt-1 text-xs leading-relaxed text-stone-500">
              Hidden gems in Higashiyama — locals share their favorites
            </p>
            <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-[#e7e3dc] bg-[#f5f3ef] px-3 py-2">
              <span className="text-xs font-medium text-amber-800">Place on canvas</span>
              <ChevronRight className="size-2.5 text-amber-800" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold tracking-wide text-stone-500">ON CANVAS</p>
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-800">
              3
            </span>
          </div>
          <div className="rounded-lg border border-[#e7e3dc] bg-background p-3 opacity-80">
            <p className="text-sm font-semibold text-stone-800">Fushimi Inari at sunrise</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="flex items-center gap-1 text-xs text-emerald-600">
                <CircleCheck className="size-2.5" />
                Added to canvas
              </span>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 font-mono text-[9px] text-amber-800">
                34.967, 135.772
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#e7e3dc] bg-[#faf9f7] px-4 py-3">
        <span className="text-xs text-stone-500">7 items total</span>
        <span className="flex items-center gap-1 text-xs font-medium text-amber-800">
          <Plus className="size-3" />
          Add manually
        </span>
      </div>
    </aside>
  );
}

function KanbanColumn({
  label,
  dotClass,
  cardCount,
  cards,
  showAddCard = false,
  className,
}: {
  label: string;
  dotClass: string;
  cardCount: string;
  cards: CanvasCard[];
  showAddCard?: boolean;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex w-[255px] shrink-0 flex-col gap-2.5 rounded-xl border border-[#e7e3dc] bg-[#fefcf8] p-2.5",
        className,
      )}
    >
      <div className="flex items-center gap-2 px-1">
        <span className={cn("size-2 rounded-full", dotClass)} />
        <p className="text-xs font-semibold text-stone-800">{label}</p>
      </div>
      <p className="px-1 text-[11px] font-medium text-stone-500">{cardCount}</p>
      <div className="flex flex-col gap-2.5">
        {cards.map((card) => (
          <PreviewCard key={card.id} card={card} />
        ))}
        {showAddCard && (
          <div className="flex items-center gap-1.5 px-1 py-1 text-xs text-stone-400">
            <div className="flex size-9 items-center justify-center rounded-xl border-2 border-dashed border-stone-300">
              <Plus className="size-4" />
            </div>
            Add card
          </div>
        )}
      </div>
    </section>
  );
}

function PreviewAiPromptBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border-[1.5px] border-[#e7e3dc] bg-[#fefcf8] p-3 shadow-md",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <Sparkles className="size-3.5 shrink-0 text-amber-800" />
        <p className="flex-1 text-xs text-stone-500">Ask AI about this trip…</p>
        <Button type="button" size="icon" className="size-8 shrink-0 rounded-md" disabled tabIndex={-1}>
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function PreviewWorkspaceChrome({
  view,
  onViewChange,
}: {
  view: WorkspaceView;
  onViewChange: (view: WorkspaceView) => void;
}) {
  const canvasToolbar = (
    <div
      className="flex items-center gap-1 rounded-xl border border-[#e7e3dc] bg-[#fefcf8] p-1 shadow-sm"
      aria-hidden="true"
    >
      <Button type="button" variant="ghost" size="icon" className="size-7 rounded-lg" disabled tabIndex={-1}>
        <ZoomIn className="size-3.5 text-stone-500" />
      </Button>
      <Button type="button" variant="ghost" size="icon" className="size-7 rounded-lg" disabled tabIndex={-1}>
        <ZoomOut className="size-3.5 text-stone-500" />
      </Button>
      <div className="mx-0.5 h-4 w-px bg-[#e7e3dc]" />
      <Button type="button" variant="ghost" size="icon" className="size-7 rounded-lg" disabled tabIndex={-1}>
        <Maximize2 className="size-3.5 text-stone-500" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 rounded-lg bg-amber-50"
        disabled
        tabIndex={-1}
      >
        <Grid3x3 className="size-3.5 text-amber-800" />
      </Button>
      <span className="px-1 font-mono text-xs text-stone-500">100%</span>
    </div>
  );

  const tripMetadata = (
    <div className="flex max-w-[min(100%,20rem)] shrink-0 items-center gap-1.5 overflow-hidden rounded-xl border border-[#e7e3dc] bg-[#fefcf8] px-2 py-1.5 shadow-sm md:gap-2 md:px-2.5 md:py-2 lg:max-w-none lg:gap-2.5 lg:px-3">
      <span className="flex shrink-0 items-center gap-1 truncate text-xs text-stone-500">
        <Calendar className="size-3 shrink-0" />
        <span className="truncate">Dec 14–21, 2025</span>
      </span>
      <div className="h-3 w-px shrink-0 bg-[#e7e3dc]" />
      <span className="flex shrink-0 items-center gap-1 truncate text-xs text-stone-500">
        <MapPin className="size-3 shrink-0" />
        <span className="truncate">Kyoto, Japan</span>
      </span>
      <div className="h-3 w-px shrink-0 bg-[#e7e3dc]" />
      <span className="flex shrink-0 items-center gap-1 text-xs text-stone-500">
        <Clock className="size-3 shrink-0" />
        7 nights
      </span>
    </div>
  );

  return (
    <div className="absolute inset-x-3 top-3 z-10">
      <div className="flex w-full items-center gap-2">
        <div
          className={cn(
            "hidden shrink-0 md:block",
            view !== "canvas" && "pointer-events-none invisible",
          )}
        >
          {canvasToolbar}
        </div>

        <div className="flex min-w-0 flex-1 justify-center px-1">
          <WorkspaceViewSwitcher value={view} onValueChange={onViewChange} />
        </div>

        <div className="hidden shrink-0 md:block">{tripMetadata}</div>
      </div>
    </div>
  );
}

function DesktopWorkspacePreview({
  view,
  onViewChange,
  selectedCard,
  onSelectCard,
  demoTrip,
}: {
  view: WorkspaceView;
  onViewChange: (view: WorkspaceView) => void;
  selectedCard: CanvasCard | null;
  onSelectCard: (card: CanvasCard) => void;
  demoTrip: ReturnType<typeof createDemoTrip>;
}) {
  return (
    <div className="relative hidden min-h-0 flex-1 flex-col bg-[#f5f3ef] md:flex">
      <PreviewWorkspaceChrome view={view} onViewChange={onViewChange} />

      <div className="flex min-h-0 flex-1 flex-col pt-14">
        {view === "canvas" ? (
          <>
            <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden px-10 pb-28 pt-2">
              <div className="flex h-full min-w-max gap-3">
                {kanbanColumns.map((column, index) => (
                  <KanbanColumn
                    key={column.label}
                    {...column}
                    showAddCard={index === kanbanColumns.length - 1}
                  />
                ))}
              </div>
            </div>

            <PreviewAiPromptBar className="absolute bottom-4 left-1/2 z-10 w-[min(512px,calc(100%-2rem))] -translate-x-1/2" />
          </>
        ) : (
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <TripMapView
              days={demoTrip.days}
              cards={demoTrip.cards}
              activeDay={null}
              selectedCard={selectedCard}
              onSelectCard={onSelectCard}
              showRoutePanel={false}
              interactive={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function MobileWorkspacePreview({
  view,
  onViewChange,
  selectedCard,
  onSelectCard,
  demoTrip,
}: {
  view: WorkspaceView;
  onViewChange: (view: WorkspaceView) => void;
  selectedCard: CanvasCard | null;
  onSelectCard: (card: CanvasCard) => void;
  demoTrip: ReturnType<typeof createDemoTrip>;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#f5f3ef] p-3 md:hidden">
      <div className="mb-2 flex justify-center">
        <WorkspaceViewSwitcher value={view} onValueChange={onViewChange} />
      </div>

      {view === "canvas" ? (
        <>
          <div className="mb-2 flex items-center justify-between gap-2 px-1 text-[11px]">
            <span className="font-medium text-stone-500">Swipe for more days →</span>
            <span className="font-semibold text-stone-600">Day 1 of 4</span>
          </div>

          <div className="relative min-h-0 flex-1">
            <div className="h-full overflow-x-auto overflow-y-hidden pb-2">
              <div className="flex h-full min-w-max gap-2.5">
                {kanbanColumns.map((column, index) => (
                  <KanbanColumn
                    key={column.label}
                    {...column}
                    showAddCard={index === kanbanColumns.length - 1}
                    className="w-[300px]"
                  />
                ))}
              </div>
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#f5f3ef] to-transparent" />
          </div>

          <PreviewAiPromptBar className="mt-2" />
        </>
      ) : (
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-[#e7e3dc]">
          <TripMapView
            days={demoTrip.days}
            cards={demoTrip.cards}
            activeDay={null}
            selectedCard={selectedCard}
            onSelectCard={onSelectCard}
            showRoutePanel={false}
            interactive={false}
          />
        </div>
      )}
    </div>
  );
}

const featureKanbanColumns = kanbanColumns.slice(1, 3);

export function FeatureKanbanPreview() {
  return (
    <div className="relative h-full bg-[#f5f3ef]">
      <div className="h-full overflow-x-auto overflow-y-hidden p-3 md:p-4">
        <div className="flex h-full min-w-max gap-2.5 md:gap-3">
          {featureKanbanColumns.map((column) => (
            <KanbanColumn
              key={column.label}
              {...column}
              className="w-[240px] md:w-[255px]"
            />
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#f5f3ef] to-transparent" />
    </div>
  );
}

export default function LandingWorkspacePreview() {
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>("canvas");
  const [selectedCard, setSelectedCard] = useState<CanvasCard | null>(null);
  const demoTrip = useMemo(() => createDemoTrip(), []);

  return (
    <div className="mt-2 w-full max-w-[1180px] overflow-hidden rounded-2xl border border-border bg-background shadow-[0_30px_60px_rgba(12,10,9,0.15)]">
      <BrowserChrome />
      <div className="flex h-[420px] md:h-[556px]">
        <InboxPreview />
        <DesktopWorkspacePreview
          view={workspaceView}
          onViewChange={setWorkspaceView}
          selectedCard={selectedCard}
          onSelectCard={setSelectedCard}
          demoTrip={demoTrip}
        />
        <MobileWorkspacePreview
          view={workspaceView}
          onViewChange={setWorkspaceView}
          selectedCard={selectedCard}
          onSelectCard={setSelectedCard}
          demoTrip={demoTrip}
        />
      </div>
    </div>
  );
}

