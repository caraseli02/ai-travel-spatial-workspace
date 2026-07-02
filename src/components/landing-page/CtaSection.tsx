import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection({ onEnterDemo }: { onEnterDemo: () => void }) {
  return (
    <section className="bg-stone-950 px-4 py-16 md:px-12 md:py-24">
      <div
        className="mx-auto flex max-w-5xl flex-col items-center gap-5 rounded-[28px] px-6 py-14 text-center text-white md:gap-6 md:px-16 md:py-[76px]"
        style={{
          background: "linear-gradient(300deg, #f97316 0%, #9a3412 100%)",
          boxShadow: "0 24px 60px rgba(154, 52, 18, 0.35)",
        }}
      >
        <p className="text-[13px] font-semibold tracking-widest text-white/80 uppercase">
          Ready when you are
        </p>
        <h2 className="max-w-3xl font-serif text-[32px] leading-tight font-semibold md:text-[52px]">
          Your next trip is waiting.
        </h2>
        <p className="max-w-lg text-[15px] leading-relaxed text-white/90 md:text-lg">
          Start with a single sentence and watch it become a trip you can actually see. Your first
          one is on us.
        </p>
        <div className="flex w-full max-w-md flex-col gap-3 pt-2 sm:max-w-none sm:flex-row sm:justify-center">
          <Button
            onClick={onEnterDemo}
            size="lg"
            className="h-auto gap-2 rounded-full bg-white px-6 py-3.5 text-orange-900 hover:bg-white/90"
          >
            Start planning free
            <ArrowRight className="size-4" />
          </Button>
          <Button
            onClick={onEnterDemo}
            size="lg"
            variant="outline"
            className="h-auto gap-2 rounded-full border-white/30 bg-white/10 px-6 py-3.5 text-white hover:bg-white/20 hover:text-white"
          >
            <Play className="size-4" />
            Try the demo trip
          </Button>
        </div>
        <p className="text-[13px] text-white/70">
          Free forever for your first trip · No credit card required
        </p>
      </div>
    </section>
  );
}
