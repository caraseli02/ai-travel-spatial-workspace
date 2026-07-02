import { Card, CardContent } from "@/components/ui/card";
import { howItWorksSteps } from "./landingData";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-[68px] bg-muted px-4 py-16 md:px-12 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-3xl text-center md:mb-14">
          <p className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">
            How it works
          </p>
          <h2 className="mb-3 font-serif text-[26px] leading-tight md:text-[42px]">
            From chaos to clarity in three steps
          </h2>
          <p className="text-[15px] text-muted-foreground md:text-[17px]">
            No more scattered tabs and group-chat screenshots. Wayfarer takes the mess and hands
            back a plan you can see.
          </p>
        </div>
        <div className="grid gap-7 md:grid-cols-3">
          {howItWorksSteps.map((step) => (
            <Card key={step.num} className="rounded-2xl py-7 shadow-sm">
              <CardContent className="flex flex-col gap-4 px-7">
                <div className="flex items-start justify-between">
                  <div className="flex size-[52px] items-center justify-center rounded-[14px] border border-primary/15 bg-primary/5 text-primary">
                    <step.icon size={22} />
                  </div>
                  <span className="font-serif text-3xl font-semibold text-muted-foreground/30">
                    {step.num}
                  </span>
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
