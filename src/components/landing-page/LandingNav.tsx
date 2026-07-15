import { useState } from "react";
import { Menu } from "lucide-react";
import { WayfarerLogo } from "@/components/WayfarerLogo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { navLinks } from "./landingData";

export function LandingNav({ onEnterDemo }: { onEnterDemo: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 right-0 left-0 z-50 flex h-[68px] items-center justify-between border-b border-border bg-background/92 px-4 backdrop-blur-md md:px-12">
        <WayfarerLogo />
        <div className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="transition-colors hover:text-foreground">
              {link.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            type="button"
            variant="ghost"
            className="hidden md:inline-flex"
            disabled
            title="Sign in coming soon"
          >
            Sign in
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 rounded-lg md:hidden"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </nav>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" className="w-[min(100vw,20rem)]">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 px-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2 px-4">
            <Button type="button" variant="outline" disabled title="Sign in coming soon">
              Sign in
            </Button>
            <Button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onEnterDemo();
              }}
            >
              Open demo
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
