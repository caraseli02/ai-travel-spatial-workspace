import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Compass,
  Plus,
  Sparkles,
  X,
  ChevronLeft,
  Filter,
  Globe,
  Plane,
  Clock3,
  CheckCircle2,
  Send,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { localTripRepository } from "../models/tripRepository";
import { createEmptyTrip } from "../models/trip";
import type { Trip } from "../models/trip";
import { buildInboxItem } from "../models/tripWorkspaceModel";
import TripCard from "./TripCard";
import {
  computeStatusCounts,
  filterTripsByStatus,
  generateTripFromMessage,
} from "../utils/tripListHelpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const EMOJI_PRESETS = [
  "🏖️",
  "🏔️",
  "🌆",
  "🏯",
  "⛷️",
  "🌴",
  "🎭",
  "✈️",
  "🚢",
  "🏕️",
  "🗺️",
  "🌸",
  "🇯🇵",
  "🇪🇸",
  "🇮🇹",
  "🇫🇷",
  "🇬🇷",
  "🇹🇭",
  "🇧🇷",
  "🇬🇧",
  "🇩🇪",
  "🇵🇹",
  "🇲🇽",
  "🇺🇸",
];

export default function TripListPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [showNewTripModal, setShowNewTripModal] = useState(false);
  const [promptValue, setPromptValue] = useState("");
  const [promptFocused, setPromptFocused] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "upcoming" | "ongoing" | "planning" | "completed"
  >("all");

  const [chatMessages, setChatMessages] = useState<
    Array<{ role: "user" | "ai"; content: string; id: string }>
  >([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTrips(localTripRepository.list());
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (showChatHistory) {
      scrollToBottom();
    }
  }, [chatMessages, showChatHistory]);

  const handleCreateTrip = (
    name: string,
    destination: string,
    emoji: string,
    dates?: { start: string; end: string },
    initialInboxItemContent?: string,
  ) => {
    const newTrip = createEmptyTrip(name, destination, emoji, dates);
    if (initialInboxItemContent) {
      const newItem = buildInboxItem(initialInboxItemContent);
      newTrip.inboxItems = [newItem];
    }
    localTripRepository.save(newTrip);
    setTrips(localTripRepository.list());
    setShowNewTripModal(false);
    navigate(`/trips/${newTrip.id}`);
  };

  const handleDeleteTrip = (id: string) => {
    localTripRepository.delete(id);
    setTrips(localTripRepository.list());
  };

  const handlePromptSubmit = async (e?: React.FormEvent, overrideValue?: string) => {
    if (e) e.preventDefault();
    const val = overrideValue !== undefined ? overrideValue : promptValue;
    if (!val.trim()) return;

    setPromptValue("");
    const userMsgId = `msg-${Date.now()}`;
    setChatMessages((prev) => [...prev, { role: "user", content: val, id: userMsgId }]);
    setIsProcessing(true);
    setShowChatHistory(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newTrip = generateTripFromMessage(val);
    localTripRepository.save(newTrip);
    setTrips(localTripRepository.list());

    const aiMsgId = `msg-${Date.now() + 1}`;
    const destinationName = newTrip.destination.split(",")[0];
    const aiResponse =
      `I've created a trip to **${destinationName}** for you!\n\n` +
      `**Dates:** ${newTrip.dates ? `${newTrip.dates.start} to ${newTrip.dates.end}` : "Flexible"}\n` +
      `**Travelers:** ${newTrip.travelers}\n` +
      `**Budget:** ${newTrip.budget}\n` +
      `**Activities:** ${newTrip.activities?.join(", ") || "Exploring sights"}\n\n` +
      `Your trip has been added to your list! Click **View Details** to open the workspace.`;

    setChatMessages((prev) => [...prev, { role: "ai", content: aiResponse, id: aiMsgId }]);
    setIsProcessing(false);
  };

  const clearChat = () => {
    setChatMessages([]);
    setShowChatHistory(false);
  };

  const counts = computeStatusCounts(trips);
  const filteredTrips = filterTripsByStatus(trips, selectedFilter);

  const suggestions = [
    "Plan a 5-day trip to Paris for 2 people",
    "Create a beach vacation to Bali",
    "Weekend getaway to Tokyo",
    "Adventure trip to Iceland",
  ];

  const tabConfig = [
    { key: "all" as const, label: "All", icon: Globe, count: counts.all },
    { key: "upcoming" as const, label: "Upcoming", icon: Plane, count: counts.upcoming },
    { key: "ongoing" as const, label: "Ongoing", icon: Compass, count: counts.ongoing },
    { key: "planning" as const, label: "Planning", icon: Clock3, count: counts.planning },
    { key: "completed" as const, label: "Completed", icon: CheckCircle2, count: counts.completed },
  ];

  return (
    <div className="dark flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground selection:bg-primary/30">
      <header className="z-20 h-16 shrink-0 border-b border-border bg-background">
        <div className="mx-auto flex h-full w-full max-w-[1344px] items-center justify-between px-12">
          <button
            onClick={() => navigate("/")}
            className="flex cursor-pointer items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary">
              <Compass className="size-4 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="text-[15px] font-semibold tracking-tight">Wayfarer</span>
          </button>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowChatHistory(!showChatHistory)}
              className={cn(showChatHistory && "bg-muted text-foreground")}
            >
              <MessageSquare className="size-4" />
              <span className="hidden sm:inline">Chat</span>
              {chatMessages.length > 0 && (
                <Badge className="size-5 justify-center rounded-full p-0 text-[10px]">
                  {Math.ceil(chatMessages.length / 2)}
                </Badge>
              )}
            </Button>

            <Button onClick={() => setShowNewTripModal(true)} size="sm">
              <Plus className="size-3.5" />
              New trip
            </Button>
          </div>
        </div>
      </header>

      <div className="relative flex flex-1 overflow-hidden">
        <AnimatePresence>
          {showChatHistory && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 380, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="z-10 flex shrink-0 flex-col overflow-hidden border-r border-border bg-sidebar"
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold text-foreground">Chat History</h2>
                <div className="flex items-center gap-1">
                  {chatMessages.length > 0 && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={clearChat}
                      title="Clear chat"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setShowChatHistory(false)}
                    className="text-muted-foreground"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </div>

              <div ref={chatScrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
                {chatMessages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center py-10 text-center">
                    <div className="mb-3 flex size-12 items-center justify-center rounded-xl border border-border bg-muted">
                      <MessageSquare className="size-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Start a conversation to plan your trips
                    </p>
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn("flex gap-3", msg.role === "user" && "flex-row-reverse")}
                    >
                      <div
                        className={cn(
                          "flex size-7 shrink-0 items-center justify-center rounded-lg",
                          msg.role === "user" ? "bg-muted" : "bg-primary",
                        )}
                      >
                        {msg.role === "user" ? (
                          <span className="text-[10px] font-bold text-muted-foreground">You</span>
                        ) : (
                          <Sparkles className="size-3.5 text-primary-foreground" />
                        )}
                      </div>
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                          msg.role === "user"
                            ? "bg-muted text-foreground"
                            : "border border-border bg-card text-muted-foreground",
                        )}
                      >
                        {msg.content.split("\n").map((line, i) => {
                          const parts = line.split(/\*\*(.*?)\*\*/g);
                          return (
                            <span key={i}>
                              {parts.map((part, index) => {
                                if (index % 2 === 1) {
                                  return (
                                    <strong key={index} className="font-semibold text-foreground">
                                      {part}
                                    </strong>
                                  );
                                }
                                return part;
                              })}
                              {i < msg.content.split("\n").length - 1 && <br />}
                            </span>
                          );
                        })}
                      </div>
                    </motion.div>
                  ))
                )}
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary">
                      <Sparkles className="size-3.5 animate-pulse text-primary-foreground" />
                    </div>
                    <div className="rounded-2xl border border-border bg-card px-4 py-3">
                      <div className="flex gap-1">
                        <span
                          className="size-2 animate-bounce rounded-full bg-muted-foreground"
                          style={{ animationDelay: "0ms" }}
                        />
                        <span
                          className="size-2 animate-bounce rounded-full bg-muted-foreground"
                          style={{ animationDelay: "150ms" }}
                        />
                        <span
                          className="size-2 animate-bounce rounded-full bg-muted-foreground"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative flex flex-1 flex-col overflow-hidden bg-background">
          <div className="shrink-0 border-b border-border bg-background">
            <div className="mx-auto flex w-full max-w-[1344px] items-center gap-2.5 overflow-x-auto px-12 py-4">
              <Button variant="outline" size="icon" className="shrink-0" aria-hidden>
                <Filter className="size-4 text-muted-foreground" />
              </Button>

              <div className="flex items-center gap-2">
                {tabConfig.map((tab) => {
                  const active = selectedFilter === tab.key;
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setSelectedFilter(tab.key)}
                      className={cn(
                        "group flex cursor-pointer items-center gap-2 rounded-full border py-1 pr-1 pl-2 text-xs whitespace-nowrap transition-all",
                        active
                          ? "border-border bg-accent font-semibold text-foreground"
                          : "border-transparent bg-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                      )}
                    >
                      <TabIcon
                        className={cn(
                          "size-3.5",
                          active
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground",
                        )}
                      />
                      <span>{tab.label}</span>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "h-5 min-w-5 justify-center px-1.5 text-[10px]",
                          !active && "bg-transparent text-muted-foreground",
                        )}
                      >
                        {tab.count}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="@container flex-1 overflow-y-auto bg-background pt-8 pb-40">
            <div className="mx-auto w-full max-w-[1344px] px-12">
              <div className="grid grid-cols-1 gap-6 pb-24 @2xl:grid-cols-2 @5xl:grid-cols-3">
                <motion.div layout onClick={() => setShowNewTripModal(true)}>
                  <Card
                    className="group h-full min-h-[420px] cursor-pointer border-2 border-dashed border-border/60 bg-white/[0.01] py-0 ring-0 transition-all duration-300 hover:border-primary/40 hover:bg-muted/30"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setShowNewTripModal(true);
                      }
                    }}
                  >
                    <CardContent className="flex h-full min-h-[420px] flex-col items-center justify-center gap-4 p-6 text-center">
                      <Button
                        variant="outline"
                        size="icon"
                        className="pointer-events-none shrink-0"
                        tabIndex={-1}
                        aria-hidden
                      >
                        <Plus className="size-4" />
                      </Button>
                      <div className="space-y-1.5">
                        <span className="block text-sm font-semibold text-foreground">
                          New Trip
                        </span>
                        <p className="mx-auto max-w-[170px] text-xs leading-relaxed text-muted-foreground">
                          Start planning your next destination
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {trips.length === 0 && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Card className="h-full min-h-[420px] border-border bg-card py-0">
                      <CardContent className="flex h-full min-h-[420px] flex-col justify-between p-8">
                        <div className="space-y-6">
                          <Button
                            size="icon"
                            className="pointer-events-none shrink-0"
                            tabIndex={-1}
                            aria-hidden
                          >
                            <Sparkles className="size-4" />
                          </Button>
                          <div className="space-y-2">
                            <h3 className="text-base font-bold text-foreground">Plan with AI</h3>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                              Describe your dream journey in the search bar below. Tell Wayfarer
                              where you want to go, who you are traveling with, and what you&apos;d
                              love to see.
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="w-fit border-primary/30 text-[10px] font-semibold tracking-widest text-primary uppercase"
                        >
                          AI-Powered Planning
                        </Badge>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {filteredTrips.length === 0 && selectedFilter !== "all" && trips.length > 0 && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Card className="h-full min-h-[420px] border-border bg-card py-0">
                      <CardContent className="flex h-full min-h-[420px] flex-col justify-between p-8">
                        <div className="space-y-6">
                          <Button
                            variant="outline"
                            size="icon"
                            className="pointer-events-none shrink-0"
                            tabIndex={-1}
                            aria-hidden
                          >
                            <Compass className="size-4 text-muted-foreground" />
                          </Button>
                          <div className="space-y-2">
                            <h3 className="text-base font-bold text-muted-foreground">
                              No {selectedFilter} trips
                            </h3>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                              There are currently no travel plans matching the &ldquo;
                              {selectedFilter}
                              &rdquo; status filter. Select another filter tab above to view other
                              trips.
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedFilter("all")}
                          className="w-fit"
                        >
                          Show all trips
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                <AnimatePresence mode="popLayout">
                  {filteredTrips.map((trip, idx) => {
                    const isNew = Date.now() - new Date(trip.createdAt).getTime() < 15000;
                    return (
                      <motion.div
                        key={trip.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className="h-full"
                      >
                        <TripCard
                          trip={trip}
                          index={idx}
                          isNew={isNew}
                          onOpen={() => navigate(`/trips/${trip.id}`)}
                          onDelete={() => handleDeleteTrip(trip.id)}
                        />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="absolute right-0 bottom-0 left-0 z-40 px-12 pb-6">
            <div className="mx-auto flex w-full max-w-[672px] flex-col gap-3">
              <div className="scrollbar-none -mx-4 flex flex-nowrap items-center justify-start gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0 md:pb-1">
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handlePromptSubmit(undefined, suggestion)}
                  >
                    <Badge
                      variant="outline"
                      className="cursor-pointer px-4 py-2 text-[11px] font-medium whitespace-nowrap shadow-sm transition-all hover:bg-muted hover:text-foreground active:scale-[0.98]"
                    >
                      {suggestion}
                    </Badge>
                  </button>
                ))}
              </div>

              <form
                onSubmit={handlePromptSubmit}
                className={cn(
                  "flex items-center gap-2 rounded-2xl border bg-card py-1 pr-1 pl-2 transition-all duration-200",
                  promptFocused ? "border-primary/50" : "border-border",
                )}
              >
                <Button
                  type="button"
                  size="icon"
                  className="pointer-events-none shrink-0"
                  tabIndex={-1}
                  aria-hidden
                >
                  <Sparkles className="size-4" />
                </Button>

                <Input
                  className="h-8 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
                  placeholder="Describe your dream trip..."
                  value={promptValue}
                  onChange={(e) => setPromptValue(e.target.value)}
                  onFocus={() => setPromptFocused(true)}
                  onBlur={() => setTimeout(() => setPromptFocused(false), 200)}
                />

                <Button
                  type="submit"
                  size="icon"
                  disabled={!promptValue.trim()}
                  className="shrink-0"
                >
                  <Send className="size-4" />
                </Button>
              </form>

              <p className="text-center text-[10px] text-muted-foreground select-none">
                AI can make mistakes. Double-check important details.
              </p>
            </div>
          </div>
        </div>
      </div>

      <NewTripDialog
        open={showNewTripModal}
        onOpenChange={setShowNewTripModal}
        onSubmit={handleCreateTrip}
      />
    </div>
  );
}

function NewTripDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    name: string,
    destination: string,
    emoji: string,
    dates?: { start: string; end: string },
  ) => void;
}) {
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [emoji, setEmoji] = useState("✈️");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const resetForm = () => {
    setName("");
    setDestination("");
    setEmoji("✈️");
    setStartDate("");
    setEndDate("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !destination.trim()) return;
    const dates = startDate && endDate ? { start: startDate, end: endDate } : undefined;
    onSubmit(name.trim(), destination.trim(), emoji, dates);
    resetForm();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) resetForm();
      }}
    >
      <DialogContent className="dark gap-0 p-0 sm:max-w-md">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle>New Trip</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Icon</Label>
            <div className="scrollbar-none flex max-h-[80px] flex-wrap gap-1.5 overflow-y-auto pr-1">
              {EMOJI_PRESETS.map((e, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={cn(
                    "flex size-8 cursor-pointer items-center justify-center rounded-lg text-sm transition-all",
                    emoji === e ? "scale-110 bg-primary/20 ring-2 ring-primary" : "hover:bg-muted",
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trip-name" className="text-xs text-muted-foreground">
              Trip Name
            </Label>
            <Input
              id="trip-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., 7 Days in Kyoto"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trip-destination" className="text-xs text-muted-foreground">
              Destination
            </Label>
            <Input
              id="trip-destination"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g., Kyoto, Japan"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Dates <span className="font-normal text-muted-foreground/70">(optional)</span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={!name.trim() || !destination.trim()}>
            Create Trip
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
