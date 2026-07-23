import { ArrowUp } from "lucide-react";
import LandingWorkspacePreview from "@/components/LandingWorkspacePreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function PromptCta({ onEnterDemo }: { onEnterDemo: () => void }) {
  return (
    <div className="w-full max-w-[660px]">
      <div className="flex flex-col gap-2.5 rounded-2xl border border-border bg-background p-3 shadow-[0_4px_16px_rgba(12,10,9,0.05)] md:flex-row md:items-center md:gap-3 md:rounded-full md:p-2 md:pl-5 md:shadow-[0_8px_24px_rgba(12,10,9,0.08)]">
        <Input
          readOnly
          role="button"
          aria-readonly="true"
          aria-label="Describe your dream trip"
          placeholder='Describe your dream trip… "7 relaxed days in Kyoto for two"'
          className="h-auto flex-1 cursor-pointer border-0 bg-transparent px-1 text-[13px] shadow-none focus-visible:ring-0 md:px-0 md:text-[15px]"
          onClick={onEnterDemo}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onEnterDemo();
            }
          }}
        />
        <Button
          onClick={onEnterDemo}
          className="h-10 w-full rounded-xl md:h-11 md:w-auto md:shrink-0 md:rounded-full"
        >
          Open Kyoto Demo
          <ArrowUp className="size-4" />
        </Button>
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground md:text-left">
        Try the demo — full trip planning opens in one click.
      </p>
    </div>
  );
}

export function HeroSection({ onEnterDemo }: { onEnterDemo: () => void }) {
  return (
    <section className="px-4 pt-24 pb-10 md:px-12 md:pt-28 md:pb-14">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-7 text-center md:gap-7">
        <h1 className="max-w-4xl font-serif text-[32px] leading-[1.05] font-semibold md:text-[64px]">
          Plan trips you can
          <br />
          actually see.
        </h1>

        <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground md:text-lg">
          Wayfarer turns scattered links, screenshots, and half-formed ideas into a living spatial
          canvas — organized by AI, day by day, ready the moment you land.
        </p>

        <PromptCta onEnterDemo={onEnterDemo} />

        <LandingWorkspacePreview />
      </div>
    </section>
  );
}
