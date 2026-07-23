import { howItWorksSteps } from "./landingData";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-[68px] bg-muted px-4 py-16 md:px-12 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-3xl text-center md:mb-16">
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
        <div className="grid gap-10 md:grid-cols-3 md:gap-14">
          {howItWorksSteps.map((step) => (
            <article
              key={step.num}
              className="flex flex-col gap-3 border-t border-foreground/10 pt-6"
            >
              <span className="font-serif text-5xl leading-none font-semibold tracking-tight text-primary/40 md:text-6xl">
                {step.num}
              </span>
              <h3 className="mt-2 text-xl font-semibold tracking-tight">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                {step.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
