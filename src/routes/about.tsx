import { createFileRoute } from "@tanstack/react-router";
import { Compass, Eye, Gauge, HeartHandshake, Lock, MapPin, Target } from "lucide-react";
import guangzhou from "@/assets/about-guangzhou.jpg";
import { ContactBlock } from "@/components/site/ContactBlock";
import { SiteShell } from "@/components/site/SiteShell";
import { content, parseLang } from "@/lib/sungroup-content";

export const Route = createFileRoute("/about")({
  validateSearch: parseLang,
  head: () => ({
    meta: [
      { title: "درباره ما | SUNGROUP — گروه بازرگانی آفتاب" },
      {
        name: "description",
        content: "داستان، مأموریت، ارزش‌ها و شبکه‌ی بین‌المللی گروه بازرگانی آفتاب؛ بیش از دو دهه تجارت میان ایران و چین.",
      },
      { property: "og:title", content: "درباره ما | SUNGROUP" },
      { property: "og:description", content: "بیش از دو دهه تجربه در تجارت ایران و چین." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const valueIcons = [Eye, HeartHandshake, Gauge, Lock];

function AboutPage() {
  const lang = Route.useSearch().lang ?? "fa";
  const t = content[lang];
  const p = t.aboutPage;

  return (
    <SiteShell lang={lang} current="/about">
      <section className="mx-auto max-w-7xl px-6 pt-8">
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-inverse text-inverse-foreground shadow-soft">
          <img
            src={guangzhou}
            alt={lang === "fa" ? "نمای شهر گوانجو، چین" : "Guangzhou skyline, China"}
            width={1920}
            height={1024}
            className="absolute inset-0 -z-10 size-full object-cover object-[12%_center] sm:object-center"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-inverse via-inverse/55 to-inverse/10" />
          <div className="flex min-h-[520px] flex-col justify-end px-5 pb-6 pt-60 sm:pt-32 sm:px-6 sm:pb-8 sm:min-h-[clamp(460px,calc(100svh-12rem),640px)] md:px-12 md:pb-12">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-inverse-foreground/10 px-4 py-1.5 text-xs font-medium ring-1 ring-inverse-foreground/20 backdrop-blur">
              <MapPin className="size-3.5" />
              {p.eyebrow}
            </span>
            <h1
              className={
                lang === "fa"
                  ? "mt-5 whitespace-nowrap font-display text-[4.2vw] font-semibold leading-tight sm:text-4xl lg:text-5xl"
                  : "mt-5 font-display text-3xl font-semibold leading-tight sm:whitespace-nowrap sm:text-[3.6vw] xl:text-5xl"
              }
            >
              {p.title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-inverse-foreground/80 sm:text-lg">{p.sub}</p>
            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
              {t.stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl bg-inverse-foreground/10 p-3 sm:p-4 ring-1 ring-inverse-foreground/15 backdrop-blur-md"
                >
                  <div className="font-display text-2xl font-semibold sm:text-3xl">{s.value}</div>
                  <div className="mt-1 text-xs leading-snug text-inverse-foreground/75 sm:text-sm">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Story + timeline */}
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:py-24 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-semibold sm:text-3xl md:text-4xl">{p.storyTitle}</h2>
          {p.story.map((para) => (
            <p key={para} className="mt-5 leading-relaxed text-muted-foreground sm:text-lg">{para}</p>
          ))}
        </div>
        <div>
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">{p.timelineTitle}</h2>
          <ol className="mt-8 border-s-2 border-border">
            {p.timeline.map((m) => (
              <li key={m.year} className="relative ps-8 pb-8 last:pb-0">
                <span className="absolute -start-[9px] top-1 size-4 rounded-full border-4 border-background bg-primary" />
                <div className="font-display text-xl font-semibold text-primary">{m.year}</div>
                <p className="mt-1 text-muted-foreground">{m.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Mission & vision */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="grid gap-5 rounded-3xl bg-inverse p-6 text-inverse-foreground md:grid-cols-2 md:p-12">
          {[
            { Icon: Target, title: p.missionTitle, body: p.mission },
            { Icon: Compass, title: p.visionTitle, body: p.vision },
          ].map(({ Icon, title, body }) => (
            <div key={title} className="rounded-2xl bg-inverse-foreground/5 p-6 ring-1 ring-inverse-foreground/10 md:p-8">
              <span className="grid size-11 place-items-center rounded-full bg-accent text-accent-foreground">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-5 text-xl font-semibold">{title}</h3>
              <p className="mt-2 leading-relaxed text-inverse-foreground/75">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <h2 className="text-center font-display text-2xl font-semibold sm:text-3xl md:text-4xl">{p.valuesTitle}</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {p.values.map((v, i) => {
            const Icon = valueIcons[i] ?? Eye;
            return (
              <article key={v.title} className="rounded-3xl bg-card p-6 sm:p-8">
                <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Network */}
      <section className="mx-auto max-w-7xl px-6 pb-16 md:pb-24">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">{p.networkTitle}</h2>
        <p className="mt-2 text-muted-foreground">{p.networkSub}</p>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {t.countries.map((c) => (
            <div key={c} className="flex items-center gap-3 rounded-2xl bg-card p-5">
              <MapPin className="size-5 text-primary" />
              <span className="font-semibold">{c}</span>
            </div>
          ))}
        </div>
      </section>

      <ContactBlock lang={lang} />
    </SiteShell>
  );
}
