import { useState } from "react";
import type { FormEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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

interface CreateTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    name: string,
    destination: string,
    emoji: string,
    dates?: { start: string; end: string },
  ) => void;
}

export function CreateTripDialog({ open, onOpenChange, onSubmit }: CreateTripDialogProps) {
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

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
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
              {EMOJI_PRESETS.map((preset, index) => (
                <Button
                  key={index}
                  type="button"
                  variant={emoji === preset ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setEmoji(preset)}
                  className={cn(
                    "size-8 text-sm",
                    emoji === preset && "scale-110 bg-primary/20 ring-2 ring-primary",
                  )}
                >
                  {preset}
                </Button>
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
              onChange={(event) => setName(event.target.value)}
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
              onChange={(event) => setDestination(event.target.value)}
              placeholder="e.g., Kyoto, Japan"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Dates <span className="font-normal text-muted-foreground/70">(optional)</span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
              <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
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
