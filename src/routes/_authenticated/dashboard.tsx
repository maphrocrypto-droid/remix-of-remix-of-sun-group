import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { FileText, MessageCircle, Paperclip, Phone, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { SiteShell } from "@/components/site/SiteShell";
import { StatusBadge, TeamBar } from "@/components/team/TeamBar";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime, formatDay, formatNumber } from "@/lib/format";
import { whatsappLink } from "@/lib/inquiry";
import { content, parseLang, type Lang } from "@/lib/sungroup-content";
import { accessQuery, inquiriesQuery, inquiryFilesQuery, weeklyStatsQuery, type InquiryRow } from "@/lib/team-queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  validateSearch: parseLang,
  head: () => ({
    meta: [
      { title: "پنل استعلام‌ها | SUNGROUP" },
      { name: "description", content: "پنل داخلی تیم گروه بازرگانی آفتاب برای پیگیری استعلام‌ها." },
      { property: "og:title", content: "پنل استعلام‌ها | SUNGROUP" },
      { property: "og:description", content: "پنل داخلی پیگیری استعلام‌ها." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: async ({ context }) => {
    const access = await context.queryClient.ensureQueryData(accessQuery);
    if (access.isTeam) {
      await Promise.all([context.queryClient.ensureQueryData(inquiriesQuery), context.queryClient.ensureQueryData(weeklyStatsQuery)]);
    }
  },
  component: DashboardPage,
});

const statuses = ["new", "reviewing", "quoted"] as const;
type Status = (typeof statuses)[number];

function DashboardPage() {
  const lang = Route.useSearch().lang ?? "fa";
  const d = content[lang].dashboard;
  const { data: access } = useSuspenseQuery(accessQuery);

  return (
    <SiteShell lang={lang} current="/dashboard">
      <section className="mx-auto max-w-7xl px-6 py-8 md:py-12">
        <TeamBar lang={lang} current="/dashboard" isAdmin={access.isAdmin} email={access.email} />
        {access.isTeam ? (
          <Board lang={lang} />
        ) : (
          <div className="mt-10 rounded-[2rem] bg-card p-8 shadow-soft">
            <h1 className="font-display text-2xl font-semibold">{d.pendingTitle}</h1>
            <p className="mt-3 text-muted-foreground">{d.pendingBody}</p>
          </div>
        )}
      </section>
    </SiteShell>
  );
}

function Board({ lang }: { lang: Lang }) {
  const d = content[lang].dashboard;
  const { data: rows } = useSuspenseQuery(inquiriesQuery);
  const { data: weeks } = useSuspenseQuery(weeklyStatsQuery);
  const [filter, setFilter] = useState<Status | "all">("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (filter === "all" || r.status === filter) &&
        (!needle || [r.contact_name, r.phone, r.goods, r.tracking_code].some((v) => v.toLowerCase().includes(needle))),
    );
  }, [rows, filter, q]);

  const thisWeek = weeks.at(-1)?.total ?? 0;
  const lastWeek = weeks.at(-2)?.total ?? 0;
  const total8 = weeks.reduce((a, w) => a + w.total, 0);
  const quoted8 = weeks.reduce((a, w) => a + w.quoted, 0);
  const open = rows.filter((r) => r.status !== "quoted").length;
  const max = Math.max(1, ...weeks.map((w) => w.total));
  const selected = rows.find((r) => r.id === openId) ?? null;

  const stats = [
    [d.stats.thisWeek, formatNumber(lang, thisWeek)],
    [d.stats.lastWeek, formatNumber(lang, lastWeek)],
    [d.stats.open, formatNumber(lang, open)],
    [d.stats.quotedRate, `${formatNumber(lang, total8 ? Math.round((quoted8 / total8) * 100) : 0)}٪`.replace("٪", lang === "fa" ? "٪" : "%")],
  ];

  return (
    <>
      <div className="mt-8">
        <h1 className="font-display text-3xl font-semibold">{d.title}</h1>
        <p className="mt-2 text-muted-foreground">{d.sub}</p>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="grid grid-cols-2 gap-3">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-card p-5 shadow-soft">
              <div className="font-display text-3xl font-semibold text-primary">{value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-inverse p-5 text-inverse-foreground">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-semibold">{d.weeklyTitle}</h2>
            <span className="text-xs text-inverse-foreground/60">{d.weeklySub}</span>
          </div>
          <div className="mt-5 flex h-36 items-end gap-2" dir="ltr">
            {weeks.map((w) => (
              <div key={w.week} className="flex flex-1 flex-col items-center gap-2">
                <div className="relative flex w-full flex-1 items-end">
                  <div className="w-full rounded-t-lg bg-inverse-foreground/20" style={{ height: `${(w.total / max) * 100}%` }}>
                    <div className="absolute bottom-0 w-full rounded-t-lg bg-highlight" style={{ height: `${(w.quoted / max) * 100}%` }} />
                  </div>
                </div>
                <span className="text-[10px] text-inverse-foreground/60">{formatDay(lang, w.week)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-4 text-xs text-inverse-foreground/70">
            <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-inverse-foreground/30" />{d.legendTotal}</span>
            <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-highlight" />{d.legendQuoted}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-1 rounded-full border border-border bg-card p-1 text-sm">
          {(["all", ...statuses] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={cn("rounded-full px-4 py-2 font-medium", filter === s ? "bg-primary text-primary-foreground" : "hover:bg-secondary")}
            >
              {s === "all" ? d.all : content[lang].inquiryStatus[s]} ({formatNumber(lang, s === "all" ? rows.length : rows.filter((r) => r.status === s).length)})
            </button>
          ))}
        </div>
        <div className="relative md:w-80">
          <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={d.search} className="h-11 rounded-full ps-10" />
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        {shown.length === 0 && <p className="rounded-2xl bg-card p-8 text-center text-muted-foreground">{rows.length ? d.noMatch : d.empty}</p>}
        {shown.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setOpenId(r.id)}
            className="grid gap-2 rounded-2xl bg-card p-4 text-start transition-shadow hover:shadow-soft md:grid-cols-[8rem_1fr_1.2fr_10rem_auto] md:items-center md:gap-4"
          >
            <span dir="ltr" className="font-display font-semibold tracking-wider text-primary md:text-start rtl:text-end">{r.tracking_code}</span>
            <span className="min-w-0">
              <span className="block truncate font-medium">{r.contact_name}</span>
              <span className="block text-xs text-muted-foreground" dir="ltr">{r.phone}</span>
            </span>
            <span className="min-w-0 text-sm">
              <span className="block truncate" dir="auto">{r.goods}</span>
              <span className="block text-xs text-muted-foreground">
                {content[lang].contactPage.services[r.service] ?? ""}
                {r.file_count > 0 && (
                  <span className="ms-2 inline-flex items-center gap-1"><Paperclip className="size-3" />{formatNumber(lang, r.file_count)}</span>
                )}
              </span>
            </span>
            <span className="text-xs text-muted-foreground">{formatDateTime(lang, r.created_at)}</span>
            <StatusBadge lang={lang} status={r.status} />
          </button>
        ))}
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent side={lang === "fa" ? "left" : "right"} dir={lang === "fa" ? "rtl" : "ltr"} className="w-full overflow-y-auto sm:max-w-lg">
          {selected && <Detail lang={lang} row={selected} />}
        </SheetContent>
      </Sheet>
    </>
  );
}

function Detail({ lang, row }: { lang: Lang; row: InquiryRow }) {
  const t = content[lang];
  const d = t.dashboard.detail;
  const p = t.contactPage;
  const qc = useQueryClient();
  const [note, setNote] = useState(row.internal_note ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const files = useQuery(inquiryFilesQuery(row.id));

  const update = async (patch: { status?: Status; internal_note?: string }) => {
    setMsg(null);
    const { error } = await supabase.from("inquiries").update(patch).eq("id", row.id);
    if (error) return setMsg(d.saveError);
    await qc.invalidateQueries({ queryKey: ["team"] });
    if (patch.internal_note !== undefined) setMsg(d.saved);
  };

  const fields: [string, string][] = [
    [p.summary.service, p.services[row.service] ?? ""],
    [p.summary.city, row.china_city !== null ? (p.cities[row.china_city] ?? "") : ""],
    [p.summary.mode, row.shipping_mode !== null ? (p.modes[row.shipping_mode]?.label ?? "") : ""],
    [p.summary.size, row.volume !== null ? (p.sizes[row.volume] ?? "") : ""],
    [p.summary.goods, row.goods],
    [d.received, formatDateTime(lang, row.created_at)],
    [d.formLang, row.lang === "en" ? "English" : "فارسی"],
  ];

  return (
    <div className="grid gap-6 pb-8">
      <SheetHeader className="text-start">
        <SheetTitle dir="ltr" className="font-display tracking-wider text-primary rtl:text-end">{row.tracking_code}</SheetTitle>
        <p className="font-semibold">{row.contact_name}</p>
      </SheetHeader>
      <div className="flex flex-wrap gap-2">
        <a href={`tel:${row.phone}`} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          <Phone className="size-4" />{d.call} <span dir="ltr">{row.phone}</span>
        </a>
        <a href={whatsappLink(row.phone, `${row.tracking_code}`)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold">
          <MessageCircle className="size-4" />{d.whatsapp}
        </a>
      </div>
      <div>
        <h3 className="text-sm font-semibold">{d.status}</h3>
        <div className="mt-2 grid grid-cols-3 gap-1 rounded-full bg-secondary p-1 text-sm">
          {statuses.map((s) => (
            <button key={s} type="button" onClick={() => void update({ status: s })} className={cn("rounded-full py-2 font-medium", row.status === s ? "bg-card shadow-soft" : "text-muted-foreground")}>
              {t.inquiryStatus[s]}
            </button>
          ))}
        </div>
      </div>
      <dl className="grid gap-3 rounded-2xl bg-secondary/60 p-4 text-sm sm:grid-cols-2">
        {fields.filter(([, v]) => v).map(([k, v]) => (
          <div key={k}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="mt-0.5 font-medium" dir="auto">{v}</dd></div>
        ))}
      </dl>
      {row.note && (
        <div><h3 className="text-sm font-semibold">{d.customerNote}</h3><p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground" dir="auto">{row.note}</p></div>
      )}
      <div>
        <h3 className="text-sm font-semibold">{d.files}</h3>
        {files.data?.length ? (
          <ul className="mt-2 grid gap-2">
            {files.data.map((f) => (
              <li key={f.path}>
                <a href={f.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-2xl bg-secondary/60 px-4 py-2.5 text-sm hover:bg-secondary">
                  <FileText className="size-4 text-primary" /><span className="truncate" dir="ltr">{f.path.split("/").pop()}</span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">{files.isLoading ? "…" : d.noFiles}</p>
        )}
      </div>
      <div>
        <h3 className="text-sm font-semibold">{d.internalNote}</h3>
        <Textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder={d.internalPh} className="mt-2 rounded-2xl" />
        <div className="mt-2 flex items-center gap-3">
          <button type="button" onClick={() => void update({ internal_note: note })} className="rounded-full bg-inverse px-5 py-2 text-sm font-semibold text-inverse-foreground">{d.save}</button>
          {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
        </div>
      </div>
    </div>
  );
}
