import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check, Loader2, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { langSearch, SiteShell } from "@/components/site/SiteShell";
import { formatDateTime } from "@/lib/format";
import { trackInquiry } from "@/lib/inquiry.functions";
import { content, parseLang, type Lang } from "@/lib/sungroup-content";
import { cn } from "@/lib/utils";

type TrackSearch = { lang?: Lang; code?: string | undefined };

export const Route = createFileRoute("/track")({
  validateSearch: (s: Record<string, unknown>): TrackSearch => {
    const code = typeof s["code"] === "string" && /^SG-[A-Z0-9]{6}$/i.test(s["code"]) ? s["code"].toUpperCase() : undefined;
    return { ...parseLang(s), ...(code ? { code } : {}) };
  },
  head: () => ({
    meta: [
      { title: "پیگیری استعلام | SUNGROUP — گروه بازرگانی آفتاب" },
      { name: "description", content: "با کد پیگیری و شماره تماس، وضعیت استعلام قیمت خود را در گروه بازرگانی آفتاب ببینید." },
      { property: "og:title", content: "پیگیری استعلام | SUNGROUP" },
      { property: "og:description", content: "وضعیت استعلام‌تان را با کد پیگیری ببینید: دریافت، بررسی، قیمت‌دهی." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TrackPage,
});

const order = ["new", "reviewing", "quoted"] as const;

type Result = Awaited<ReturnType<typeof trackInquiry>>;

function TrackPage() {
  const search = Route.useSearch();
  const lang = search.lang ?? "fa";
  const t = content[lang];
  const tr = t.track;
  const track = useServerFn(trackInquiry);
  const [code, setCode] = useState(search.code ?? "");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Extract<Result, { found: true }> | null>(null);

  const onSubmit = async () => {
    const clean = code.trim().toUpperCase();
    if (!/^SG-[A-Z0-9]{6}$/.test(clean)) {
      setError(tr.invalidCode);
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await track({ data: { code: clean, phone } });
      if (res.found) setResult(res);
      else setError(tr.notFound);
    } catch {
      setError(tr.error);
    } finally {
      setLoading(false);
    }
  };

  const reached = result ? order.indexOf(result.status) : -1;

  return (
    <SiteShell lang={lang} current="/track">
      <section className="mx-auto max-w-3xl px-6 py-12 md:py-20">
        <span className="inline-block rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">{tr.eyebrow}</span>
        <h1 className="mt-5 font-display text-3xl font-semibold sm:text-4xl">{tr.title}</h1>
        <p className="mt-3 text-muted-foreground">{tr.sub}</p>

        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void onSubmit();
          }}
          className="mt-8 grid gap-4 rounded-[2rem] bg-card p-5 shadow-soft sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-6"
        >
          <div>
            <Label htmlFor="trk-code">{tr.codeLabel}</Label>
            <Input
              id="trk-code"
              dir="ltr"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="SG-XXXXXX"
              className="mt-2 h-12 rounded-2xl px-4 font-display text-base tracking-wider uppercase md:text-sm rtl:text-end"
            />
          </div>
          <div>
            <Label htmlFor="trk-phone">{tr.phoneLabel}</Label>
            <Input
              id="trk-phone"
              type="tel"
              inputMode="tel"
              dir="ltr"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={tr.phonePh}
              className="mt-2 h-12 rounded-2xl px-4 text-base md:text-sm rtl:text-end"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground disabled:opacity-70"
          >
            {loading ? tr.loading : tr.submit}
            {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4 rtl:rotate-180" />}
          </button>
          {error && (
            <p role="alert" className="text-sm font-medium text-destructive sm:col-span-3">
              {error}
            </p>
          )}
        </form>

        {result && (
          <div className="mt-8 overflow-hidden rounded-[2rem] bg-card shadow-soft animate-in fade-in slide-in-from-bottom-2">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-inverse px-6 py-5 text-inverse-foreground">
              <span dir="ltr" className="font-display text-xl font-semibold tracking-wider">
                {result.code}
              </span>
              <span className="text-sm text-inverse-foreground/70">{t.contactPage.services[result.service] ?? ""}</span>
            </div>
            <ol className="grid gap-0 p-6">
              {tr.steps.map((s, i) => {
                const done = i <= reached;
                return (
                  <li key={s.title} className="relative flex gap-4 pb-6 last:pb-0">
                    {i < tr.steps.length - 1 && (
                      <span className={cn("absolute start-4 top-9 h-[calc(100%-2.25rem)] w-px", i < reached ? "bg-primary" : "bg-border")} />
                    )}
                    <span
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold",
                        done ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {done ? <Check className="size-4" /> : i + 1}
                    </span>
                    <div className={cn("pt-1", !done && "opacity-60")}>
                      <h2 className="font-semibold">{s.title}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
            <dl className="grid gap-4 border-t border-border px-6 py-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">{tr.received}</dt>
                <dd className="mt-1 font-medium">{formatDateTime(lang, result.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{tr.updated}</dt>
                <dd className="mt-1 font-medium">{formatDateTime(lang, result.statusChangedAt)}</dd>
              </div>
            </dl>
          </div>
        )}

        <div className="mt-10 flex flex-wrap items-center gap-4 text-sm">
          <span className="text-muted-foreground">{tr.help}</span>
          <a href={`tel:${t.offices[0]!.tel}`} className="inline-flex items-center gap-2 font-semibold" dir="ltr">
            <Phone className="size-4" />
            {t.offices[0]!.phone}
          </a>
          <Link to="/contact" search={langSearch(lang)} className="font-semibold text-primary">
            {tr.newInquiry}
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
