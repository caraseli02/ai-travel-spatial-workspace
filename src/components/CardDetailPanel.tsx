import { X, MapPin, Star, Plane, Calendar, ExternalLink, Clock, Check } from 'lucide-react';
import type { CanvasCard } from '../data/tripData';

interface CardDetailPanelProps {
  card: CanvasCard | null;
  onClose: () => void;
}

export default function CardDetailPanel({ card, onClose }: CardDetailPanelProps) {
  if (!card) return null;

  const typeLabel: Record<string, string> = {
    flight: 'Flight',
    hotel: 'Hotel / Ryokan',
    polaroid: 'Location',
    sticky: 'Note',
    article: 'Saved Article',
    note: 'Quick Note',
  };

  const typeIcon: Record<string, React.ReactNode> = {
    flight: <Plane size={13} />,
    hotel: <Star size={13} />,
    polaroid: <MapPin size={13} />,
    sticky: <span style={{ fontSize: '12px' }}>📌</span>,
    article: <ExternalLink size={13} />,
    note: <Clock size={13} />,
  };

  return (
    <div
      className="absolute right-0 top-0 bottom-0 z-30 overflow-y-auto scrollbar-thin transition-all duration-300"
      style={{
        width: '280px',
        backgroundColor: '#fefcf8',
        borderLeft: '1px solid #e7e3dc',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.06)',
      }}
    >
      {/* Header */}
      <div className="sticky top-0 flex items-center justify-between px-4 py-3 z-10"
        style={{ backgroundColor: '#fefcf8', borderBottom: '1px solid #e7e3dc' }}>
        <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
          <span style={{ color: '#92400e' }}>{typeIcon[card.type]}</span>
          {typeLabel[card.type] || 'Card'}
        </div>
        <button onClick={onClose} className="text-stone-300 hover:text-stone-600 transition-colors">
          <X size={14} />
        </button>
      </div>

      {/* Image */}
      {card.image && (
        <div className="w-full overflow-hidden" style={{ height: '160px', backgroundColor: '#e7e3dc' }}>
          <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="p-4">
        {/* Title */}
        <h2 className="font-semibold text-stone-800 text-base leading-tight mb-1">{card.title}</h2>
        {card.subtitle && <p className="text-sm text-stone-500 leading-snug mb-3">{card.subtitle}</p>}

        {/* Tag */}
        {card.tag && (
          <div className="mb-4">
            <span className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{
                backgroundColor: '#fef3c7',
                color: '#92400e',
                border: '1px solid #fde68a',
              }}>
              {card.tag}
            </span>
          </div>
        )}

        {/* Rating */}
        {card.rating && (
          <div className="flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12}
                className={i < Math.floor(card.rating!) ? 'text-amber-400 fill-amber-400' : 'text-stone-200 fill-stone-200'} />
            ))}
            <span className="text-xs text-stone-500 ml-1">{card.rating} · Exceptional</span>
          </div>
        )}

        {/* Details */}
        {card.details && card.details.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Details</p>
            <ul className="space-y-2">
              {card.details.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                  <Check size={13} className="mt-0.5 flex-shrink-0" style={{ color: '#92400e' }} />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Price */}
        {card.price && (
          <div className="mb-4 py-3 rounded-xl text-center"
            style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a' }}>
            <p className="text-2xl font-bold text-stone-800">{card.price}</p>
            <p className="text-xs text-stone-400 mt-0.5">Total price</p>
          </div>
        )}

        {/* Flight specific */}
        {card.type === 'flight' && (
          <div className="rounded-xl p-3 mb-4" style={{ backgroundColor: '#f5f3ef', border: '1px solid #e7e3dc' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-center">
                <p className="font-bold text-stone-800">SFO</p>
                <p className="text-xs text-stone-400">11:05am</p>
              </div>
              <div className="flex-1 flex flex-col items-center px-2">
                <p className="text-xs text-stone-400 mb-1">12h 40m · Nonstop</p>
                <div className="w-full flex items-center gap-1">
                  <div className="flex-1 h-px bg-stone-300" />
                  <Plane size={12} className="text-stone-400" />
                  <div className="flex-1 h-px bg-stone-300" />
                </div>
              </div>
              <div className="text-center">
                <p className="font-bold text-stone-800">KIX</p>
                <p className="text-xs text-stone-400">+1 3:45pm</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          <button className="w-full py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90 flex items-center justify-center gap-2"
            style={{ backgroundColor: '#92400e', color: 'white' }}>
            <ExternalLink size={13} />
            Open original link
          </button>
          <button className="w-full py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-stone-100 flex items-center justify-center gap-2"
            style={{ border: '1px solid #e7e3dc', color: '#57534e' }}>
            <Calendar size={13} />
            Add to itinerary
          </button>
        </div>
      </div>
    </div>
  );
}
