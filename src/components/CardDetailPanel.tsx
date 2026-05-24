import { useState, useEffect } from 'react';
import {
  X, MapPin, Star, Plane, Calendar, ExternalLink, Clock, Check,
  Edit3, Trash2, Link, Plus, Trash, Eye
} from 'lucide-react';
import type { CanvasCard } from '../models/trip';

interface CardDetailPanelProps {
  card: CanvasCard | null;
  onClose: () => void;
  onUpdateCard?: (updated: CanvasCard) => void;
  onDeleteCard?: (id: string) => void;
  onStartLinking?: (id: string) => void;
  isLinkingActive?: boolean;
}

const typeLabel: Record<string, string> = {
  flight: 'Flight Ticket',
  hotel: 'Hotel / Ryokan',
  polaroid: 'Spatial Polaroid',
  sticky: 'Sticky Note',
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

const tagColorMap = [
  { value: 'amber', label: 'Amber' },
  { value: 'orange', label: 'Orange' },
  { value: 'emerald', label: 'Emerald' },
  { value: 'rose', label: 'Rose' },
  { value: 'slate', label: 'Slate' },
  { value: 'blue', label: 'Blue' },
];

const stickyColorPresets = [
  { hex: '#fef3c7', name: 'Yellow' },
  { hex: '#fce7f3', name: 'Pink' },
  { hex: '#d1fae5', name: 'Green' },
  { hex: '#ffe4e6', name: 'Red' },
  { hex: '#dbeafe', name: 'Blue' },
];

export default function CardDetailPanel({
  card,
  onClose,
  onUpdateCard,
  onDeleteCard,
  onStartLinking,
  isLinkingActive = false,
}: CardDetailPanelProps) {
  if (!card) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editTag, setEditTag] = useState('');
  const [editTagColor, setEditTagColor] = useState('slate');
  const [editDetails, setEditDetails] = useState<string[]>([]);
  const [editPrice, setEditPrice] = useState('');
  const [editRating, setEditRating] = useState(4.5);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Sync state when active card changes
  useEffect(() => {
    setEditTitle(card.title);
    setEditSubtitle(card.subtitle || '');
    setEditTag(card.tag || '');
    setEditTagColor(card.tagColor || 'slate');
    setEditDetails(card.details || []);
    setEditPrice(card.price || '');
    setEditRating(card.rating || 4.5);
    setIsEditing(false);
    setConfirmDelete(false);
  }, [card.id]);

  const handleFieldChange = (updates: Partial<CanvasCard>) => {
    if (onUpdateCard) {
      onUpdateCard({ ...card, ...updates });
    }
  };

  const handleTitleChange = (val: string) => {
    setEditTitle(val);
    handleFieldChange({ title: val });
  };

  const handleSubtitleChange = (val: string) => {
    setEditSubtitle(val);
    handleFieldChange({ subtitle: val });
  };

  const handleTagChange = (val: string) => {
    setEditTag(val);
    handleFieldChange({ tag: val });
  };

  const handleTagColorChange = (val: string) => {
    setEditTagColor(val);
    handleFieldChange({ tagColor: val });
  };

  const handlePriceChange = (val: string) => {
    setEditPrice(val);
    handleFieldChange({ price: val });
  };

  const handleRatingChange = (val: number) => {
    setEditRating(val);
    handleFieldChange({ rating: val });
  };

  const handleDetailItemChange = (index: number, val: string) => {
    const updated = [...editDetails];
    updated[index] = val;
    setEditDetails(updated);
    handleFieldChange({ details: updated });
  };

  const handleAddDetail = () => {
    const updated = [...editDetails, 'New detail point'];
    setEditDetails(updated);
    handleFieldChange({ details: updated });
  };

  const handleRemoveDetail = (index: number) => {
    const updated = editDetails.filter((_, i) => i !== index);
    setEditDetails(updated);
    handleFieldChange({ details: updated });
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    } else {
      if (onDeleteCard) {
        onDeleteCard(card.id);
      }
      onClose();
    }
  };

  return (
    <div
      className="absolute right-0 top-0 bottom-0 z-30 overflow-y-auto scrollbar-thin transition-all duration-300 flex flex-col w-full sm:w-[280px]"
      style={{
        backgroundColor: '#fefcf8',
        borderLeft: '1px solid #e7e3dc',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.06)',
      }}
    >
      {/* Header */}
      <div className="sticky top-0 flex items-center justify-between px-4 py-3 z-10"
        style={{ backgroundColor: '#fefcf8', borderBottom: '1px solid #e7e3dc' }}>
        <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
          <span style={{ color: '#92400e' }}>{typeIcon[card.type]}</span>
          {typeLabel[card.type] || 'Card'}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(e => !e)}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all cursor-pointer"
            title={isEditing ? "View details" : "Edit details"}
            aria-label={isEditing ? "View details" : "Edit details"}
          >
            {isEditing ? <Eye size={14} /> : <Edit3 size={14} />}
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-300 hover:text-stone-600 hover:bg-stone-100 transition-all cursor-pointer"
            aria-label="Close details panel"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Image Banner */}
      {card.image && (
        <div className="w-full overflow-hidden flex-shrink-0 relative group" style={{ height: '140px', backgroundColor: '#e7e3dc' }}>
          <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-all" />
        </div>
      )}

      {/* Body Content */}
      <div className="p-4 flex-1">
        {isEditing ? (
          /* EDIT MODE VIEW */
          <div className="space-y-4">
            {/* Title Input */}
            <div>
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={e => handleTitleChange(e.target.value)}
                className="w-full text-xs font-medium border rounded-xl px-3 py-2 bg-stone-50 border-stone-200 outline-none focus:border-amber-500 text-stone-800"
                placeholder="Enter title"
              />
            </div>

            {/* Subtitle Input */}
            <div>
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Subtitle / Description</label>
              <textarea
                value={editSubtitle}
                onChange={e => handleSubtitleChange(e.target.value)}
                className="w-full text-xs border rounded-xl px-3 py-2 bg-stone-50 border-stone-200 outline-none focus:border-amber-500 text-stone-600 resize-none h-16"
                placeholder="Enter subtitle"
              />
            </div>

            {/* Tag and Tag Color */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Tag Text</label>
                <input
                  type="text"
                  value={editTag}
                  onChange={e => handleTagChange(e.target.value)}
                  className="w-full text-xs border rounded-xl px-2.5 py-1.5 bg-stone-50 border-stone-200 outline-none focus:border-amber-500 text-stone-700"
                  placeholder="e.g. Day 1"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Tag Color</label>
                <select
                  value={editTagColor}
                  onChange={e => handleTagColorChange(e.target.value)}
                  className="w-full text-xs border rounded-xl px-2 py-1.5 bg-stone-50 border-stone-200 outline-none focus:border-amber-500 text-stone-700 h-[29px]"
                >
                  {tagColorMap.map(tc => (
                    <option key={tc.value} value={tc.value}>{tc.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sticky note color picker */}
            {card.type === 'sticky' && (
              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Sticky Color</label>
                <div className="flex items-center gap-2 mt-1">
                  {stickyColorPresets.map(preset => (
                    <button
                      key={preset.hex}
                      onClick={() => handleFieldChange({ color: preset.hex })}
                      className="w-6 h-6 rounded-full border transition-all cursor-pointer relative"
                      style={{
                        backgroundColor: preset.hex,
                        borderColor: card.color === preset.hex ? '#92400e' : '#e7e3dc',
                        transform: card.color === preset.hex ? 'scale(1.15)' : 'none',
                      }}
                      title={preset.name}
                    >
                      {card.color === preset.hex && (
                        <Check size={10} className="text-amber-800 absolute inset-0 m-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Rating and Price Inputs */}
            <div className="grid grid-cols-2 gap-2">
              {(card.type === 'hotel' || card.type === 'polaroid') && (
                <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Rating</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={editRating}
                    onChange={e => handleRatingChange(parseFloat(e.target.value) || 4.5)}
                    className="w-full text-xs border rounded-xl px-3 py-1.5 bg-stone-50 border-stone-200 outline-none focus:border-amber-500 text-stone-700"
                  />
                </div>
              )}
              {(card.type === 'hotel' || card.type === 'flight') && (
                <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Price</label>
                  <input
                    type="text"
                    value={editPrice}
                    onChange={e => handlePriceChange(e.target.value)}
                    className="w-full text-xs border rounded-xl px-3 py-1.5 bg-stone-50 border-stone-200 outline-none focus:border-amber-500 text-stone-700"
                    placeholder="e.g. $120"
                  />
                </div>
              )}
            </div>

            {/* Details Bullet Point Manager */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Details / Items</label>
                <button
                  type="button"
                  onClick={handleAddDetail}
                  className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-800 hover:text-amber-900 transition-colors cursor-pointer"
                >
                  <Plus size={10} />
                  Add bullet
                </button>
              </div>
              <div className="space-y-1.5">
                {editDetails.map((detail, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-300 flex-shrink-0" />
                    <input
                      type="text"
                      value={detail}
                      onChange={e => handleDetailItemChange(idx, e.target.value)}
                      className="flex-1 text-xs border rounded-lg px-2 py-1 bg-stone-50 border-stone-200 outline-none focus:border-amber-500 text-stone-600"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveDetail(idx)}
                      className="text-stone-300 hover:text-rose-500 p-0.5 transition-colors cursor-pointer"
                      aria-label="Remove detail line"
                    >
                      <Trash size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* STANDARD VIEW MODE */
          <div className="space-y-4">
            {/* Title & Subtitle */}
            <div>
              <h2 className="font-bold text-stone-800 text-base leading-tight mb-1">{card.title}</h2>
              {card.subtitle && <p className="text-xs text-stone-500 leading-relaxed">{card.subtitle}</p>}
            </div>

            {/* Tag Pill */}
            {card.tag && (
              <div>
                <span className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: '#fef3c7',
                    color: '#92400e',
                    border: '1px solid #fde68a',
                  }}>
                  {card.tag}
                </span>
              </div>
            )}

            {/* Rating rendering */}
            {card.rating && (
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={11}
                    className={i < Math.floor(card.rating!) ? 'text-amber-400 fill-amber-400' : 'text-stone-200 fill-stone-200'} />
                ))}
                <span className="text-xs font-semibold text-stone-500 ml-1">{card.rating} · Recommended</span>
              </div>
            )}

            {/* Details Bullet List */}
            {card.details && card.details.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Details</p>
                <ul className="space-y-1.5">
                  {card.details.map((d, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-stone-600">
                      <Check size={12} className="mt-0.5 flex-shrink-0 text-amber-800" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Price section */}
            {card.price && (
              <div className="py-2.5 rounded-xl text-center"
                style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a' }}>
                <p className="text-xl font-extrabold text-stone-800">{card.price}</p>
                <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Estimated Total</p>
              </div>
            )}

            {/* Flight Specific Route Details */}
            {card.type === 'flight' && (
              <div className="rounded-xl p-3" style={{ backgroundColor: '#f5f3ef', border: '1px solid #e7e3dc' }}>
                <div className="flex items-center justify-between text-stone-700">
                  <div className="text-center">
                    <p className="font-bold text-sm">SFO</p>
                    <p className="text-[10px] text-stone-400">11:05am</p>
                  </div>
                  <div className="flex-1 flex flex-col items-center px-1">
                    <p className="text-[9px] text-stone-400">12h 40m nonstop</p>
                    <div className="w-full flex items-center gap-1 mt-0.5">
                      <div className="flex-1 h-px bg-stone-300" />
                      <Plane size={10} className="text-stone-400" />
                      <div className="flex-1 h-px bg-stone-300" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-sm">KIX</p>
                    <p className="text-[10px] text-stone-400">+1 3:45pm</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FOOTER ACTIONS - Link, Delete, Add to Itinerary */}
      <div className="p-4 border-t border-stone-200 bg-stone-50 space-y-2 flex-shrink-0">
        {/* Draw Connection Option */}
        {onStartLinking && (
          <button
            onClick={() => onStartLinking(card.id)}
            className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              isLinkingActive
                ? 'bg-amber-100 border-amber-300 text-amber-900 animate-pulse'
                : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-700'
            }`}
          >
            <Link size={12} className={isLinkingActive ? 'text-amber-700' : 'text-stone-500'} />
            {isLinkingActive ? 'Select target card on canvas...' : 'Link with another card'}
          </button>
        )}

        <div className="grid grid-cols-2 gap-2">
          {/* Delete Card Button */}
          {onDeleteCard && (
            <button
              onClick={handleDelete}
              className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                confirmDelete
                  ? 'bg-rose-500 border-rose-600 text-white animate-pulse'
                  : 'bg-white border-stone-200 hover:bg-stone-50 hover:text-rose-600 text-stone-500'
              }`}
            >
              <Trash2 size={12} />
              {confirmDelete ? 'Confirm delete' : 'Delete Card'}
            </button>
          )}

          {/* Add to itinerary mock button */}
          <button className="py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-white border border-stone-200 hover:bg-stone-50 text-stone-600">
            <Calendar size={12} />
            Itinerary
          </button>
        </div>

        {/* Primary original link */}
        <button className="w-full py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer text-white"
          style={{ backgroundColor: '#92400e' }}>
          <ExternalLink size={12} />
          Open original link
        </button>
      </div>
    </div>
  );
}
