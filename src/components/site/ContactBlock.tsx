import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { langSearch } from "@/components/site/SiteShell";
import { content, type Lang } from "@/lib/sungroup-content";

/** Shared "start your trade" band with office cards; anchored as #contact. */
export function ContactBlock({ lang }: { lang: Lang }) {
  const t = content[lang];
  return (
    <section id="contact" className="mx-auto max-w-7xl scroll-mt-6 px-6 pb-16">
      <div className="relative overflow-hidden rounded-3xl bg-secondary p-6 sm:p-10 md:p-14">
        <div className="pointer-events-none absolute -end-24 -top-24 size-80 rounded-full bg-glow" />
        <div className="relative grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">{t.ctaTitle}</h2>
            <p className="mt-4 text-muted-foreground">{t.ctaSub}</p>
            <Link
              to="/contact"
              search={langSearch(lang)}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-sm font-semibold text-primary-foreground"
            >
              {t.hero.primary}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
          </div>
          <div className="grid gap-4">
            {t.offices.map((o) => (
              <div key={o.city} className="rounded-2xl bg-card p-5 sm:p-6">
                <h3 className="font-semibold text-primary">{o.city}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{o.address}</p>
                <a href={`tel:${o.tel}`} className="mt-3 block text-sm font-semibold" dir="ltr">
                  {o.phone}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
