import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Banknote, Car, Factory, Ship, type LucideIcon } from "lucide-react";
import { ContactBlock } from "@/components/site/ContactBlock";
import { SunMark } from "@/components/site/Logo";
import { SiteShell } from "@/components/site/SiteShell";
import { content, parseLang } from "@/lib/sungroup-content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/group")({
  validateSearch: parseLang,
  head: () => ({
    meta: [
      { title: "شرکت‌های گروه | SUNGROUP — هلدینگ بازرگانی آفتاب" },
      {
        name: "description",
        content: "شش شرکت تخصصی هلدینگ آفتاب در ارز، خودرو، گمرک، حمل و تولید؛ زیر یک مدیریت واحد.",
      },
      { property: "og:title", content: "شرکت‌های گروه | SUNGROUP" },
      { property: "og:description", content: "شش شرکت تخصصی، یک امضای مطمئن." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GroupPage,
});

const sectorIcons: Record<string, LucideIcon> = { trade: Ship, finance: Banknote, auto: Car, industry: Factory };

// Six orbit positions (percent of the ring box), clockwise from top.
const orbit = [
  { x: 50, y: 6 },
  { x: 90, y: 28 },
  { x: 90, y: 72 },
  { x: 50, y: 94 },
  { x: 10, y: 72 },
  { x: 10, y: 28 },
];

function GroupPage() {
  const lang = Route.useSearch().lang ?? "fa";
  const t = content[lang];
  const p = t.groupPage;
  const [sector, setSector] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const unit = p.units[active];
  const Arrow = lang === "fa" ? ArrowLeft : ArrowRight;
  const sectorLabel = (id: string) => p.sectors.find((s) => s.id === id)?.label ?? "";
  const dim = (s: string) => sector !== null && sector !== s;

  const chip = (id: string | null, label: string) => (
    <button
      key={label}
      type="button"
      onClick={() => setSector(id)}
      aria-pressed={sector === id}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-medium ring-1 transition",
        sector === id
          ? "bg-primary text-primary-foreground ring-primary"
          : "bg-card text-foreground ring-border hover:ring-primary/50",
      )}
    >
      {label}
    </button>
  );

  return (
    <SiteShell lang={lang} current="/group">
      {/* Heading */}
      <section className="mx-auto max-w-7xl px-6 pt-12 text-center md:pt-16">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{p.eyebrow}</span>
        <h1
          className={
            lang === "fa"
              ? "mt-4 whitespace-nowrap font-display text-[5.6vw] font-bold leading-tight sm:text-4xl lg:text-5xl"
              : "mt-4 font-display text-3xl font-bold leading-tight sm:whitespace-nowrap sm:text-[3.6vw] xl:text-5xl"
          }
        >
          {p.title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-lg">{p.sub}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-2" role="group" aria-label={p.sectorsLabel}>
          {chip(null, p.all)}
          {p.sectors.map((s) => chip(s.id, s.label))}
        </div>
      </section>

      {/* Orbit map + detail */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-12 lg:grid-cols-[1.2fr_1fr] md:py-16">
        {/* Desktop/tablet orbit */}
        <div className="relative mx-auto hidden aspect-square w-full max-w-[560px] sm:block" dir="ltr">
          <div className="absolute inset-[10%] rounded-full border border-dashed border-border" />
          <div className="absolute inset-[28%] rounded-full border border-border/70" />
          <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" aria-hidden>
            {orbit.map((o, i) => (
              <line
                key={i}
                x1={50}
                y1={50}
                x2={o.x}
                y2={o.y}
                className={cn(
                  "transition-all",
                  i === active ? "stroke-primary" : "stroke-border",
                  dim(p.units[i]?.sector ?? "") && "opacity-30",
                )}
                strokeWidth={i === active ? 0.6 : 0.3}
              />
            ))}
          </svg>
          <div className="absolute left-1/2 top-1/2 flex size-[30%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-inverse text-inverse-foreground shadow-soft">
            <SunMark className="size-1/3" />
            <span className="mt-2 font-display text-sm font-semibold tracking-wide">SUNGROUP</span>
            <span className="mt-0.5 px-3 text-center text-[10px] text-inverse-foreground/70">{p.hub}</span>
          </div>
          {p.units.map((u, i) => {
            const o = orbit[i];
            if (!o) return null;
            const Icon = sectorIcons[u.sector] ?? Ship;
            return (
              <button
                key={u.code}
                type="button"
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                style={{ left: `${o.x}%`, top: `${o.y}%` }}
                className={cn(
                  "absolute flex w-36 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 rounded-2xl bg-card p-3 text-center ring-1 transition md:w-40",
                  i === active ? "scale-105 ring-2 ring-primary shadow-soft" : "ring-border hover:ring-primary/50",
                  dim(u.sector) && "opacity-30",
                )}
                dir={lang === "fa" ? "rtl" : "ltr"}
              >
                <span className={cn("grid size-9 place-items-center rounded-full", i === active ? "bg-primary text-primary-foreground" : "bg-secondary text-primary")}>
                  <Icon className="size-4" />
                </span>
                <span className="text-sm font-semibold leading-tight">{u.name}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile list */}
        <div className="grid grid-cols-2 gap-3 sm:hidden">
          {p.units.map((u, i) => {
            const Icon = sectorIcons[u.sector] ?? Ship;
            return (
              <button
                key={u.code}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "flex flex-col items-start gap-2 rounded-2xl bg-card p-3 text-start ring-1 transition",
                  i === active ? "ring-2 ring-primary" : "ring-border",
                  dim(u.sector) && "opacity-30",
                )}
              >
                <span className={cn("grid size-8 place-items-center rounded-full", i === active ? "bg-primary text-primary-foreground" : "bg-secondary text-primary")}>
                  <Icon className="size-4" />
                </span>
                <span className="text-sm font-semibold leading-tight">{u.name}</span>
              </button>
            );
          })}
        </div>

        {/* Detail card */}
        {unit && (
          <article key={unit.code} className="relative overflow-hidden rounded-[2rem] bg-inverse p-7 text-inverse-foreground shadow-soft md:p-10">
            <span className="pointer-events-none absolute -end-4 -top-8 font-display text-[9rem] font-bold leading-none text-inverse-foreground/5">
              {unit.code}
            </span>
            <span className="inline-flex rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
              {sectorLabel(unit.sector)}
            </span>
            <h2 className="mt-5 font-display text-2xl font-semibold sm:text-3xl">{unit.name}</h2>
            <p className="mt-3 text-inverse-foreground/80 sm:text-lg">{unit.field}</p>
            <div className="mt-6 border-t border-inverse-foreground/15 pt-5 text-sm leading-relaxed text-inverse-foreground/70">
              {unit.role}
            </div>
            <div className="mt-6 flex gap-1.5">
              {p.units.map((u, i) => (
                <button
                  key={u.code}
                  type="button"
                  aria-label={u.name}
                  onClick={() => setActive(i)}
                  className={cn("h-1.5 rounded-full transition-all", i === active ? "w-8 bg-primary" : "w-3 bg-inverse-foreground/25")}
                />
              ))}
            </div>
          </article>
        )}
      </section>

      {/* Value chain */}
      <section className="bg-secondary/60 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl md:text-4xl">{p.chainTitle}</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground sm:text-lg">{p.chainSub}</p>
          <ol className="mt-10 grid gap-4 md:grid-cols-4">
            {p.chain.map((c, i) => (
              <li key={c.step} className="relative rounded-2xl bg-card p-5 ring-1 ring-border">
                <div className="flex items-center justify-between">
                  <span className="font-display text-3xl font-bold text-primary">{String(i + 1).padStart(2, "0")}</span>
                  {i < p.chain.length - 1 && <Arrow className="hidden size-5 text-muted-foreground md:block" />}
                </div>
                <div className="mt-4 font-semibold">{c.step}</div>
                <div className="mt-1 text-sm text-muted-foreground">{c.unit}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Why holding */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl md:text-4xl">{p.whyTitle}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {p.why.map((w) => (
            <div key={w.title} className="border-s-2 border-primary ps-5">
              <div className="font-display text-xl font-semibold">{w.title}</div>
              <p className="mt-2 text-muted-foreground">{w.body}</p>
            </div>
          ))}
        </div>
      </section>

      <ContactBlock lang={lang} />
    </SiteShell>
  );
}
