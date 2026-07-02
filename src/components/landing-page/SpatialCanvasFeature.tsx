import { ArrowRight, Check } from "lucide-react";
import { FeatureKanbanPreview } from "@/components/LandingWorkspacePreview";
import { Button } from "@/components/ui/button";
import { canvasBullets } from "./landingData";

export function SpatialCanvasFeature({ onEnterDemo }: { onEnterDemo: () => void }) {
  return (
    <section id="features" className="scroll-mt-[68px] px-4 py-16 md:px-12 md:py-24">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 lg:flex-row lg:gap-[72px]">
        <div className="flex flex-col gap-5 lg:flex-1">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            Spatial canvas
          </p>
          <h2 className="font-serif text-[26px] leading-tight md:text-[40px]">
            Your trip as a living moodboard
          </h2>
          <p className="text-[15px] leading-relaxed text-muted-foreground md:text-[17px]">
            Lists flatten a trip. The canvas gives it space. Drag cards into days, cluster the places
            that belong together, and draw connections between a hotel and the dinner spot down the
            street — the way you actually think about a journey.
          </p>
          <ul className="flex flex-col gap-3 pt-1">
            {canvasBullets.map((bullet) => (
              <li key={bullet} className="flex items-center gap-2.5 text-[15px] font-medium">
                <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Check className="size-3.5 text-primary" />
                </span>
                {bullet}
              </li>
            ))}
          </ul>
          <Button variant="outline" onClick={onEnterDemo} className="mt-2 w-fit gap-2">
            Explore the canvas
            <ArrowRight className="size-4" />
          </Button>
        </div>

        <div className="h-[360px] w-full rounded-[20px] border border-border shadow-lg md:h-[440px] lg:w-[600px] lg:shrink-0">
          <FeatureKanbanPreview />
        </div>
      </div>
    </section>
  );
}
