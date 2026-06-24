import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { localTripRepository } from "@/models/tripRepository";
import { createEmptyTrip } from "@/models/trip";
import type { Trip } from "@/models/trip";
import { buildInboxItem } from "@/models/tripWorkspaceModel";
import { computeStatusCounts, filterTripsByStatus } from "@/utils/tripListHelpers";
import { ChatHistorySidebar } from "./trip-list/ChatHistorySidebar";
import { CreateTripDialog } from "./trip-list/CreateTripDialog";
import { TripGrid } from "./trip-list/TripGrid";
import { TripListFilters } from "./trip-list/TripListFilters";
import { TripListHeader } from "./trip-list/TripListHeader";
import { TripPromptBar } from "./trip-list/TripPromptBar";
import { buildTripListPromptResult } from "./trip-list/tripListIntent";
import type { ChatMessage, TripStatusFilter } from "./trip-list/types";

export default function TripListPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [showNewTripModal, setShowNewTripModal] = useState(false);
  const [promptValue, setPromptValue] = useState("");
  const [promptFocused, setPromptFocused] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<TripStatusFilter>("all");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);

  useEffect(() => {
    setTrips(localTripRepository.list());
  }, []);

  const refreshTrips = () => {
    setTrips(localTripRepository.list());
  };

  const handleCreateTrip = (
    name: string,
    destination: string,
    emoji: string,
    dates?: { start: string; end: string },
    initialInboxItemContent?: string,
  ) => {
    const newTrip = createEmptyTrip(name, destination, emoji, dates);
    if (initialInboxItemContent) {
      newTrip.inboxItems = [buildInboxItem(initialInboxItemContent)];
    }
    localTripRepository.save(newTrip);
    refreshTrips();
    setShowNewTripModal(false);
    navigate(`/trips/${newTrip.id}`);
  };

  const handleDeleteTrip = (trip: Trip) => {
    localTripRepository.delete(trip.id);
    refreshTrips();
  };

  const handlePromptSubmit = async (event?: FormEvent, overrideValue?: string) => {
    if (event) event.preventDefault();
    const value = overrideValue !== undefined ? overrideValue : promptValue;
    if (!value.trim()) return;

    setPromptValue("");
    setChatMessages((previous) => [
      ...previous,
      { role: "user", content: value, id: `msg-${Date.now()}` },
    ]);
    setIsProcessing(true);
    setShowChatHistory(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const { trip, aiResponse } = buildTripListPromptResult(value);
    localTripRepository.save(trip);
    refreshTrips();
    setChatMessages((previous) => [
      ...previous,
      { role: "ai", content: aiResponse, id: `msg-${Date.now() + 1}` },
    ]);
    setIsProcessing(false);
  };

  const clearChat = () => {
    setChatMessages([]);
    setShowChatHistory(false);
  };

  const counts = computeStatusCounts(trips);
  const filteredTrips = filterTripsByStatus(trips, selectedFilter);

  return (
    <div className="dark flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground selection:bg-primary/30">
      <TripListHeader
        chatCount={Math.ceil(chatMessages.length / 2)}
        showChatHistory={showChatHistory}
        onBack={() => navigate("/")}
        onToggleChat={() => setShowChatHistory((visible) => !visible)}
        onCreateTrip={() => setShowNewTripModal(true)}
      />

      <div className="relative flex flex-1 overflow-hidden">
        <AnimatePresence>
          {showChatHistory && (
            <ChatHistorySidebar
              messages={chatMessages}
              isProcessing={isProcessing}
              onClear={clearChat}
              onClose={() => setShowChatHistory(false)}
            />
          )}
        </AnimatePresence>

        <div className="relative flex flex-1 flex-col overflow-hidden bg-background">
          <TripListFilters
            counts={counts}
            selectedFilter={selectedFilter}
            onSelectedFilterChange={setSelectedFilter}
          />

          <TripGrid
            trips={trips}
            filteredTrips={filteredTrips}
            selectedFilter={selectedFilter}
            onCreateTrip={() => setShowNewTripModal(true)}
            onShowAllTrips={() => setSelectedFilter("all")}
            onOpenTrip={(trip) => navigate(`/trips/${trip.id}`)}
            onDeleteTrip={handleDeleteTrip}
          />

          <TripPromptBar
            promptValue={promptValue}
            promptFocused={promptFocused}
            onPromptValueChange={setPromptValue}
            onPromptFocusedChange={setPromptFocused}
            onSubmit={handlePromptSubmit}
          />
        </div>
      </div>

      <CreateTripDialog
        open={showNewTripModal}
        onOpenChange={setShowNewTripModal}
        onSubmit={handleCreateTrip}
      />
    </div>
  );
}
