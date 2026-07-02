import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { testimonials } from "./landingData";

export function TestimonialsSection() {
  return (
    <section id="stories" className="scroll-mt-[68px] px-4 py-16 md:px-12 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">
            Stories
          </p>
          <h2 className="font-serif text-[26px] leading-tight md:text-[42px]">
            Travelers who stopped dreading the planning
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name} className="rounded-2xl py-7 shadow-sm">
              <CardContent className="flex flex-col gap-4 px-7">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="font-serif text-lg leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-1">
                  <div className={cn("size-10 rounded-full", t.avatarClass)} />
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-[13px] text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
