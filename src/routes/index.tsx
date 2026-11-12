import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileSignature, Globe2, Handshake, MapPin, PackageCheck, SearchCheck, Truck } from "lucide-react";
import hero from "@/assets/hero-shipping.jpg";
import { ContactBlock } from "@/components/site/ContactBlock";
import { langSearch, SiteShell } from "@/components/site/SiteShell";
import { content, parseLang } from "@/lib/sungroup-content";

export const Route = createFileRoute("/")({
  validateSearch: parseLang,
  head: () => ({
    meta: [
      { title: "SUNGROUP — گروه بازرگانی آفتاب | تجارت ایران و چین" },
      {
        name: "description",
        content: "گروه بازرگانی آفتاب؛ تأمین، بازرسی، حمل و ترخیص کالا میان ایران و چین با دفاتر در ایران، چین، لیتوانی و عراق.",
      },
      { property: "og:title", content: "SUNGROUP — گروه بازرگانی آفتاب" },
      {
        property: "og:description",
        content: "پل مطمئن تجارت میان ایران و چین؛ از اولین مشاوره تا تحویل درِ انبار شما.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const icons = [Handshake, SearchCheck, Globe2, PackageCheck, Truck, FileSignature];

function HomePage() {
  const lang = Route.useSearch().lang ?? "fa";
  const t = content[lang];

  return (
    <SiteShell lang={lang} current="/">
      <div aria-hidden className="intro-overlay pointer-events-none fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-background">
        <div className="intro-sun absolute size-40 rounded-full bg-primary" />
        <span className="intro-text relative font-display text-2xl font-semibold text-primary-foreground">SUNGROUP</span>
      </div>
      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-6 pt-8">
        <div className="pointer-events-none absolute -top-40 start-1/2 size-[640px] -translate-x-1/2 rounded-full bg-glow animate-glow rtl:translate-x-1/2" />
        <div className="relative mx-auto max-w-6xl text-center">
          <span style={{ ["--d" as string]: "0ms" }} className="animate-rise inline-block rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">
            {t.hero.eyebrow}
          </span>
          <h1
            style={{ ["--d" as string]: "120ms" }}
            className={`animate-rise mt-6 font-display font-semibold leading-[1.2] ${
              lang === "fa"
                ? "whitespace-nowrap text-[6vw] sm:text-5xl lg:text-6xl"
                : "text-3xl sm:whitespace-nowrap sm:text-[3.6vw] xl:text-5xl"
            }`}
          >
            {t.hero.title}
          </h1>
          <p style={{ ["--d" as string]: "240ms" }} className="animate-rise mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">{t.hero.sub}</p>
          <div style={{ ["--d" as string]: "360ms" }} className="animate-rise mt-8 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-3">
            <Link
              to="/contact"
              search={langSearch(lang)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5 sm:px-7 sm:py-4"
            >
              {t.hero.primary}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
            <Link
              to="/"
              hash="group"
              search={langSearch(lang)}
              className="inline-flex items-center justify-center rounded-full border border-border bg-card px-4 py-3.5 text-sm font-semibold sm:px-7 sm:py-4"
            >
              {t.hero.secondary}
            </Link>
          </div>
        </div>

        <div className="relative mt-10 overflow-visible">
          <div className="overflow-hidden rounded-3xl shadow-soft">
          {/* On tablet/desktop the photo height follows the screen height so the whole hero fits in the first view. */}
          <img
            src={hero}
            alt=""
            width={1920}
            height={1200}
            className="animate-hero-img aspect-[4/5] w-full object-cover sm:aspect-auto sm:h-[clamp(280px,calc(100svh-30rem),600px)]"
          />
          </div>
          <div style={{ ["--d" as string]: "600ms" }} className="animate-rise absolute -bottom-6 start-3 rounded-2xl bg-card p-3 shadow-soft md:-bottom-8 md:start-6 md:p-5">
            <div className="animate-float">
            <div className="font-display text-2xl font-semibold text-primary md:text-4xl">{t.stats[0]!.value}</div>
            <div className="mt-1 max-w-32 text-xs text-muted-foreground md:max-w-none md:text-sm">{t.stats[0]!.label}</div>
            </div>
          </div>
          <div style={{ ["--d" as string]: "750ms" }} className="animate-rise absolute top-4 end-3 flex max-w-[60%] items-center gap-2 rounded-2xl bg-card/90 p-3 shadow-soft backdrop-blur md:top-auto md:-bottom-8 md:end-6 md:max-w-none md:gap-3 md:p-5">
            <MapPin className="size-5 text-primary" />
            <span className="text-xs font-medium md:text-sm">{t.countries.join(" · ")}</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-3 px-6 sm:grid-cols-3 md:mt-24 md:gap-4">
        {t.stats.map((s, i) => (
          <div key={i} className={`rounded-2xl bg-secondary p-4 text-center sm:p-6 ${i === 0 ? "hidden" : ""}`}>
            <div className="font-display text-3xl font-semibold text-primary sm:text-4xl">{s.value}</div>
            <div className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Services */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="text-center">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">{t.servicesTitle}</h2>
          <p className="mt-3 text-muted-foreground">{t.servicesSub}</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {t.services.map((s, i) => {
            const Icon = icons[i] ?? Handshake;
            return (
              <article key={s.title} className="rounded-3xl bg-card p-6 transition-shadow hover:shadow-soft sm:p-7">
                <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-4 text-lg font-semibold sm:mt-6">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </article>
            );
          })}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/services"
            search={langSearch(lang)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
          >
            {t.allServices}
            <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
        </div>
      </section>

      {/* Process */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="rounded-3xl bg-inverse px-6 py-10 text-inverse-foreground md:px-14 md:py-14">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">{t.processTitle}</h2>
          <ol className="mt-8 flex flex-wrap gap-2 sm:mt-10 sm:gap-3">
            {t.process.map((p, i) => (
              <li key={p} className="flex items-center gap-3 rounded-full bg-inverse-foreground/10 py-2 pe-5 ps-2">
                <span className="grid size-8 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-foreground" dir="ltr">
                  {i + 1}
                </span>
                {p}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Group */}
      <section id="group" className="mx-auto max-w-7xl scroll-mt-6 px-6 py-16 md:py-24">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">{t.groupTitle}</h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">{t.about}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {t.companies.map((c) => (
              <div key={c.name} className="rounded-2xl border border-border bg-card p-5">
                <h3 className="font-semibold">{c.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.field}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactBlock lang={lang} />
    </SiteShell>
  );
}
