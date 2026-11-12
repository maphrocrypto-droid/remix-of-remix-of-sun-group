import { createFileRoute } from "@tanstack/react-router";
import { Clock, Gift, Lock, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import hub from "@/assets/contact-logistics-hub.jpg";
import { InquiryWizard } from "@/components/site/InquiryWizard";
import { OfficeClockChip, officeState, StatusPill, useNow } from "@/components/site/OfficeClock";
import { SiteShell } from "@/components/site/SiteShell";
import { content, parseLang } from "@/lib/sungroup-content";

export const Route = createFileRoute("/contact")({
  validateSearch: parseLang,
  head: () => ({
    meta: [
      { title: "تماس و استعلام قیمت | SUNGROUP — گروه بازرگانی آفتاب" },
      {
        name: "description",
        content: "استعلام سه‌مرحله‌ای واردات، صادرات و حمل از چین؛ دفاتر تهران و گوانجو با ساعت محلی و وضعیت باز بودن.",
      },
      { property: "og:title", content: "تماس و استعلام | SUNGROUP" },
      { property: "og:description", content: "در سه قدم کوتاه استعلام بگیرید؛ کارشناس ما با بهترین مسیر تماس می‌گیرد." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

const promiseIcons = [Gift, Clock, Lock];

function ContactPage() {
  const lang = Route.useSearch().lang ?? "fa";
  const t = content[lang];
  const p = t.contactPage;
  const now = useNow();
  const tehran = t.offices[0]!;

  return (
    <SiteShell lang={lang} current="/contact">
      <section className="relative mx-auto max-w-7xl px-6 pt-8 md:pt-12">
        <div className="pointer-events-none absolute -top-40 end-0 size-[560px] rounded-full bg-glow" />
        <div className="relative text-center sm:text-start">
          <span className="inline-block rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">
            {p.eyebrow}
          </span>
          <h1
            className={`mt-4 whitespace-nowrap font-display font-bold leading-tight sm:mt-5 sm:font-semibold ${
              lang === "fa"
                ? "text-[calc((100vw-3.5rem)/16.2)] sm:text-4xl lg:text-5xl"
                : "text-[calc((100vw-3.5rem)/15)] sm:text-4xl lg:text-5xl"
            }`}
          >
            {p.title}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:mx-0 sm:mt-4 sm:text-lg">{p.sub}</p>
          <div className="mt-6 grid gap-2 sm:flex sm:flex-wrap sm:gap-3">
            {t.offices.map((o, i) => (
              <OfficeClockChip key={o.city} index={i} now={now} lang={lang} className="justify-between sm:justify-start" />
            ))}
          </div>
        </div>

        <img
          src={hub}
          alt={lang === "fa" ? "پایانه‌ی مدرن لجستیک با کانتینرهای زرشکی" : "Modern logistics terminal with burgundy containers"}
          width={1920}
          height={896}
          className="mt-8 h-[210px] w-full rounded-[2rem] object-cover object-[75%_center] shadow-soft sm:h-[300px] lg:h-[380px]"
        />

        {/* The ticket rises out of the photo; the side column stays below it. */}
        <div className="relative -mt-14 grid items-start gap-6 px-3 sm:-mt-24 sm:px-6 lg:-mt-36 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:px-10">
          <InquiryWizard lang={lang} whatsappTel={tehran.tel} callTel={tehran.tel} />

          <aside className="grid gap-5 lg:mt-44">
            <div className="rounded-[2rem] bg-inverse p-6 text-inverse-foreground sm:p-8">
              <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
                <ShieldCheck className="size-5 text-accent" />
                {p.promisesTitle}
              </h2>
              <ul className="mt-6 grid gap-5">
                {p.promises.map((item, i) => {
                  const Icon = promiseIcons[i] ?? Gift;
                  return (
                    <li key={item.title} className="flex gap-4">
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-inverse-foreground/10">
                        <Icon className="size-4" />
                      </span>
                      <div>
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-inverse-foreground/70">{item.body}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="rounded-[2rem] bg-card p-6 sm:p-8">
              <h2 className="font-display text-xl font-semibold">{p.directTitle}</h2>
              <div className="mt-5 grid gap-3">
                {t.offices.map((o) => (
                  <a
                    key={o.tel}
                    href={`tel:${o.tel}`}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-secondary/70 px-4 py-3 transition-colors hover:bg-secondary"
                  >
                    <span className="flex items-center gap-3 text-sm">
                      <Phone className="size-4 text-primary" />
                      {o.city}
                    </span>
                    <span dir="ltr" className="text-sm font-semibold">
                      {o.phone}
                    </span>
                  </a>
                ))}
                <a
                  href={`mailto:${p.email}`}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-secondary/70 px-4 py-3 transition-colors hover:bg-secondary"
                >
                  <Mail className="size-4 text-primary" />
                  <span dir="ltr" className="text-sm font-semibold">
                    {p.email}
                  </span>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Offices with live local time */}
      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div>
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">{p.officesTitle}</h2>
          <p className="mt-3 text-muted-foreground">{p.officesSub}</p>
          <h3 className="mt-10 text-sm font-semibold text-primary">{p.afterTitle}</h3>
          <ol className="mt-4 grid gap-3">
            {p.after.map((line, i) => (
              <li key={line} className="flex items-center gap-3 text-sm">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 font-semibold text-primary">
                  {(i + 1).toLocaleString(lang === "fa" ? "fa-IR" : "en-US")}
                </span>
                {line}
              </li>
            ))}
          </ol>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {t.offices.map((o, i) => {
            const { schedule, time, open } = officeState(i, now, lang);
            return (
              <article key={o.city} className="flex flex-col rounded-[2rem] bg-card p-6 sm:p-8">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">{o.city}</h3>
                  <StatusPill open={open} lang={lang} />
                </div>
                <div className="mt-6 flex items-baseline gap-3">
                  <span dir="ltr" className="font-display text-5xl font-semibold tabular-nums text-primary">
                    {time}
                  </span>
                  <span className="text-xs text-muted-foreground" dir="ltr">
                    {schedule.utcLabel}
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{p.localTime}</div>
                <div className="mt-6 grid gap-3 border-t border-border pt-6 text-sm">
                  <p className="flex gap-3 text-muted-foreground">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                    {o.address}
                  </p>
                  <p className="flex gap-3 text-muted-foreground">
                    <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>
                      <span className="sr-only">{p.hoursLabel}: </span>
                      {o.hours}
                    </span>
                  </p>
                  <a href={`tel:${o.tel}`} className="flex gap-3 font-semibold">
                    <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span dir="ltr">{o.phone}</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </SiteShell>
  );
}
