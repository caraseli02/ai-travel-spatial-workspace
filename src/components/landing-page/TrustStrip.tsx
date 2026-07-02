import { trustDestinations } from "./landingData";

export function TrustStrip() {
  return (
    <section className="border-y border-border bg-background px-4 py-10 md:px-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4">
        <p className="text-center text-xs font-semibold tracking-[0.15em] text-muted-foreground uppercase">
          Trusted for trips to over 1,200 destinations
        </p>
        <div className="grid w-full max-w-lg grid-cols-2 gap-2.5 sm:max-w-none sm:flex sm:flex-wrap sm:justify-center">
          {trustDestinations.map((dest) => (
            <div
              key={dest.name}
              className="flex items-center justify-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-1.5 sm:justify-start"
            >
              <span className="text-sm">{dest.flag}</span>
              <span className="text-sm font-medium">{dest.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
