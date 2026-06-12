import { useState, useEffect } from "react";
import {
  MapPin,
  Star,
  Plane,
  Calendar,
  ExternalLink,
  Clock,
  Check,
  Edit3,
  Trash2,
  Link,
  Plus,
  Trash,
  Eye,
  X,
} from "lucide-react";
import type { CanvasCard } from "../models/trip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { CardSourceMemory } from "../models/tripMaterialMemory";

interface CardDetailPanelProps {
  card: CanvasCard | null;
  sourceMemory?: CardSourceMemory;
  onClose: () => void;
  onUpdateCard?: (updated: CanvasCard) => void;
  onDeleteCard?: (id: string) => void;
  onStartLinking?: (id: string) => void;
  isLinkingActive?: boolean;
}

const typeLabel: Record<string, string> = {
  flight: "Flight Ticket",
  hotel: "Hotel / Ryokan",
  polaroid: "Spatial Polaroid",
  sticky: "Sticky Note",
  article: "Saved Article",
  note: "Quick Note",
};

const typeIcon: Record<string, React.ReactNode> = {
  flight: <Plane size={13} />,
  hotel: <Star size={13} />,
  polaroid: <MapPin size={13} />,
  sticky: <span className="text-xs">📌</span>,
  article: <ExternalLink size={13} />,
  note: <Clock size={13} />,
};

const tagColorMap = [
  { value: "amber", label: "Amber" },
  { value: "orange", label: "Orange" },
  { value: "emerald", label: "Emerald" },
  { value: "rose", label: "Rose" },
  { value: "slate", label: "Slate" },
  { value: "blue", label: "Blue" },
];

const stickyColorPresets = [
  { hex: "#fef3c7", name: "Yellow" },
  { hex: "#fce7f3", name: "Pink" },
  { hex: "#d1fae5", name: "Green" },
  { hex: "#ffe4e6", name: "Red" },
  { hex: "#dbeafe", name: "Blue" },
];

