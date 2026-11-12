import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileSignature, Globe2, Handshake, MapPin, PackageCheck, SearchCheck, Truck } from "lucide-react";
import hero from "@/assets/hero-shipping.jpg";
import { ContactBlock } from "@/components/site/ContactBlock";
import { IntroSplash, useIntroState } from "@/components/site/IntroSplash";
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

// Stat cell borders: 2x2 grid on phones, one row of four from tablet up.
const statBorders = [
  "",
  "border-s",
  "border-t sm:border-t-0 sm:border-s",
  "border-s border-t sm:border-t-0",
];

function HomePage() {
  const lang = Route.useSearch().lang ?? "fa";
  const t = content[lang];
  const intro = useIntroState();
  const [titleBefore, titleAfter] = t.hero.title.split(t.hero.titleAccent);

  return (
    <SiteShell lang={lang} current="/">
      {intro.playing && <IntroSplash onDone={intro.done} />}

      {/* Hero: one dark photo panel holding headline, actions and key figures. */}
      <section
        style={{ ["--intro" as string]: intro.playing ? "1.35s" : "0s" }}
        className="mx-auto max-w-7xl px-3 pt-4 sm:px-6 sm:pt-6"
      >
        <div className="hero-open relative isolate flex min-h-[calc(100svh-9.5rem)] flex-col overflow-hidden rounded-[2rem] bg-inverse text-inverse-foreground shadow-soft sm:min-h-[clamp(560px,calc(100svh-8rem),800px)]">
          <img
            src={hero}
            alt=""
            width={1920}
            height={1200}
            className="hero-photo absolute inset-0 -z-20 size-full object-cover object-[62%_center]"
          />
          <div className="absolute inset-0 -z-10 bg-hero-overlay" />

          <div className="flex flex-col items-start gap-2 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-8 lg:px-12">
            <span
              style={{ ["--d" as string]: "0ms" }}
              className="animate-rise rounded-full border border-inverse-foreground/20 bg-inverse/35 px-3.5 py-1.5 text-xs font-medium backdrop-blur-md"
            >
              {t.hero.eyebrow}
            </span>
            <span
              style={{ ["--d" as string]: "80ms" }}
              className="animate-rise inline-flex items-center gap-1.5 text-xs font-medium text-inverse-foreground/80"
            >
              <MapPin className="size-3.5 text-highlight" />
              {t.countries.join(" · ")}
            </span>
          </div>

          <div className="mt-auto px-5 pb-7 sm:px-8 sm:pb-10 lg:px-12 lg:pb-12">
            <h1
              style={{ ["--d" as string]: "120ms" }}
              className={`animate-rise hero-on-dark max-w-4xl font-display font-semibold ${
                lang === "fa"
                  ? "text-[2.1rem] leading-[1.35] sm:text-5xl sm:leading-[1.3] lg:text-6xl xl:text-[4.25rem]"
                  : "text-[2.1rem] leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl"
              }`}
            >
              {titleBefore}
              <span className="whitespace-nowrap text-highlight">{t.hero.titleAccent}</span>
              {titleAfter}
            </h1>
            <p
              style={{ ["--d" as string]: "240ms" }}
              className="animate-rise hero-on-dark mt-4 max-w-xl text-sm leading-relaxed text-inverse-foreground/80 sm:mt-6 sm:text-lg"
            >
              {t.hero.sub}
            </p>
            <div
              style={{ ["--d" as string]: "360ms" }}
              className="animate-rise mt-6 grid grid-cols-2 gap-2 sm:mt-8 sm:flex sm:gap-3"
            >
              <Link
                to="/contact"
                search={langSearch(lang)}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-accent sm:px-7 sm:py-4"
              >
                {t.hero.primary}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
              </Link>
              <Link
                to="/"
                hash="group"
                search={langSearch(lang)}
                className="inline-flex items-center justify-center rounded-full border border-inverse-foreground/30 bg-inverse-foreground/10 px-4 py-3.5 text-sm font-semibold backdrop-blur-md transition-colors hover:bg-inverse-foreground/20 sm:px-7 sm:py-4"
              >
                {t.hero.secondary}
              </Link>
            </div>
          </div>

          <dl className="relative grid grid-cols-2 border-t border-inverse-foreground/15 bg-inverse/45 backdrop-blur-md sm:grid-cols-4">
            <span className="hero-line absolute inset-x-0 -top-px h-px origin-left bg-highlight rtl:origin-right" />
            {t.stats.map((s, i) => (
              <div
                key={s.label}
                style={{ ["--d" as string]: `${480 + i * 90}ms` }}
                className={`animate-rise flex flex-col-reverse border-inverse-foreground/15 px-5 py-4 sm:px-8 sm:py-6 lg:px-12 ${statBorders[i] ?? ""}`}
              >
                <dt className="mt-1 text-xs leading-relaxed text-inverse-foreground/70 sm:text-sm">{s.label}</dt>
                <dd className="font-display text-2xl font-semibold sm:text-4xl">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
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
