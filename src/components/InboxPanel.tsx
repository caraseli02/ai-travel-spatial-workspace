import React, { useState } from 'react';
import {
  Sparkles, MessageSquare, Link2, FileText,
  Plane, Hotel, ChevronRight, Plus, Send,
  CheckCircle2, Circle, X
} from 'lucide-react';
import type { InboxItem } from '../data/tripData';

interface InboxPanelProps {
  items: InboxItem[];
  onProcessItem: (id: string) => void;
  onAddItem: (content: string) => void;
  onOpenAddManual?: () => void;
  onClose?: () => void;
}

const sourceIcons: Record<string, React.ReactElement> = {
  whatsapp: <MessageSquare size={13} />,
  link: <Link2 size={13} />,
  note: <FileText size={13} />,
  flight: <Plane size={13} />,
  hotel: <Hotel size={13} />,
};

const sourceColors: Record<string, { icon: string; bg: string; border: string }> = {
  whatsapp: { icon: '#25d366', bg: '#f0fdf4', border: '#bbf7d0' },
  link:     { icon: '#6366f1', bg: '#eef2ff', border: '#c7d2fe' },
  note:     { icon: '#f59e0b', bg: '#fef3c7', border: '#fde68a' },
  flight:   { icon: '#92400e', bg: '#fef3c7', border: '#fde68a' },
  hotel:    { icon: '#be123c', bg: '#ffe4e6', border: '#fecdd3' },
};

const sampleInputs = [
  'https://google.com/flights/SFO-KIX-Dec14',
  'Try Junsei near Nanzenji! — Yuki',
  'Hiiragiya Ryokan availability?',
];

export default function InboxPanel({ items, onProcessItem, onAddItem, onOpenAddManual, onClose }: InboxPanelProps) {
  const [inputVal, setInputVal] = useState('');
  const [placeholder, setPlaceholder] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const unprocessed = items.filter(i => !i.processed);
  const processed = items.filter(i => i.processed);

  function handleSend() {
    if (!inputVal.trim()) return;
    setIsProcessing(true);
    // Trigger mock parsing in workspace parent state
    onAddItem(inputVal);
    setTimeout(() => {
      setIsProcessing(false);
      setInputVal('');
    }, 1200);
  }

  function cyclePlaceholder() {
    setPlaceholder(p => (p + 1) % sampleInputs.length);
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#fefcf8' }}>

      {/* Header */}
      <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid #e7e3dc' }}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold text-stone-800 text-sm">Inbox</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
              <Sparkles size={10} />
              <span>AI active</span>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="md:hidden hover:bg-stone-100 rounded-full p-1 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                aria-label="Close inbox"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-stone-400 leading-snug">
          Paste links, messages, or notes — Wayfarer will organize them on the canvas.
        </p>
      </div>

      {/* Input area */}
      <div className="px-3 py-3" style={{ borderBottom: '1px solid #f5f3ef' }}>
        <div className="relative">
          <textarea
            className="w-full text-xs rounded-xl resize-none outline-none text-stone-700 placeholder-stone-300 p-3 pr-10"
            style={{
              backgroundColor: '#f5f3ef',
              border: '1.5px solid #e7e3dc',
              minHeight: '76px',
              fontFamily: 'inherit',
              lineHeight: '1.5',
            }}
            placeholder={`Try: "${sampleInputs[placeholder]}"`}
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onFocus={cyclePlaceholder}
            onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleSend(); }}
          />
          <button
            onClick={handleSend}
            disabled={!inputVal.trim() || isProcessing}
            aria-label="Submit inbox item"
            className="absolute bottom-2.5 right-2.5 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{
              backgroundColor: inputVal.trim() ? '#92400e' : '#e7e3dc',
              color: inputVal.trim() ? 'white' : '#a8a29e',
            }}
          >
            {isProcessing ? (
              <div className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <Send size={12} />
            )}
          </button>
        </div>
        {isProcessing && (
          <div className="flex items-center gap-1.5 mt-2 text-xs" style={{ color: '#92400e' }}>
            <Sparkles size={11} />
            <span>Extracting details and placing on canvas…</span>
          </div>
        )}
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-2">

        {/* Unprocessed */}
        {unprocessed.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">To organize</span>
              <span className="text-xs rounded-full px-1.5 py-0.5 font-medium"
                style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>
                {unprocessed.length}
              </span>
            </div>
            <div className="space-y-2">
              {unprocessed.map(item => (
                <InboxItemCard key={item.id} item={item} onProcess={onProcessItem} />
              ))}
            </div>
          </div>
        )}

        {/* Processed */}
        {processed.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">On canvas</span>
              <span className="text-xs rounded-full px-1.5 py-0.5 font-medium"
                style={{ backgroundColor: '#d1fae5', color: '#065f46' }}>
                {processed.length}
              </span>
            </div>
            <div className="space-y-2">
              {processed.map(item => (
                <InboxItemCard key={item.id} item={item} onProcess={onProcessItem} dimmed />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 flex items-center justify-between"
        style={{ borderTop: '1px solid #e7e3dc', backgroundColor: '#faf9f7' }}>
        <span className="text-xs text-stone-400">{items.length} items total</span>
        <button
          onClick={onOpenAddManual}
          className="flex items-center gap-1 text-xs font-medium transition-colors hover:text-stone-700 cursor-pointer"
          style={{ color: '#92400e' }}
        >
          <Plus size={12} />
          Add manually
        </button>
      </div>
    </div>
  );
}

function InboxItemCard({
  item, onProcess, dimmed
}: {
  item: InboxItem;
  onProcess: (id: string) => void;
  dimmed?: boolean;
}) {
  const colors = sourceColors[item.type] || sourceColors.note;
  const icon = sourceIcons[item.type] || sourceIcons.note;

  return (
    <div
      className="rounded-xl p-3 transition-all duration-200 group"
      style={{
        backgroundColor: dimmed ? '#faf9f7' : '#fefcf8',
        border: `1px solid ${dimmed ? '#f0ece6' : '#e7e3dc'}`,
        opacity: dimmed ? 0.75 : 1,
      }}
    >
      {/* Source row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {item.avatar ? (
            <span className="text-sm">{item.avatar}</span>
          ) : (
            <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: colors.bg, color: colors.icon, border: `1px solid ${colors.border}` }}>
              {icon}
            </div>
          )}
          <span className="text-xs font-medium text-stone-600 truncate max-w-[120px]">{item.source}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-stone-300">{item.timestamp}</span>
          {!dimmed ? (
            <button
              onClick={() => onProcess(item.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-stone-400 hover:text-emerald-500"
              title="Mark as organized"
            >
              <Circle size={14} />
            </button>
          ) : (
            <CheckCircle2 size={14} className="text-emerald-400" />
          )}
        </div>
      </div>

      {/* Content */}
      <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">{item.content}</p>

      {/* Action */}
      {!dimmed && (
        <button
          onClick={() => onProcess(item.id)}
          className="mt-2.5 flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-all"
          style={{ color: '#92400e' }}
        >
          <Sparkles size={10} />
          Place on canvas
          <ChevronRight size={10} />
        </button>
      )}

      {dimmed && (
        <div className="mt-2 flex items-center gap-1 text-xs" style={{ color: '#059669' }}>
          <CheckCircle2 size={10} />
          <span>Added to canvas</span>
        </div>
      )}
    </div>
  );
}
