import { Check, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Explorer",
    price: "Free",
    period: "",
    desc: "Perfect for solo travelers with one upcoming trip.",
    features: [
      "1 active trip canvas",
      "Up to 50 cards",
      "AI inbox processing (20/mo)",
      "Export to PDF",
      "Mobile view",
    ],
    cta: "Get started free",
    highlighted: false,
    badge: null,
  },
  {
    name: "Wanderer",
    price: "$9",
    period: "/mo",
    desc: "For frequent travelers who plan multiple trips at once.",
    features: [
      "Unlimited trip canvases",
      "Unlimited cards",
      "AI inbox (unlimited)",
      "Collaborative planning (3 people)",
      "Export to PDF & Notion",
      "Priority support",
    ],
    cta: "Start 14-day trial",
    highlighted: true,
    badge: "Most popular",
  },
  {
    name: "Nomad",
    price: "$24",
    period: "/mo",
    desc: "For travel agencies and power users managing group trips.",
    features: [
      "Everything in Wanderer",
      "Unlimited collaborators",
      "Custom branding",
      "API access",
      "Dedicated onboarding",
      "SLA guarantee",
    ],
    cta: "Contact us",
    highlighted: false,
    badge: null,
  },
];

export default function PricingSection() {
  return (
    <section className="py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Pricing
          </p>
          <h2 className="font-serif text-4xl text-foreground mb-4">Simple, honest pricing.</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            No per-seat pricing tricks. No surprise paywalls.
            <br />
            Pay for what you need.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => (
            <div key={plan.name} className={cn("relative", plan.highlighted && "dark")}>
              <Card
                className={cn(
                  "h-full",
                  plan.highlighted && "border-2 border-primary bg-background text-foreground",
                )}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="gap-1">
                      <Sparkles className="size-3" />
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-0">
                  <CardTitle className={cn("text-lg", plan.highlighted && "text-amber-100")}>
                    {plan.name}
                  </CardTitle>
                  <CardDescription className={cn(plan.highlighted && "text-muted-foreground")}>
                    {plan.desc}
                  </CardDescription>
                  <div className="flex items-baseline gap-1 pt-2">
                    <span
                      className={cn(
                        "text-4xl font-bold",
                        plan.highlighted ? "text-foreground" : "text-foreground",
                      )}
                    >
                      {plan.price}
                    </span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-2.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm">
                        <Check
                          size={14}
                          className={cn(
                            "mt-0.5 shrink-0",
                            plan.highlighted ? "text-primary" : "text-emerald-500",
                          )}
                        />
                        <span
                          className={cn(plan.highlighted ? "text-stone-300" : "text-stone-600")}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="border-t-0 bg-transparent">
                  <Button
                    variant={plan.highlighted ? "default" : "secondary"}
                    className={cn("w-full", !plan.highlighted && "border border-border")}
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
