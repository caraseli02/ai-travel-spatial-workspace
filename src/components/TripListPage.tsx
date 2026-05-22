import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass, Plus, Search, Sparkles, MapPin,
  Calendar, Clock, Trash2, X, ChevronLeft,
} from 'lucide-react';
import { localTripRepository } from '../models/tripRepository';
import { createEmptyTrip } from '../models/trip';
import type { Trip } from '../models/trip';

const EMOJI_PRESETS = ['🏖️', '🏔️', '🌆', '🏯', '⛷️', '🌴', '🎭', '✈️', '🚢', '🏕️', '🗺️', '🌸',
  '🇯🇵', '🇪🇸', '🇮🇹', '🇫🇷', '🇬🇷', '🇹🇭', '🇧🇷', '🇬🇧', '🇩🇪', '🇵🇹', '🇲🇽', '🇺🇸'];

export default function TripListPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [showNewTripModal, setShowNewTripModal] = useState(false);
  const [promptValue, setPromptValue] = useState('');
  const [promptFocused, setPromptFocused] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    setTrips(localTripRepository.list());
  }, []);

  const handleCreateTrip = (name: string, destination: string, emoji: string, dates?: { start: string; end: string }) => {
    const newTrip = createEmptyTrip(name, destination, emoji, dates);
    localTripRepository.save(newTrip);
    setTrips(localTripRepository.list());
    setShowNewTripModal(false);
    navigate(`/trips/${newTrip.id}`);
  };

  const handleDeleteTrip = (id: string) => {
    localTripRepository.delete(id);
    setTrips(localTripRepository.list());
    setDeleteConfirm(null);
  };

  const handlePromptSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptValue.trim()) return;

    const lower = promptValue.toLowerCase();

    // Basic mocked intent detection for trip creation
    const cityMatch = lower.match(/(?:plan|trip|go|visit|travel)\s+(?:a\s+trip\s+)?(?:to|in)\s+(.+)/);
    if (cityMatch) {
      const destination = cityMatch[1].trim().replace(/[.!?]+$/, '');
      const capitalized = destination.charAt(0).toUpperCase() + destination.slice(1);
      handleCreateTrip(`Trip to ${capitalized}`, capitalized, '✈️');
      setPromptValue('');
      return;
    }

    // Detect pasted links with hotel/flight keywords
    if (lower.includes('booking.com') || lower.includes('hotel') || lower.includes('airbnb')) {
      handleCreateTrip('New Hotel Trip', 'TBD', '🏨');
      setPromptValue('');
      return;
    }

    if (lower.includes('flight') || lower.includes('google.com/flights')) {
      handleCreateTrip('New Flight Trip', 'TBD', '✈️');
      setPromptValue('');
      return;
    }

    // Fallback: just open the modal
    setShowNewTripModal(true);
    setPromptValue('');
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getTimeAgo = (dateStr: string) => {
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const minutes = Math.floor(diff / 60000);
      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days < 30) return `${days}d ago`;
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#faf9f7' }}>
      {/* Top navigation */}
      <header className="flex items-center justify-between px-6 md:px-12 py-4"
        style={{ borderBottom: '1px solid #e7e3dc' }}>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
        >
          <ChevronLeft size={15} />
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#92400e' }}>
            <Compass size={15} color="white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-stone-800 tracking-tight" style={{ fontSize: '15px' }}>Wayfarer</span>
        </button>
        <button
          onClick={() => setShowNewTripModal(true)}
          className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all hover:opacity-90 cursor-pointer"
          style={{ backgroundColor: '#92400e', color: 'white' }}
        >
          <Plus size={14} />
          <span className="hidden sm:inline">New Trip</span>
        </button>
      </header>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-10">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl text-stone-800 mb-2">Your Trips</h1>
          <p className="text-stone-400 text-sm">Plan, organize, and refine your travel adventures.</p>
        </div>

        {/* Prompt bar */}
        <div className="mb-10">
          <form onSubmit={handlePromptSubmit}
            className={`rounded-xl transition-all duration-200 ${promptFocused ? 'shadow-lg' : 'shadow-sm'}`}
            style={{
              backgroundColor: '#fefcf8',
              border: `1.5px solid ${promptFocused ? '#fde68a' : '#e7e3dc'}`,
            }}>
            <div className="flex items-center gap-2 px-4 py-3">
              <Sparkles size={16} color="#92400e" />
              <input
                className="flex-1 text-sm outline-none bg-transparent placeholder-stone-300 text-stone-700"
                placeholder="Plan a trip to Barcelona, paste a Booking.com link, or just describe your idea..."
                value={promptValue}
                onChange={e => setPromptValue(e.target.value)}
                onFocus={() => setPromptFocused(true)}
                onBlur={() => setTimeout(() => setPromptFocused(false), 200)}
                style={{ fontFamily: 'inherit' }}
              />
              {promptValue && (
                <button type="submit"
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                  style={{ backgroundColor: '#92400e' }}>
                  <Plus size={13} color="white" style={{ transform: 'rotate(45deg)' }} />
                </button>
              )}
            </div>
            {promptFocused && !promptValue && (
              <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                {['Plan a trip to Barcelona', 'Weekend in Paris', 'Backpacking Southeast Asia'].map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { setPromptValue(s); }}
                    className="text-xs px-2.5 py-1 rounded-full transition-all hover:opacity-80 active:scale-95 cursor-pointer"
                    style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>

        {/* Trip cards grid */}
        {trips.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ backgroundColor: '#fef3c7' }}>
              <Compass size={28} color="#92400e" />
            </div>
            <h2 className="text-lg font-semibold text-stone-700 mb-2">No trips yet</h2>
            <p className="text-stone-400 text-sm mb-6 max-w-md mx-auto">
              Create your first trip or paste a link to get started. Your planning workspace will be waiting for you.
            </p>
            <button
              onClick={() => setShowNewTripModal(true)}
              className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-lg transition-all hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: '#92400e', color: 'white' }}
            >
              <Plus size={14} />
              Create your first trip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {trips.map(trip => (
              <div
                key={trip.id}
                onClick={() => navigate(`/trips/${trip.id}`)}
                className="group relative rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                style={{
                  backgroundColor: '#fefcf8',
                  border: '1px solid #e7e3dc',
                }}
              >
                {/* Card header with emoji */}
                <div className="p-5 pb-3">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a' }}>
                      {trip.emoji}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(trip.id);
                      }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 cursor-pointer"
                      style={{ color: '#a8a29e' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <h3 className="font-semibold text-stone-800 text-base mb-0.5 group-hover:text-amber-900 transition-colors">
                    {trip.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-stone-400">
                    <MapPin size={11} />
                    <span className="text-xs">{trip.destination}</span>
                  </div>
                </div>

                {/* Card footer */}
                <div className="px-5 py-3 flex items-center justify-between text-xs text-stone-400"
                  style={{ borderTop: '1px solid #f0ece6' }}>
                  <div className="flex items-center gap-3">
                    {trip.dates && (
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {formatDate(trip.dates.start)} – {formatDate(trip.dates.end)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#d6cfc3' }} />
                      {trip.cards.length} cards
                    </span>
                  </div>
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    {getTimeAgo(trip.updatedAt)}
                  </span>
                </div>

                {/* Delete confirmation overlay */}
                {deleteConfirm === trip.id && (
                  <div
                    className="absolute inset-0 rounded-xl flex items-center justify-center backdrop-blur-sm z-10"
                    style={{ backgroundColor: 'rgba(250,249,247,0.92)' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="text-center">
                      <p className="text-sm text-stone-600 mb-3">Delete this trip?</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirm(null); }}
                          className="text-xs px-3 py-1.5 rounded-lg transition-all hover:bg-stone-100 cursor-pointer"
                          style={{ border: '1px solid #e7e3dc', color: '#78716c' }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteTrip(trip.id); }}
                          className="text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-90 cursor-pointer"
                          style={{ backgroundColor: '#ef4444', color: 'white' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* "Add trip" card */}
            <div
              onClick={() => setShowNewTripModal(true)}
              className="rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all hover:border-stone-300 hover:bg-stone-50/50 group"
              style={{ borderColor: '#e7e3dc', minHeight: '160px' }}
            >
              <div className="text-center">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 transition-colors group-hover:bg-stone-100"
                  style={{ backgroundColor: '#f5f3ef' }}>
                  <Plus size={18} className="text-stone-400" />
                </div>
                <span className="text-sm text-stone-400 group-hover:text-stone-500 transition-colors">New Trip</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Trip Modal */}
      {showNewTripModal && (
        <NewTripModal
          onClose={() => setShowNewTripModal(false)}
          onSubmit={handleCreateTrip}
        />
      )}
    </div>
  );
}

// --- New Trip Modal ---

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

  // Auto-generate name from destination
  useEffect(() => {
    if (destination && !name) {
      // Don't auto-set if user has manually typed a name
    }
  }, [destination, name]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{ backgroundColor: '#fefcf8', border: '1px solid #e7e3dc' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #e7e3dc' }}>
          <h2 className="font-semibold text-stone-800">New Trip</h2>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-stone-100 transition-colors cursor-pointer text-stone-400">
            <X size={14} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Emoji selector */}
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-2">Icon</label>
            <div className="flex flex-wrap gap-1.5">
              {EMOJI_PRESETS.map((e, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all cursor-pointer ${
                    emoji === e
                      ? 'ring-2 ring-amber-400 scale-110'
                      : 'hover:bg-stone-100'
                  }`}
                  style={{
                    backgroundColor: emoji === e ? '#fef3c7' : 'transparent',
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Trip name */}
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1.5">Trip Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., 7 Days in Kyoto"
              className="w-full text-sm px-3 py-2.5 rounded-lg outline-none transition-all"
              style={{
                backgroundColor: '#f5f3ef',
                border: '1.5px solid #e7e3dc',
                color: '#1c1917',
              }}
              onFocus={e => (e.target.style.borderColor = '#fde68a')}
              onBlur={e => (e.target.style.borderColor = '#e7e3dc')}
              autoFocus
            />
          </div>

          {/* Destination */}
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1.5">Destination</label>
            <input
              type="text"
              value={destination}
              onChange={e => setDestination(e.target.value)}
              placeholder="e.g., Kyoto, Japan"
              className="w-full text-sm px-3 py-2.5 rounded-lg outline-none transition-all"
              style={{
                backgroundColor: '#f5f3ef',
                border: '1.5px solid #e7e3dc',
                color: '#1c1917',
              }}
              onFocus={e => (e.target.style.borderColor = '#fde68a')}
              onBlur={e => (e.target.style.borderColor = '#e7e3dc')}
            />
          </div>

          {/* Dates (optional) */}
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1.5">
              Dates <span className="text-stone-300 font-normal">(optional)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="text-sm px-3 py-2.5 rounded-lg outline-none transition-all"
                style={{
                  backgroundColor: '#f5f3ef',
                  border: '1.5px solid #e7e3dc',
                  color: '#1c1917',
                }}
                onFocus={e => (e.target.style.borderColor = '#fde68a')}
                onBlur={e => (e.target.style.borderColor = '#e7e3dc')}
              />
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="text-sm px-3 py-2.5 rounded-lg outline-none transition-all"
                style={{
                  backgroundColor: '#f5f3ef',
                  border: '1.5px solid #e7e3dc',
                  color: '#1c1917',
                }}
                onFocus={e => (e.target.style.borderColor = '#fde68a')}
                onBlur={e => (e.target.style.borderColor = '#e7e3dc')}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!name.trim() || !destination.trim()}
            className="w-full text-sm font-medium py-2.5 rounded-lg transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            style={{ backgroundColor: '#92400e', color: 'white' }}
          >
            Create Trip
          </button>
        </form>
      </div>
    </div>
  );
}
