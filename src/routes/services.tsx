import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  ChevronDown,
  FileSignature,
  Globe2,
  Handshake,
  PackageCheck,
  Plane,
  SearchCheck,
  Ship,
  TrainFront,
  Truck,
} from "lucide-react";
import terminal from "@/assets/services-terminal.jpg";
import { ContactBlock } from "@/components/site/ContactBlock";
import { langSearch, SiteShell } from "@/components/site/SiteShell";
import { content, parseLang } from "@/lib/sungroup-content";

export const Route = createFileRoute("/services")({
  validateSearch: parseLang,
  head: () => ({
    meta: [
      { title: "خدمات بازرگانی | SUNGROUP — گروه بازرگانی آفتاب" },
      {
        name: "description",
        content: "مشاوره، بازرسی کیفیت، واردات از چین، صادرات، حمل درب به درب و تنظیم قرارداد؛ همه خدمات گروه بازرگانی آفتاب.",
      },
      { property: "og:title", content: "خدمات بازرگانی | SUNGROUP" },
      {
        property: "og:description",
        content: "صفر تا صد تجارت شما با چین، زیر یک سقف — از انتخاب کالا تا تحویل در انبار.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServicesPage,
});

const serviceIcons = [Handshake, SearchCheck, Globe2, PackageCheck, Truck, FileSignature];
const shippingIcons = [Ship, Plane, TrainFront, Truck];

const num = (n: number, lang: "fa" | "en") =>
  (lang === "fa" ? n.toLocaleString("fa-IR") : String(n)).padStart(2, lang === "fa" ? "۰" : "0");

function ServicesPage() {
  const lang = Route.useSearch().lang ?? "fa";
  const t = content[lang];
  const p = t.servicesPage;

  return (
    <SiteShell lang={lang} current="/services">
      {/* Page hero */}
      <section className="relative mx-auto max-w-7xl px-6 pt-10 md:pt-16">
        <div className="pointer-events-none absolute -top-40 start-0 size-[560px] rounded-full bg-glow" />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div>
            <span className="inline-block rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">
              {p.eyebrow}
            </span>
            <h1 className="mt-6 font-display text-3xl font-semibold leading-[1.25] sm:text-4xl md:text-5xl">{p.title}</h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">{p.sub}</p>
            <Link
              to="/contact"
              search={langSearch(lang)}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5"
            >
              {t.hero.primary}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
          </div>
          <img
            src={terminal}
            alt=""
            width={1920}
            height={1088}
            className="aspect-[4/3] w-full rounded-3xl object-cover shadow-soft lg:aspect-[5/4]"
          />
        </div>
      </section>

      {/* Services in detail */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl md:text-4xl">{p.detailsTitle}</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {p.details.map((s, i) => {
            const Icon = serviceIcons[i] ?? Handshake;
            return (
              <article key={s.title} className="flex flex-col rounded-3xl bg-card p-6 transition-shadow hover:shadow-soft sm:p-8">
                <div className="flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-6" />
                  </span>
                  <span className="font-display text-sm font-semibold text-muted-foreground">{num(i + 1, lang)}</span>
                </div>
                <h3 className="mt-5 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">{s.body}</p>
                <div className="mt-6 border-t border-border pt-5">
                  <div className="text-xs font-semibold text-primary">{p.includes}</div>
                  <ul className="mt-3 grid gap-2.5">
                    {s.points.map((pt) => (
                      <li key={pt} className="flex items-center gap-2.5 text-sm">
                        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                          <Check className="size-3" />
                        </span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Shipping modes */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="rounded-3xl bg-inverse px-6 py-10 text-inverse-foreground md:px-14 md:py-14">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">{p.shippingTitle}</h2>
          <p className="mt-3 max-w-xl text-inverse-foreground/70">{p.shippingSub}</p>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {p.shipping.map((m, i) => {
              const Icon = shippingIcons[i] ?? Ship;
              return (
                <div key={m.title} className="rounded-2xl bg-inverse-foreground/5 p-5 ring-1 ring-inverse-foreground/10">
                  <span className="grid size-11 place-items-center rounded-full bg-accent text-accent-foreground">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{m.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-inverse-foreground/70">{m.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <h2 className="text-center font-display text-2xl font-semibold sm:text-3xl md:text-4xl">{p.stepsTitle}</h2>
        <ol className="relative mt-12 grid gap-6 md:grid-cols-5 md:gap-4">
          <div className="absolute inset-x-[10%] top-6 hidden h-px bg-border md:block" aria-hidden="true" />
          {p.steps.map((s, i) => (
            <li key={s.title} className="relative flex gap-4 md:flex-col md:items-center md:text-center">
              <span className="grid size-12 shrink-0 place-items-center rounded-full border-4 border-background bg-primary font-semibold text-primary-foreground">
                {num(i + 1, lang)}
              </span>
              <div>
                <h3 className="font-semibold md:mt-3">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 pb-16 md:pb-24">
        <h2 className="text-center font-display text-2xl font-semibold sm:text-3xl">{p.faqTitle}</h2>
        <div className="mt-10 grid gap-3">
          {p.faq.map((f) => (
            <details key={f.q} className="group rounded-2xl bg-card p-5 open:shadow-soft sm:p-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                {f.q}
                <ChevronDown className="size-5 shrink-0 text-primary transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <ContactBlock lang={lang} />
    </SiteShell>
  );
}
