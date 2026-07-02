import { useEffect, useState } from "react";
import type { CanvasCard } from "@/models/trip";
import { cardTypeOptions, isCardType, type CardType } from "@/models/tripWorkspaceModel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

export interface CreateCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (cardData: Omit<CanvasCard, "id" | "x" | "y" | "rotation">) => void;
  days: { day: number; label: string }[];
}

export function CreateCardModal({ isOpen, onClose, onSubmit, days }: CreateCardModalProps) {
  const [type, setType] = useState<CardType>("sticky");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [day, setDay] = useState("0");
  const [detailsString, setDetailsString] = useState("");
  const [price, setPrice] = useState("");
  const [rating, setRating] = useState("4.5");

  useEffect(() => {
    if (isOpen) {
      setType("sticky");
      setTitle("");
      setSubtitle("");
      setDay("0");
      setDetailsString("");
      setPrice("");
      setRating("4.5");
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const details = detailsString
      ? detailsString
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    let image = undefined;
    let color = undefined;

    if (type === "polaroid") {
      image = "/images/gion.jpg";
    } else if (type === "hotel") {
      image = "/images/ryokan.jpg";
    } else if (type === "sticky") {
      color = "#fef3c7";
    }

    onSubmit({
      type,
      title,
      subtitle: subtitle || undefined,
      day: Number(day),
      details: details.length > 0 ? details : undefined,
      price: price || undefined,
      rating: type === "hotel" || type === "polaroid" ? Number(rating) : undefined,
      image,
      color,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <form onSubmit={handleSubmit} className="flex max-h-[90vh] flex-col">
          <DialogHeader className="border-b border-border px-5 py-4">
            <DialogTitle>Create Spatial Card</DialogTitle>
          </DialogHeader>

          <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-5">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Card Type
              </Label>
              <Select value={type} onValueChange={(v) => isCardType(v) && setType(v)}>
                <SelectTrigger className="h-9 w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cardTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Title
              </Label>
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xs"
                placeholder="e.g. Kyoto Tower visit"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Subtitle / Description
              </Label>
              <Input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="text-xs"
                placeholder="e.g. Evening panorama of the city lights"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Associate Day
              </Label>
              <Select value={day} onValueChange={setDay}>
                <SelectTrigger className="h-9 w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Unassigned (Logistics)</SelectItem>
                  {days.map((d) => (
                    <SelectItem key={d.day} value={String(d.day)}>
                      Day {d.day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Details (one bullet per line)
              </Label>
              <Textarea
                value={detailsString}
                onChange={(e) => setDetailsString(e.target.value)}
                className="h-16 resize-none text-xs"
                placeholder={"Detail line 1\nDetail line 2"}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {(type === "hotel" || type === "flight") && (
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Price
                  </Label>
                  <Input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="text-xs"
                    placeholder="e.g. $140 total"
                  />
                </div>
              )}
              {(type === "hotel" || type === "polaroid") && (
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Rating
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="text-xs"
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="shrink-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Card</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