export default function CardDetailPanel({
  card,
  sourceMemory,
  onClose,
  onUpdateCard,
  onDeleteCard,
  onStartLinking,
  isLinkingActive = false,
}: CardDetailPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editSubtitle, setEditSubtitle] = useState("");
  const [editTag, setEditTag] = useState("");
  const [editTagColor, setEditTagColor] = useState("slate");
  const [editDetails, setEditDetails] = useState<string[]>([]);
  const [editPrice, setEditPrice] = useState("");
  const [editRating, setEditRating] = useState(4.5);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!card) return;
    setEditTitle(card.title);
    setEditSubtitle(card.subtitle || "");
    setEditTag(card.tag || "");
    setEditTagColor(card.tagColor || "slate");
    setEditDetails(card.details || []);
    setEditPrice(card.price || "");
    setEditRating(card.rating || 4.5);
    setIsEditing(false);
    setConfirmDelete(false);
  }, [card?.id]);

  if (!card) return null;

  const handleFieldChange = (updates: Partial<CanvasCard>) => {
    onUpdateCard?.({ ...card, ...updates });
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
    const updated = [...editDetails, "New detail point"];
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
      onDeleteCard?.(card.id);
      onClose();
    }
  };

  const handleStartLinking = () => {
    onStartLinking?.(card.id);
    onClose();
  };

  return (
    <Sheet open={!!card} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="gap-0 overflow-y-auto p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-[280px]"
      >
        <SheetHeader className="sticky top-0 z-10 flex-row items-center justify-between border-b border-border bg-card p-0">
          <div className="flex items-center gap-2 px-4 py-3 text-xs font-semibold text-muted-foreground">
            <span className="text-primary">{typeIcon[card.type]}</span>
            <SheetTitle className="text-xs font-semibold text-muted-foreground">
              {typeLabel[card.type] || "Card"}
            </SheetTitle>
          </div>
          <div className="flex items-center gap-1 px-4">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsEditing((e) => !e)}
              title={isEditing ? "View details" : "Edit details"}
              aria-label={isEditing ? "View details" : "Edit details"}
            >
              {isEditing ? <Eye className="size-3.5" /> : <Edit3 className="size-3.5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              aria-label="Close details panel"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        </SheetHeader>

        {card.image && (
          <div className="relative h-[140px] w-full shrink-0 overflow-hidden bg-muted">
            <img src={card.image} alt={card.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/10 transition-all group-hover:bg-black/25" />
          </div>
        )}

        <div className="flex-1 p-4">
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  Title
                </Label>
                <Input
                  value={editTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="h-8 text-xs"
                  placeholder="Enter title"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  Subtitle / Description
                </Label>
                <Textarea
                  value={editSubtitle}
                  onChange={(e) => handleSubtitleChange(e.target.value)}
                  className="h-16 resize-none text-xs"
                  placeholder="Enter subtitle"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Tag Text
                  </Label>
                  <Input
                    value={editTag}
                    onChange={(e) => handleTagChange(e.target.value)}
                    className="h-8 text-xs"
                    placeholder="e.g. Day 1"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Tag Color
                  </Label>
                  <Select value={editTagColor} onValueChange={handleTagColorChange}>
                    <SelectTrigger className="h-8 w-full text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tagColorMap.map((tc) => (
                        <SelectItem key={tc.value} value={tc.value}>
                          {tc.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {card.type === "sticky" && (
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Sticky Color
                  </Label>
                  <div className="mt-1 flex items-center gap-2">
                    {stickyColorPresets.map((preset) => (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => handleFieldChange({ color: preset.hex })}
                        className="relative size-6 rounded-full border transition-all"
                        style={{
                          backgroundColor: preset.hex,
                          borderColor: card.color === preset.hex ? "var(--primary)" : "var(--border)",
                          transform: card.color === preset.hex ? "scale(1.15)" : "none",
                        }}
                        title={preset.name}
                      >
                        {card.color === preset.hex && (
                          <Check size={10} className="absolute inset-0 m-auto text-amber-800" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                {(card.type === "hotel" || card.type === "polaroid") && (
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      Rating
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      value={editRating}
                      onChange={(e) => handleRatingChange(parseFloat(e.target.value) || 4.5)}
                      className="h-8 text-xs"
                    />
                  </div>
                )}
                {(card.type === "hotel" || card.type === "flight") && (
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      Price
                    </Label>
                    <Input
                      value={editPrice}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      className="h-8 text-xs"
                      placeholder="e.g. $120"
                    />
                  </div>
                )}
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Details / Items
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleAddDetail}
                    className="h-auto gap-0.5 px-0 text-[10px] font-semibold text-primary hover:bg-transparent"
                  >
                    <Plus className="size-2.5" />
                    Add bullet
                  </Button>
                </div>
                <div className="space-y-1.5">
                  {editDetails.map((detail, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="size-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                      <Input
                        value={detail}
                        onChange={(e) => handleDetailItemChange(idx, e.target.value)}
                        className="h-7 flex-1 text-xs"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleRemoveDetail(idx)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label="Remove detail line"
                      >
                        <Trash className="size-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="mb-1 text-base leading-tight font-bold text-foreground">
                  {card.title}
                </h2>
                {card.subtitle && (
                  <p className="text-xs leading-relaxed text-muted-foreground">{card.subtitle}</p>
                )}
              </div>

              {card.tag && (
                <Badge
                  variant="secondary"
                  className="border-amber-200 bg-amber-50 text-[10px] font-bold tracking-wider text-amber-900 uppercase"
                >
                  {card.tag}
                </Badge>
              )}

              {card.rating && (
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={11}
                      className={
                        i < Math.floor(card.rating!)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-muted text-muted"
                      }
                    />
                  ))}
                  <span className="ml-1 text-xs font-semibold text-muted-foreground">
                    {card.rating} · Recommended
                  </span>
                </div>
              )}

              {card.details && card.details.length > 0 && (
                <div>
                  <p className="mb-1.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Details
                  </p>
                  <ul className="space-y-1.5">
                    {card.details.map((d, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <Check size={12} className="mt-0.5 shrink-0 text-primary" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {card.price && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 py-2.5 text-center">
                  <p className="text-xl font-extrabold text-foreground">{card.price}</p>
                  <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Estimated Total
                  </p>
                </div>
              )}

              {sourceMemory && <TripMaterialMemoryBlock sourceMemory={sourceMemory} />}

              {card.type === "flight" && (
                <div className="rounded-xl border border-border bg-muted/50 p-3">
                  <div className="flex items-center justify-between text-foreground">
                    <div className="text-center">
                      <p className="text-sm font-bold">SFO</p>
                      <p className="text-[10px] text-muted-foreground">11:05am</p>
                    </div>
                    <div className="flex flex-1 flex-col items-center px-1">
                      <p className="text-[9px] text-muted-foreground">12h 40m nonstop</p>
                      <div className="mt-0.5 flex w-full items-center gap-1">
                        <div className="h-px flex-1 bg-border" />
                        <Plane size={10} className="text-muted-foreground" />
                        <div className="h-px flex-1 bg-border" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold">KIX</p>
                      <p className="text-[10px] text-muted-foreground">+1 3:45pm</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-auto shrink-0 space-y-2 border-t border-border bg-muted/30 p-4">
          {onStartLinking && (
            <Button
              variant="outline"
              onClick={handleStartLinking}
              className={cn(
                "w-full text-xs font-semibold",
                isLinkingActive && "animate-pulse border-amber-300 bg-amber-100 text-amber-900",
              )}
            >
              <Link className={cn("size-3", isLinkingActive ? "text-amber-700" : "")} />
              {isLinkingActive ? "Select target card on canvas..." : "Link with another card"}
            </Button>
          )}

          <div className="grid grid-cols-2 gap-2">
            {onDeleteCard && (
              <Button
                variant="outline"
                onClick={handleDelete}
                className={cn(
                  "text-xs font-semibold",
                  confirmDelete && "animate-pulse border-destructive bg-destructive text-destructive-foreground",
                )}
              >
                <Trash2 className="size-3" />
                {confirmDelete ? "Confirm delete" : "Delete Card"}
              </Button>
            )}

            <Button variant="outline" className="text-xs font-semibold text-muted-foreground">
              <Calendar className="size-3" />
              Itinerary
            </Button>
          </div>

          {sourceMemory?.kind === "source-backed" && sourceMemory.sourceUrl && (
            <Button asChild className="w-full text-xs font-bold">
              <a href={sourceMemory.sourceUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="size-3" />
                Open original link
              </a>
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function TripMaterialMemoryBlock({ sourceMemory }: { sourceMemory: CardSourceMemory }) {
  if (sourceMemory.kind === "manual") {
    return (
      <div className="rounded-lg border border-border bg-muted/40 p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Trip Material Memory
          </p>
          <Badge variant="secondary" className="text-[10px]">
            Manual
          </Badge>
        </div>
        <p className="text-xs font-semibold text-foreground">{sourceMemory.title}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {sourceMemory.description}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold tracking-wider text-emerald-900 uppercase">
          Trip Material Memory
        </p>
        <Badge className="border-emerald-200 bg-white text-[10px] text-emerald-800">
          Source-backed
        </Badge>
      </div>
      <p className="text-xs font-semibold text-foreground">{sourceMemory.sourceLabel}</p>
      <p className="mt-1 line-clamp-4 text-xs leading-relaxed text-muted-foreground">
        {sourceMemory.rawContent}
      </p>
      {sourceMemory.sourceUrl && (
        <a
          href={sourceMemory.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex max-w-full items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <ExternalLink className="size-3 shrink-0" />
          <span className="truncate">{sourceMemory.sourceUrl}</span>
        </a>
      )}
    </div>
  );
}
