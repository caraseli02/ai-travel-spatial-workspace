import { Check, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Explorer",
    price: "$0",
    period: "/ forever",
    desc: "For your very first trip.",
    features: [
      "1 active trip",
      "Spatial canvas",
      "AI inbox — 10 items / mo",
      "Local-device storage",
    ],
    cta: "Get started",
    highlighted: false,
    badge: null,
  },
  {
    name: "Wanderer",
    price: "$9",
    period: "/ per month",
    desc: "For the always-planning.",
    features: [
      "Unlimited trips",
      "Unlimited AI inbox",
      "Connections & day planning",
      "Cloud sync across devices",
      "Export to PDF",
    ],
    cta: "Start free trial",
    highlighted: true,
    badge: "Most popular",
  },
  {
    name: "Nomad",
    price: "$19",
    period: "/ per month",
    desc: "For trips with friends.",
    features: [
      "Everything in Wanderer",
      "Real-time collaboration",
      "Shared trip canvas",
      "Priority AI processing",
      "Concierge support",
    ],
    cta: "Go Nomad",
    highlighted: false,
    badge: null,
  },
] as const;

export default function PricingSection({ onCtaClick }: { onCtaClick?: () => void }) {
  return (
    <section id="pricing" className="scroll-mt-[68px] bg-muted px-4 py-16 md:px-12 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center md:mb-14">
          <p className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">
            Pricing
          </p>
          <h2 className="mb-4 font-serif text-3xl text-foreground md:text-[42px] md:leading-tight">
            Start free. Upgrade when wanderlust strikes.
          </h2>
          <p className="mx-auto max-w-lg text-muted-foreground">
            No credit card to begin. Your first trip is always free.
          </p>
        </div>

        <div className="grid items-stretch gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.name} className="relative">
              <Card
                className={cn(
                  "flex h-full flex-col gap-5 rounded-[18px] py-8",
                  plan.highlighted && "border-2 border-primary shadow-[0_18px_40px_rgba(234,88,12,0.15)]",
                )}
              >
                <CardHeader className="gap-5 px-8 pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    {plan.badge && (
                      <Badge className="gap-1 text-[11px]">
                        <Sparkles className="size-3" />
                        {plan.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-end gap-1.5">
                    <span className="font-serif text-5xl font-semibold">{plan.price}</span>
                    <span className="pb-2 text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.desc}</p>
                  <div className="h-px bg-border" />
                </CardHeader>

                <CardContent className="flex-1 px-8">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm">
                        <Check size={16} className="mt-0.5 shrink-0 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="mt-auto border-t-0 bg-transparent px-8">
                  <Button
                    type="button"
                    variant={plan.highlighted ? "default" : "outline"}
                    className="w-full"
                    onClick={onCtaClick}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
