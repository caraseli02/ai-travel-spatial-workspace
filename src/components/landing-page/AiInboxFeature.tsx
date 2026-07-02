import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { inboxBullets } from "./landingData";
import { InboxMock } from "./InboxMock";

export function AiInboxFeature({ onEnterDemo }: { onEnterDemo: () => void }) {
  return (
    <section className="px-4 py-16 md:px-12 md:py-24">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 lg:flex-row-reverse lg:gap-[72px]">
        <div className="flex flex-col gap-5 lg:flex-1">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">AI inbox</p>
          <h2 className="font-serif text-[26px] leading-tight md:text-[40px]">
            Paste anything. We&apos;ll make sense of it.
          </h2>
          <p className="text-[15px] leading-relaxed text-muted-foreground md:text-[17px]">
            A booking confirmation, a friend&apos;s voice note, a screenshot from Instagram. Drop it
            in and Wayfarer recognizes flights, stays, and places — then files each one onto the
            right day, automatically.
          </p>
          <ul className="flex flex-col gap-3 pt-1">
            {inboxBullets.map((bullet) => (
              <li key={bullet} className="flex items-center gap-2.5 text-[15px] font-medium">
                <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Check className="size-3.5 text-primary" />
                </span>
                {bullet}
              </li>
            ))}
          </ul>
          <Button variant="outline" onClick={onEnterDemo} className="mt-2 w-fit gap-2">
            See it in action
            <ArrowRight className="size-4" />
          </Button>
        </div>

        <InboxMock className="w-full lg:w-[560px] lg:shrink-0" />
      </div>
    </section>
  );
}
