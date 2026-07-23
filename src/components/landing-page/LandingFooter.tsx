import { WayfarerLogo } from "@/components/WayfarerLogo";
import { footerLinkHrefs, footerLinks, socialLinks } from "./landingData";

export function LandingFooter() {
  return (
    <footer className="border-t border-white/10 bg-stone-900 px-4 py-12 text-stone-400 md:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-9">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between lg:gap-12">
          <div className="shrink-0 space-y-3.5 lg:max-w-sm">
            <WayfarerLogo className="text-stone-50" />
            <p className="text-sm leading-relaxed">
              The AI-native workspace for trips you can see. Capture anything, organize
              automatically, plan spatially.
            </p>
          </div>
          <div className="grid min-w-0 flex-1 gap-8 sm:grid-cols-3 sm:gap-x-10">
            {Object.entries(footerLinks).map(([heading, links]) => (
              <div key={heading} className="flex min-w-[8rem] flex-col gap-3">
                <p className="text-[13px] font-semibold text-stone-50">{heading}</p>
                {links.map((link) => {
                  const href = footerLinkHrefs[link];
                  if (href) {
                    return (
                      <a
                        key={link}
                        href={href}
                        className="text-sm transition-colors hover:text-stone-50"
                      >
                        {link}
                      </a>
                    );
                  }
                  return (
                    <span key={link} className="text-sm text-stone-500">
                      {link}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="h-px bg-white/10" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px]">© 2026 Wayfarer. Made for people who love the going.</p>
          <div className="flex gap-4">
            {socialLinks.map(({ href, label, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-stone-400 transition-colors hover:text-stone-50"
              >
                <Icon className="size-[18px]" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
