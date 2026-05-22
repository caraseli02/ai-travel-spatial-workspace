import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Users,
  Wallet,
  MapPin,
  CheckCircle2,
  Clock,
  Plane,
  Compass,
  ChevronRight,
  Sparkles,
  Trash2,
} from 'lucide-react';
import type { Trip } from '../models/trip';
import {
  deriveTripStatus,
  deriveTripCountry,
  deriveTripImage,
  deriveTripTravelers,
  deriveTripBudget,
  deriveTripActivities,
  formatTripDates,
} from '../utils/tripCardHelpers';

interface TripCardProps {
  trip: Trip;
  index: number;
  isNew?: boolean;
  onOpen: () => void;
  onDelete: () => void;
}

const statusConfig = {
  upcoming: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: Plane, label: 'Upcoming' },
  ongoing: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Compass, label: 'Ongoing' },
  completed: { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: CheckCircle2, label: 'Completed' },
  planning: { color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20', icon: Clock, label: 'Planning' },
};

export default function TripCard({ trip, index, isNew, onOpen, onDelete }: TripCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const status = deriveTripStatus(trip);
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const image = deriveTripImage(trip);
  const country = deriveTripCountry(trip);
  const travelers = deriveTripTravelers(trip);
  const budget = deriveTripBudget(trip);
  const activities = deriveTripActivities(trip);

  return (
    <motion.article
      initial={isNew ? { opacity: 0, y: 30, scale: 0.95 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: isNew ? 0 : index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#1a1a1f] hover:border-white/[0.12] transition-all duration-300 hover:shadow-2xl hover:shadow-black/20 flex flex-col justify-between h-full"
    >
      {/* Delete confirmation overlay */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-2xl flex items-center justify-center backdrop-blur-md z-20 bg-black/85"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center p-5 space-y-4 max-w-[80%]">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-white font-semibold text-sm">Delete this trip?</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  This will permanently delete your workspace for "{trip.name}". This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center gap-2 justify-center pt-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowConfirm(false); }}
                  className="text-xs px-3 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 hover:text-white transition-all cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(); setShowConfirm(false); }}
                  className="text-xs px-4 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-500 transition-all cursor-pointer font-medium shadow-lg shadow-rose-600/20"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Clickable Wrapper - Semantically safe, avoids nesting interactive items */}
      <div
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpen();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Open trip workspace for ${trip.name}`}
        className="cursor-pointer flex flex-col flex-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1f] rounded-t-2xl"
      >
        {/* Top Half: Image & Badges */}
        <div>
          <div className="relative h-48 overflow-hidden rounded-t-2xl">
            <img
              src={image}
              alt={trip.destination}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1f] via-[#1a1a1f]/30 to-transparent" />
            
            {/* Status Badge */}
            <div className={`absolute top-3 left-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold ${config.bg} ${config.color} border ${config.border} backdrop-blur-md`}>
              <StatusIcon className="h-3 w-3" />
              {config.label}
            </div>

            {/* New badge (placed with responsive offset to prevent overlapping touch trash button) */}
            {isNew && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-16 lg:right-3 lg:group-hover:right-12 lg:group-focus-within:right-12 transition-all duration-300 flex items-center gap-1 rounded-full bg-violet-500/90 px-2.5 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md shadow-lg shadow-violet-500/20 z-10"
              >
                <Sparkles className="h-3 w-3" />
                New
              </motion.div>
            )}

            {/* Destination overlay */}
            <div className="absolute bottom-3 left-4 right-4">
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 drop-shadow-md truncate">
                <span className="text-2xl" role="img" aria-label="trip emoji">{trip.emoji}</span>
                <span className="truncate">{trip.name}</span>
              </h3>
              <div className="flex items-center gap-1 text-white/70 text-xs font-medium mt-0.5">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-white/55" />
                <span className="truncate">{country}</span>
              </div>
            </div>
          </div>

          {/* Bottom Half: Content */}
          <div className="p-4 space-y-3">
            {/* Date & Travelers Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm text-slate-400">
              <div className="flex items-center gap-2 min-w-0">
                <Calendar className="h-4 w-4 text-slate-500 flex-shrink-0" />
                <span className="truncate font-medium">
                  {formatTripDates(trip.dates)}
                </span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <Users className="h-4 w-4 text-slate-500 flex-shrink-0" />
                <span className="truncate font-medium">
                  {travelers} {travelers === 1 ? 'traveler' : 'travelers'}
                </span>
              </div>
            </div>

            {/* Budget */}
            <div className="flex items-center gap-2 text-sm text-slate-400 min-w-0">
              <Wallet className="h-4 w-4 text-slate-500 flex-shrink-0" />
              <span className="truncate font-medium">
                Budget: <span className="text-slate-200 font-semibold">{budget}</span>
              </span>
            </div>

            {/* Activities */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {activities.length > 0 ? (
                <>
                  {activities.slice(0, 3).map((activity, i) => (
                    <span
                      key={i}
                      className="rounded-md bg-white/[0.04] px-2 py-1 text-[10px] font-medium text-slate-400 border border-white/[0.03] max-w-[110px] truncate"
                    >
                      {activity}
                    </span>
                  ))}
                  {activities.length > 3 && (
                    <span className="rounded-md bg-white/[0.04] px-2 py-1 text-[10px] font-medium text-slate-500 border border-white/[0.03] flex-shrink-0">
                      +{activities.length - 3}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-[10px] font-medium text-slate-500 italic">Workspace is empty</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete button placed as sibling of click wrapper to prevent semantic nesting issues.
          Complies with WCAG 44x44px min touch targets on mobile (w-11 h-11 vs lg:w-8 lg:h-8).
          Always visible on mobile/tablets, hidden and hover-revealed on large screens. */}
      <button
        onClick={(e) => { e.stopPropagation(); setShowConfirm(true); }}
        className="absolute top-3 right-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100 lg:focus:opacity-100 transition-opacity duration-300 w-11 h-11 lg:w-8 lg:h-8 rounded-full flex items-center justify-center bg-black/60 hover:bg-rose-600 text-white backdrop-blur-md shadow-lg border border-white/10 cursor-pointer z-10 focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-rose-500"
        aria-label={`Delete trip ${trip.name}`}
        title="Delete Trip"
      >
        <Trash2 className="h-4 w-4 lg:h-3.5 lg:w-3.5" />
      </button>

      {/* Action Footer */}
      <div className="p-4 pt-0">
        <div className="flex items-center pt-2 border-t border-white/[0.04]">
          <button
            onClick={(e) => { e.stopPropagation(); onOpen(); }}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] text-slate-200 hover:text-white border border-white/[0.06] hover:border-white/[0.12] py-2.5 text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            View Details
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
