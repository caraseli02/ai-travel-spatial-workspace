import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass, Plus, Sparkles, X, ChevronLeft, Filter, Globe, Plane, Clock, CheckCircle2, Send, MessageSquare, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { localTripRepository } from '../models/tripRepository';
import { createEmptyTrip } from '../models/trip';
import type { Trip } from '../models/trip';
import { buildInboxItem } from '../models/tripMaterialIntake';
import { generateTripFromMessage } from '../models/proceduralTripGenerator';
import TripCard from './TripCard';
import { computeStatusCounts, filterTripsByStatus } from '../utils/tripListHelpers';

const EMOJI_PRESETS = ['🏖️', '🏔️', '🌆', '🏯', '⛷️', '🌴', '🎭', '✈️', '🚢', '🏕️', '🗺️', '🌸',
  '🇯🇵', '🇪🇸', '🇮🇹', '🇫🇷', '🇬🇷', '🇹🇭', '🇧🇷', '🇬🇧', '🇩🇪', '🇵🇹', '🇲🇽', '🇺🇸'];

export default function TripListPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [showNewTripModal, setShowNewTripModal] = useState(false);
  const [promptValue, setPromptValue] = useState('');
  const [promptFocused, setPromptFocused] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'planning' | 'completed'>('all');

  // AI Chat Sidebar integration
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'ai'; content: string; id: string }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTrips(localTripRepository.list());
    
    // Prevent light theme body background leakage
    const originalBg = document.body.style.backgroundColor;
    const originalColor = document.body.style.color;
    document.body.style.backgroundColor = '#0d0d0f';
    document.body.style.color = '#ffffff';

    return () => {
      document.body.style.backgroundColor = originalBg;
      document.body.style.color = originalColor;
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    initialInboxItemContent?: string
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

    setPromptValue('');
    const userMsgId = `msg-${Date.now()}`;
    setChatMessages((prev) => [...prev, { role: 'user', content: val, id: userMsgId }]);
    setIsProcessing(true);
    setShowChatHistory(true);

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newTrip = generateTripFromMessage(val);
    localTripRepository.save(newTrip);
    setTrips(localTripRepository.list());

    const aiMsgId = `msg-${Date.now() + 1}`;
    const destinationName = newTrip.destination.split(',')[0];
    const aiResponse = `I've created a trip to **${destinationName}** for you!\n\n` +
      `**Dates:** ${newTrip.dates ? `${newTrip.dates.start} to ${newTrip.dates.end}` : 'Flexible'}\n` +
      `**Travelers:** ${newTrip.travelers}\n` +
      `**Budget:** ${newTrip.budget}\n` +
      `**Activities:** ${newTrip.activities?.join(', ') || 'Exploring sights'}\n\n` +
      `Your trip has been added to your list! Click **View Details** to open the workspace.`;

    setChatMessages((prev) => [...prev, { role: 'ai', content: aiResponse, id: aiMsgId }]);
    setIsProcessing(false);
  };

  const clearChat = () => {
    setChatMessages([]);
    setShowChatHistory(false);
  };

  const counts = computeStatusCounts(trips);
  const filteredTrips = filterTripsByStatus(trips, selectedFilter);

  // Suggested dream trips
  const suggestions = [
    'Plan a 5-day trip to Paris for 2 people',
    'Create a beach vacation to Bali',
    'Weekend getaway to Tokyo',
    'Adventure trip to Iceland',
  ];

  // Helper config for status filter tabs
  const tabConfig = [
    { key: 'all' as const, label: 'All Trips', icon: Globe, count: counts.all },
    { key: 'upcoming' as const, label: 'Upcoming', icon: Plane, count: counts.upcoming },
    { key: 'ongoing' as const, label: 'Ongoing', icon: Compass, count: counts.ongoing },
    { key: 'planning' as const, label: 'Planning', icon: Clock, count: counts.planning },
    { key: 'completed' as const, label: 'Completed', icon: CheckCircle2, count: counts.completed },
  ];

  return (
    <div className="flex h-screen w-screen flex-col bg-[#0d0d0f] text-white selection:bg-violet-500/30 selection:text-white overflow-hidden">
      {/* Top navigation */}
      <header className="flex-shrink-0 border-b border-white/[0.06] bg-[#0d0d0f] z-20">
        <div className="mx-auto max-w-6xl w-full flex items-center justify-between py-4 px-4 md:px-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft size={15} />
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-violet-600">
              <Compass size={15} color="white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-white tracking-tight" style={{ fontSize: '15px' }}>Wayfarer</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowChatHistory(!showChatHistory)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all cursor-pointer ${
                showChatHistory
                  ? 'bg-white/[0.08] text-white'
                  : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Chat</span>
              {chatMessages.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-[10px] font-bold text-white">
                  {Math.ceil(chatMessages.length / 2)}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowNewTripModal(true)}
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl bg-violet-600 text-white hover:bg-violet-500 transition-all cursor-pointer shadow-lg shadow-violet-600/10 active:scale-[0.98]"
            >
              <Plus size={14} />
              <span>New Trip</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Chat History Sidebar (Left-positioned) */}
        <AnimatePresence>
          {showChatHistory && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 380, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex-shrink-0 border-r border-white/[0.06] bg-[#111114] overflow-hidden flex flex-col z-10"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                <h2 className="text-sm font-semibold text-slate-300">Chat History</h2>
                <div className="flex items-center gap-1">
                  {chatMessages.length > 0 && (
                    <button
                      onClick={clearChat}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-white/[0.06] hover:text-red-400 transition-colors cursor-pointer"
                      title="Clear chat"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setShowChatHistory(false)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-white/[0.06] hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div ref={chatScrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-10">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.06] mb-3">
                      <MessageSquare className="h-5 w-5 text-slate-500" />
                    </div>
                    <p className="text-sm text-slate-500">Start a conversation to plan your trips</p>
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`flex-shrink-0 h-7 w-7 rounded-lg flex items-center justify-center ${
                        msg.role === 'user'
                          ? 'bg-white/[0.08]'
                          : 'bg-gradient-to-br from-violet-500 to-indigo-600'
                      }`}>
                        {msg.role === 'user' ? (
                          <span className="text-[10px] font-bold text-slate-300">You</span>
                        ) : (
                          <Sparkles className="h-3.5 w-3.5 text-white" />
                        )}
                      </div>
                      <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed max-w-[85%] ${
                        msg.role === 'user'
                          ? 'bg-white/[0.06] text-slate-200'
                          : 'bg-[#1a1a1f] border border-white/[0.06] text-slate-300'
                      }`}>
                        {msg.content.split('\n').map((line, i) => {
                          const parts = line.split(/\*\*(.*?)\*\*/g);
                          return (
                            <span key={i}>
                              {parts.map((part, index) => {
                                if (index % 2 === 1) {
                                  return (
                                    <strong key={index} className="text-white font-semibold">
                                      {part}
                                    </strong>
                                  );
                                }
                                return part;
                              })}
                              {i < msg.content.split('\n').length - 1 && <br />}
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
                    <div className="flex-shrink-0 h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                      <Sparkles className="h-3.5 w-3.5 text-white animate-pulse" />
                    </div>
                    <div className="rounded-2xl bg-[#1a1a1f] border border-white/[0.06] px-4 py-3">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="h-2 w-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="h-2 w-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trips Panel */}
        <div className="flex-1 flex flex-col overflow-hidden relative bg-[#0d0d0f]">
          {/* Filter Navigation Bar */}
          <div className="flex-shrink-0 border-b border-white/[0.04] bg-[#0d0d0f]">
            <div className="mx-auto max-w-6xl w-full flex items-center gap-2.5 overflow-x-auto py-4 px-4 md:px-8">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.03] border border-white/[0.06] flex-shrink-0">
                <Filter className="h-4.5 w-4.5 text-slate-400" />
              </div>
              
              <div className="flex items-center gap-2">
                {tabConfig.map((tab) => {
                  const active = selectedFilter === tab.key;
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setSelectedFilter(tab.key)}
                      className={`flex items-center gap-2 text-xs px-4 py-2 rounded-full border transition-all cursor-pointer group whitespace-nowrap ${
                        active
                          ? 'bg-white/[0.06] border-white/[0.08] text-white font-semibold shadow-md shadow-black/20'
                          : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                      }`}
                    >
                      <TabIcon className={`h-3.5 w-3.5 ${active ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-400'}`} />
                      <span>{tab.label}</span>
                      <span className={`ml-1 px-1.5 py-0.5 text-[10px] rounded-full font-bold transition-all ${
                        active ? 'bg-white/[0.08] text-white/90' : 'bg-white/[0.03] text-slate-500 group-hover:text-slate-400'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Trip cards grid */}
          <div className="flex-1 overflow-y-auto pt-8 pb-40 bg-[#0d0d0f] @container">
            <div className="mx-auto max-w-6xl w-full px-4 md:px-8">
              <div className="grid grid-cols-1 @2xl:grid-cols-2 @5xl:grid-cols-3 gap-6 pb-24">
                {/* "Add trip" card - FIRST ITEM ALWAYS */}
                <motion.div
                  layout
                  onClick={() => setShowNewTripModal(true)}
                  className="h-full min-h-[110px] md:min-h-[340px] rounded-2xl border-2 border-dashed border-white/[0.08] hover:border-violet-500/40 bg-white/[0.01] hover:bg-white/[0.03] flex flex-row md:flex-col items-center justify-start md:justify-center cursor-pointer transition-all duration-300 group p-5 md:p-6"
                >
                  <div className="flex flex-row md:flex-col items-center gap-4 md:gap-0 w-full text-left md:text-center">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center bg-white/[0.03] border border-white/[0.06] group-hover:bg-violet-500/10 group-hover:border-violet-500/20 text-slate-400 group-hover:text-violet-400 transition-colors flex-shrink-0 md:mb-4">
                      <Plus size={24} className="group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="flex-1 md:flex-none">
                      <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors block">
                        New Trip
                      </span>
                      <p className="text-xs text-slate-500 mt-0.5 md:mt-1.5 max-w-[200px] md:max-w-[170px] md:mx-auto leading-relaxed">
                        Start planning your next destination
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* AI Assistant Help Card when zero trips in database */}
                {trips.length === 0 && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full min-h-[350px] rounded-2xl border border-white/[0.06] bg-gradient-to-br from-violet-500/5 to-indigo-500/5 p-8 flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-6">
                        <Sparkles className="h-5 w-5 text-violet-400 animate-pulse" />
                      </div>
                      <h3 className="text-base font-bold text-white mb-2">Plan with AI</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Describe your dream journey in the search bar below. Tell Wayfarer where you want to go, who you are traveling with, and what you'd love to see.
                      </p>
                    </div>
                    <div className="text-[10px] text-violet-400/60 font-semibold tracking-wider uppercase">
                      AI-Powered Planning
                    </div>
                  </motion.div>
                )}

                {/* No matching trips for active filter tab helper card */}
                {filteredTrips.length === 0 && selectedFilter !== 'all' && trips.length > 0 && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full min-h-[350px] rounded-2xl border border-white/[0.04] bg-white/[0.01] p-8 flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-6">
                        <Compass className="h-5 w-5 text-slate-400" />
                      </div>
                      <h3 className="text-base font-bold text-slate-300 mb-2">No {selectedFilter} trips</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        There are currently no travel plans matching the "{selectedFilter}" status filter. Select another filter tab above to view other trips.
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedFilter('all')}
                      className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 border border-white/[0.06] transition-all cursor-pointer w-fit"
                    >
                      Show all trips
                    </button>
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

            {/* Floating Bottom AI Prompt Bar & Suggestions */}
            <div className="absolute bottom-6 left-0 right-0 px-4 z-40">
              <div className="max-w-2xl w-full mx-auto flex flex-col gap-3">
                {/* Suggestion Chips */}
                <div className="flex flex-nowrap items-center justify-start gap-2 pb-2 md:pb-1 overflow-x-auto scrollbar-none px-4 -mx-4 md:px-0 md:mx-0">
                  {suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handlePromptSubmit(undefined, suggestion)}
                      className="flex-shrink-0 text-[11px] font-medium px-4 py-2 rounded-full border border-white/[0.06] bg-[#1a1a1f]/90 text-slate-400 hover:bg-white/[0.04] hover:text-white hover:border-white/[0.12] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap shadow-md"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                {/* Prompt Bar input */}
                <form
                  onSubmit={handlePromptSubmit}
                  className={`rounded-2xl transition-all duration-200 bg-[#1e1e24]/90 backdrop-blur-xl border ${
                    promptFocused ? 'border-violet-500/50 shadow-2xl shadow-violet-500/5' : 'border-white/[0.08] shadow-2xl shadow-black/40'
                  } flex items-center gap-2 px-3 py-2.5`}
                >
                  {/* Sparkle icon AI badge button */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-tr from-violet-600 to-indigo-500 text-white shadow-lg shadow-violet-500/25 flex-shrink-0 select-none">
                    <Sparkles size={16} />
                  </div>
                  
                  <input
                    className="flex-1 text-sm outline-none bg-transparent placeholder-white/25 text-white py-1"
                    placeholder="Describe your dream trip..."
                    value={promptValue}
                    onChange={e => setPromptValue(e.target.value)}
                    onFocus={() => setPromptFocused(true)}
                    onBlur={() => setTimeout(() => setPromptFocused(false), 200)}
                  />
                  
                  <button
                    type="submit"
                    disabled={!promptValue.trim()}
                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:bg-white/[0.06] hover:text-white disabled:opacity-30 disabled:hover:bg-white/[0.03] disabled:hover:text-slate-400 transition-all cursor-pointer flex-shrink-0 active:scale-[0.95]"
                  >
                    <Send size={15} />
                  </button>
                </form>

                {/* AI Notice */}
                <div className="text-[10px] text-white/20 text-center tracking-tight select-none">
                  AI can make mistakes. Double-check important details.
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* New Trip Modal (Dark-Themed) */}
      {showNewTripModal && (
        <NewTripModal
          onClose={() => setShowNewTripModal(false)}
          onSubmit={handleCreateTrip}
        />
      )}
    </div>
  );
}

// --- New Trip Modal (Dark-Themed) ---

function NewTripModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (name: string, destination: string, emoji: string, dates?: { start: string; end: string }) => void;
}) {
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [emoji, setEmoji] = useState('✈️');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !destination.trim()) return;
    const dates = startDate && endDate ? { start: startDate, end: endDate } : undefined;
    onSubmit(name.trim(), destination.trim(), emoji, dates);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative rounded-2xl shadow-2xl w-full max-w-md overflow-hidden bg-[#121214] border border-white/[0.08] text-white"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="font-semibold text-white">New Trip</h2>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/[0.04] transition-colors cursor-pointer text-slate-400 hover:text-white">
            <X size={14} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Emoji selector */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Icon</label>
            <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto pr-1 no-scrollbar">
              {EMOJI_PRESETS.map((e, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all cursor-pointer ${
                    emoji === e
                      ? 'ring-2 ring-violet-500 scale-110 bg-violet-500/20'
                      : 'hover:bg-white/[0.04]'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Trip name */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Trip Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., 7 Days in Kyoto"
              className="w-full text-sm px-3 py-2.5 rounded-lg outline-none transition-all bg-white/[0.03] border border-white/[0.06] text-white focus:border-violet-500/50"
              autoFocus
            />
          </div>

          {/* Destination */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Destination</label>
            <input
              type="text"
              value={destination}
              onChange={e => setDestination(e.target.value)}
              placeholder="e.g., Kyoto, Japan"
              className="w-full text-sm px-3 py-2.5 rounded-lg outline-none transition-all bg-white/[0.03] border border-white/[0.06] text-white focus:border-violet-500/50"
            />
          </div>

          {/* Dates */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Dates <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="text-sm px-3 py-2.5 rounded-lg outline-none transition-all bg-white/[0.03] border border-white/[0.06] text-white focus:border-violet-500/50"
              />
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="text-sm px-3 py-2.5 rounded-lg outline-none transition-all bg-white/[0.03] border border-white/[0.06] text-white focus:border-violet-500/50"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!name.trim() || !destination.trim()}
            className="w-full text-sm font-semibold py-2.5 rounded-lg transition-all bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-violet-600/10 active:scale-[0.98]"
          >
            Create Trip
          </button>
        </form>
      </div>
    </div>
  );
}
