import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Languages, PackageSearch } from "lucide-react";
import { Wordmark } from "@/components/site/Logo";
import { content, dirOf, type Lang } from "@/lib/sungroup-content";
import { cn } from "@/lib/utils";

export type SitePath = "/" | "/services" | "/group" | "/about" | "/contact" | "/track" | "/auth" | "/dashboard" | "/team";

/** Search object that keeps the chosen language when navigating. */
export const langSearch = (lang: Lang) => (lang === "en" ? { lang: "en" as const } : {});

// Order matches content[lang].nav: services, group companies, about, contact.
const navTargets = [
  { to: "/services", hash: undefined },
  { to: "/group", hash: undefined },
  { to: "/about", hash: undefined },
  { to: "/contact", hash: undefined },
] as const;

/** Shared header + footer for every page of the site. */
export function SiteShell({ lang, current, children }: { lang: Lang; current: SitePath; children: ReactNode }) {
  const t = content[lang];
  const other: Lang = lang === "fa" ? "en" : "fa";

  const navLinks = (className: string, activeClass: string) =>
    t.nav.map((label, i) => {
      const target = navTargets[i];
      if (!target) return null;
      const active = target.to === current && !target.hash;
      return (
        <Link
          key={label}
          to={target.to}
          {...(target.hash ? { hash: target.hash } : {})}
          search={langSearch(lang)}
          aria-current={active ? "page" : undefined}
          className={cn(className, active && activeClass)}
        >
          {label}
        </Link>
      );
    });

  return (
    <div dir={dirOf(lang)} lang={lang} className="min-h-screen overflow-hidden bg-background font-sans text-foreground">
      <header className="mx-auto max-w-7xl px-6 pt-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
          <Link to="/" search={langSearch(lang)} aria-label={t.brand} className="min-w-0">
            <Wordmark label={t.brandShort} markId="header" />
          </Link>
          <nav className="hidden items-center gap-1 rounded-full bg-card p-1.5 text-sm shadow-soft md:flex">
            {navLinks("rounded-full px-4 py-2 transition-colors hover:bg-secondary", "bg-secondary font-medium")}
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/track"
              search={langSearch(lang)}
              aria-label={t.footerLinks.track}
              aria-current={current === "/track" ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2.5 text-sm font-medium transition-colors hover:bg-secondary",
                current === "/track" && "border-primary text-primary",
              )}
            >
              <PackageSearch className="size-4" />
              <span className="hidden lg:inline">{t.footerLinks.track}</span>
            </Link>
            <Link
              to={current}
              search={langSearch(other)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
            >
              <Languages className="size-4" />
              <span dir="ltr">{other === "en" ? "EN" : "FA"}</span>
            </Link>
            <Link
              to="/contact"
              search={langSearch(lang)}
              className="hidden rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground sm:inline-flex"
            >
              {t.nav[3]}
            </Link>
          </div>
        </div>
        <nav className="mt-4 grid grid-cols-[minmax(0,1fr)_minmax(0,1.65fr)_minmax(0,1.25fr)_minmax(0,1fr)] items-stretch gap-1 rounded-full border border-border bg-card p-1 text-xs sm:text-sm md:hidden">
          {navLinks(
            "flex min-h-10 min-w-0 items-center justify-center rounded-full px-1.5 py-2 text-center leading-5 transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            "bg-primary font-medium text-primary-foreground hover:bg-primary",
          )}
        </nav>
      </header>

      <main>{children}</main>

      <footer className="mx-auto max-w-7xl px-6 pb-10">
        <div className="flex flex-col gap-6 border-t border-border pt-10 md:flex-row md:items-center md:justify-between">
          <Wordmark label={t.brandShort} />
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {navLinks("transition-colors hover:text-foreground", "text-foreground font-medium")}
          </nav>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-xs text-muted-foreground">
          <p>{t.footer}</p>
          <div className="flex gap-5">
            <Link to="/track" search={langSearch(lang)} className="transition-colors hover:text-foreground">
              {t.footerLinks.track}
            </Link>
            <Link to="/auth" search={langSearch(lang)} className="transition-colors hover:text-foreground">
              {t.footerLinks.team}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
