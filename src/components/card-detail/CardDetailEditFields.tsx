import { Check, Plus, Trash } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { TAG_COLOR_OPTIONS, STICKY_COLOR_PRESETS } from "./constants";
import type { CardDetailEditProps } from "./types";

export function CardDetailCommonEditFields({ editState, handlers }: CardDetailEditProps) {
  return (
    <>
      <div className="space-y-1">
        <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
          Title
        </Label>
        <Input
          value={editState.title}
          onChange={(e) => handlers.onTitleChange(e.target.value)}
          className="h-8 text-xs"
          placeholder="Enter title"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
          Subtitle / Description
        </Label>
        <Textarea
          value={editState.subtitle}
          onChange={(e) => handlers.onSubtitleChange(e.target.value)}
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
            value={editState.tag}
            onChange={(e) => handlers.onTagChange(e.target.value)}
            className="h-8 text-xs"
            placeholder="e.g. Day 1"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Tag Color
          </Label>
          <Select value={editState.tagColor} onValueChange={handlers.onTagColorChange}>
            <SelectTrigger className="h-8 w-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TAG_COLOR_OPTIONS.map((tc) => (
                <SelectItem key={tc.value} value={tc.value}>
                  {tc.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
}

export function CardDetailDetailsEditList({ editState, handlers }: CardDetailEditProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
          Details / Items
        </Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handlers.onAddDetail}
          className="h-auto gap-0.5 px-0 text-[10px] font-semibold text-primary hover:bg-transparent"
        >
          <Plus className="size-2.5" />
          Add bullet
        </Button>
      </div>
      <div className="space-y-1.5">
        {editState.details.map((detail, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <span className="size-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
            <Input
              value={detail}
              onChange={(e) => handlers.onDetailItemChange(idx, e.target.value)}
              className="h-7 flex-1 text-xs"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => handlers.onRemoveDetail(idx)}
              className="text-muted-foreground hover:text-destructive"
              aria-label="Remove detail line"
            >
              <Trash className="size-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardDetailRatingEditField({ editState, handlers }: CardDetailEditProps) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
        Rating
      </Label>
      <Input
        type="number"
        min="1"
        max="5"
        step="0.1"
        value={editState.rating}
        onChange={(e) => handlers.onRatingChange(parseFloat(e.target.value) || 4.5)}
        className="h-8 text-xs"
      />
    </div>
  );
}

export function CardDetailPriceEditField({ editState, handlers }: CardDetailEditProps) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
        Price
      </Label>
      <Input
        value={editState.price}
        onChange={(e) => handlers.onPriceChange(e.target.value)}
        className="h-8 text-xs"
        placeholder="e.g. $120"
      />
    </div>
  );
}

export function CardDetailStickyColorField({ card, handlers }: CardDetailEditProps) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
        Sticky Color
      </Label>
      <div className="mt-1 flex items-center gap-2">
        {STICKY_COLOR_PRESETS.map((preset) => (
          <Button
            key={preset.hex}
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => handlers.onFieldChange({ color: preset.hex })}
            className="relative size-6 rounded-full border p-0 hover:bg-transparent"
            style={{
              backgroundColor: preset.hex,
              borderColor: card.color === preset.hex ? "var(--primary)" : "var(--border)",
              transform: card.color === preset.hex ? "scale(1.15)" : "none",
            }}
            aria-label={`Set sticky color to ${preset.name}`}
            title={preset.name}
          >
            {card.color === preset.hex && (
              <Check size={10} className="absolute inset-0 m-auto text-amber-800" />
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}
