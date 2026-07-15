import { useEffect, useState } from "react";
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

export interface AddDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dayNum: number, label: string) => void;
  nextDayNum: number;
}

export function AddDayModal({ isOpen, onClose, onSubmit, nextDayNum }: AddDayModalProps) {
  const [dayNum, setDayNum] = useState(String(nextDayNum));
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (isOpen) {
      setDayNum(String(nextDayNum));
      setLabel("");
    }
  }, [isOpen, nextDayNum]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    onSubmit(Number(dayNum), label);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="gap-0 p-0 sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="border-b border-border px-5 py-4">
            <DialogTitle>Add Custom Day</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 p-5">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Day Index
              </Label>
              <Input
                type="number"
                min="1"
                required
                value={dayNum}
                onChange={(e) => setDayNum(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Day Label / Activity
              </Label>
              <Input
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="text-xs"
                placeholder="e.g. Nanzenji Temple & Tofu dinner"
              />
            </div>
          </div>

          <DialogFooter className="px-5 py-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Day</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
