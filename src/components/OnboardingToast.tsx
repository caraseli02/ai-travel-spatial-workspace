import { useState, useEffect } from "react";
import { Sparkles, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  getOnboardingCompleted,
  setOnboardingCompleted,
} from "@/models/preferences";

export default function OnboardingToast({ forceShow = false }: { forceShow?: boolean }) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to your Kyoto canvas",
      body: "Everything from your inbox has been organized spatially. Cards are grouped by day.",
      icon: "🗾",
    },
    {
      title: "Pan & zoom freely",
      body: "Click and drag the canvas to explore. Use the zoom controls or scroll to zoom in.",
      icon: "🖱️",
    },
    {
      title: "Cards connect automatically",
      body: "Dashed lines show related items. Hover any card to see it lift off the canvas.",
      icon: "✨",
    },
  ];
  useEffect(() => {
    if (forceShow || !getOnboardingCompleted()) {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, [forceShow]);

  if (!visible) return null;

  const current = steps[step];

  const handleClose = () => {
    setVisible(false);
    setOnboardingCompleted(true);
  };

  return (
    <Card className="absolute right-4 bottom-28 z-30 w-72 gap-0 border-border bg-card py-0 shadow-lg ring-0">
      <CardHeader className="flex-row items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
          <Sparkles className="size-3" />
          Quick tip {step + 1}/{steps.length}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleClose}
          className="text-muted-foreground"
          aria-label="Close onboarding tips"
        >
          <X className="size-3.5" />
        </Button>
      </CardHeader>

      <CardContent className="px-4 py-3 [--card-spacing:--spacing(4)]">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-xl">{current.icon}</span>
          <div>
            <p className="mb-1 text-sm font-semibold text-foreground">{current.title}</p>
            <p className="text-xs leading-relaxed text-muted-foreground">{current.body}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-0 bg-transparent px-4 pb-3">
        <div className="flex gap-1">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                "size-1.5 rounded-full transition-all",
                i === step ? "bg-primary" : "bg-muted",
              )}
            />
          ))}
        </div>
        {step < steps.length - 1 ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep((s) => s + 1)}
            className="h-auto gap-1 px-0 text-xs font-medium text-primary hover:bg-transparent"
            aria-label="Next tip"
          >
            Next <ChevronRight className="size-3" />
          </Button>
        ) : (
          <Button size="sm" onClick={handleClose} className="h-auto text-xs" aria-label="Acknowledge and close onboarding tips">
            Got it!
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
