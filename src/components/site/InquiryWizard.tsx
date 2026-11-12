import { useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowRight,
  Check,
  FileText,
  Loader2,
  MessageCircle,
  Paperclip,
  Phone,
  Plane,
  RotateCcw,
  SearchCheck,
  Ship,
  Sparkles,
  TrainFront,
  Truck,
  X,
} from "lucide-react";
import { langSearch } from "@/components/site/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { checkFiles, FILE_RULES, type FileIssue } from "@/lib/inquiry";
import { submitInquiry } from "@/lib/inquiry.functions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { isValidPhone, normalizePhone, whatsappLink } from "@/lib/inquiry";
import { content, type Lang } from "@/lib/sungroup-content";
import { cn } from "@/lib/utils";

const modeIcons = [Ship, Plane, TrainFront, Truck, Sparkles];
const EXPORT = 1; // index of "export" in contactPage.services

type Draft = {
  service: number | null;
  city: number | null;
  mode: number | null;
  size: number | null;
  goods: string;
  name: string;
  phone: string;
  note: string;
};

const empty: Draft = { service: null, city: null, mode: null, size: null, goods: "", name: "", phone: "", note: "" };

type Errors = Partial<Record<keyof Draft, string>>;

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors",
        selected
          ? "border-primary bg-primary text-primary-foreground shadow-soft"
          : "border-border bg-background hover:border-primary/40 hover:bg-secondary",
      )}
    >
      {children}
    </button>
  );
}

function Question({ title, error, children }: { title: string; error?: string | undefined; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold">{title}</legend>
      <div className="mt-3 flex flex-wrap gap-2">{children}</div>
      {error && <p className="mt-2 text-xs font-medium text-destructive">{error}</p>}
    </fieldset>
  );
}

const fieldClass = "h-12 rounded-2xl border-border bg-background px-4 text-base md:text-sm";

/** Three-step inquiry styled as a shipping ticket; hands the summary off to WhatsApp or a call. */
export function InquiryWizard({ lang, whatsappTel, callTel }: { lang: Lang; whatsappTel: string; callTel: string }) {
  const p = content[lang].contactPage;
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [code, setCode] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [fileIssue, setFileIssue] = useState<FileIssue | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [uploadFailed, setUploadFailed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const submit = useServerFn(submitInquiry);

  const addFiles = (picked: FileList | null) => {
    if (!picked?.length) return;
    const nextFiles = [...files, ...Array.from(picked)];
    const issue = checkFiles(nextFiles);
    setFileIssue(issue);
    if (!issue) setFiles(nextFiles);
    if (fileInput.current) fileInput.current.value = "";
  };

  /** Saves the inquiry, then uploads attachments into the slots the server reserved. */
  const send = async () => {
    setSending(true);
    setSendError(null);
    try {
      const res = await submit({
        data: {
          lang,
          service: draft.service!,
          chinaCity: draft.city!,
          shippingMode: draft.mode!,
          volume: draft.size!,
          goods: draft.goods.trim(),
          name: draft.name.trim(),
          phone: draft.phone,
          note: draft.note.trim(),
          files: files.map((f) => ({ name: f.name, type: f.type, size: f.size })),
        },
      });
      if (!res.ok) {
        setSendError(p.rateError);
        return;
      }
      const results = await Promise.all(
        res.uploads.map((u, i) =>
          supabase.storage
            .from("inquiry-files")
            .uploadToSignedUrl(u.path, u.token, files[i]!, { contentType: files[i]!.type })
            .then((r) => !r.error)
            .catch(() => false),
        ),
      );
      setUploadFailed(results.length < files.length || results.some((ok) => !ok));
      setCode(res.code);
      keepInView();
    } catch {
      setSendError(p.submitError);
    } finally {
      setSending(false);
    }
  };

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (s: number): Errors => {
    const e: Errors = {};
    if (s === 0 && draft.service === null) e.service = p.errors.pick;
    if (s === 1) {
      if (draft.city === null) e.city = p.errors.pick;
      if (draft.mode === null) e.mode = p.errors.pick;
      if (draft.size === null) e.size = p.errors.pick;
    }
    if (s === 2) {
      if (draft.goods.trim().length < 2) e.goods = p.errors.goods;
      if (draft.name.trim().length < 2) e.name = p.errors.name;
      if (!isValidPhone(draft.phone)) e.phone = p.errors.phone;
    }
    return e;
  };

  const keepInView = () => {
    const top = ref.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const next = () => {
    const e = validate(step);
    setErrors(e);
    if (Object.keys(e).length) return;
    if (step < 2) {
      setStep(step + 1);
      keepInView();
    } else void send();
  };

  const restart = () => {
    setDraft(empty);
    setErrors({});
    setCode(null);
    setFiles([]);
    setFileIssue(null);
    setSendError(null);
    setUploadFailed(false);
    setStep(0);
    keepInView();
  };

  const isExport = draft.service === EXPORT;
  const chinaPlace = draft.city !== null && draft.city < p.cities.length - 1 ? p.cities[draft.city]! : p.china;
  const from = isExport ? p.iran : chinaPlace;
  const to = isExport ? chinaPlace : p.iran;
  const ModeIcon = modeIcons[draft.mode ?? 0] ?? Ship;

  const summary: [string, string][] = [
    [p.summary.service, draft.service !== null ? p.services[draft.service]! : ""],
    [p.summary.city, draft.city !== null ? p.cities[draft.city]! : ""],
    [p.summary.mode, draft.mode !== null ? p.modes[draft.mode]!.label : ""],
    [p.summary.size, draft.size !== null ? p.sizes[draft.size]! : ""],
    [p.summary.goods, draft.goods.trim()],
    [p.summary.name, draft.name.trim()],
    [p.summary.phone, normalizePhone(draft.phone)],
    [p.summary.note, draft.note.trim()],
  ];
  const message = [p.waIntro, `${p.codeLabel}: ${code ?? ""}`, ...summary.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`)].join("\n");

  return (
    <div ref={ref} className="scroll-mt-6 overflow-hidden rounded-[2rem] bg-card shadow-soft">
      {/* Ticket header: live route */}
      <div className="bg-inverse px-5 py-6 text-inverse-foreground sm:px-8">
        <div className="flex items-center justify-between text-xs text-inverse-foreground/60">
          <span className="font-medium uppercase tracking-[0.2em]">{p.formTitle}</span>
          <span dir="ltr" className="font-display tabular-nums">
            {code ?? "SG-······"}
          </span>
        </div>
        <div className="mt-5 flex items-center gap-3 sm:gap-5">
          <div className="min-w-0">
            <div className="text-xs text-inverse-foreground/60">{p.from}</div>
            <div className="truncate font-display text-xl font-semibold sm:text-2xl">{from}</div>
          </div>
          <div className="relative flex flex-1 items-center">
            <span className="h-px w-full border-t-2 border-dashed border-inverse-foreground/25" />
            <span
              key={draft.mode ?? -1}
              className="absolute start-1/2 grid size-10 -translate-x-1/2 place-items-center rounded-full bg-accent text-accent-foreground ring-4 ring-inverse animate-in fade-in zoom-in-50 rtl:translate-x-1/2"
            >
              <ModeIcon className="size-5" />
            </span>
          </div>
          <div className="min-w-0 text-end">
            <div className="text-xs text-inverse-foreground/60">{p.to}</div>
            <div className="truncate font-display text-xl font-semibold sm:text-2xl">{to}</div>
          </div>
        </div>
        <div className="mt-4 min-h-5 text-center text-xs text-inverse-foreground/70">
          {draft.mode !== null && (
            <>
              {p.etaLabel}: <span className="font-semibold text-inverse-foreground">{p.modes[draft.mode]!.eta}</span>
            </>
          )}
        </div>
      </div>

      {/* Perforation */}
      <div className="relative h-0">
        <span className="absolute -start-3 -top-3 size-6 rounded-full bg-background" />
        <span className="absolute -end-3 -top-3 size-6 rounded-full bg-background" />
      </div>

      <div className="px-5 py-6 sm:px-8 sm:py-8">
        {code ? (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <span className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground">
              <Check className="size-6" />
            </span>
            <h3 className="mt-4 font-display text-2xl font-semibold">{p.doneTitle}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.doneSub}</p>
            <div className="mt-5 inline-flex items-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3">
              <span className="text-xs text-muted-foreground">{p.codeLabel}</span>
              <span dir="ltr" className="font-display text-lg font-semibold tracking-wider text-primary">
                {code}
              </span>
            </div>
            <dl className="mt-6 grid gap-x-6 gap-y-3 rounded-2xl bg-secondary/60 p-5 text-sm sm:grid-cols-2">
              {summary
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="min-w-0">
                    <dt className="text-xs text-muted-foreground">{k}</dt>
                    <dd className="mt-0.5 truncate font-medium" dir="auto">
                      {v}
                    </dd>
                  </div>
                ))}
            </dl>
            {uploadFailed && <p className="mt-4 text-sm font-medium text-destructive">{p.uploadError}</p>}
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <a
                href={whatsappLink(whatsappTel, message)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft"
              >
                <MessageCircle className="size-4" />
                {p.whatsapp}
              </a>
              <a
                href={`tel:${callTel}`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-sm font-semibold"
              >
                <Phone className="size-4" />
                {p.call}
              </a>
              <Link
                to="/track"
                search={{ ...langSearch(lang), code: code ?? undefined }}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-sm font-semibold"
              >
                <SearchCheck className="size-4" />
                {p.trackCta}
              </Link>
              <button
                type="button"
                onClick={restart}
                className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-3.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="size-4" />
                {p.restart}
              </button>
            </div>
          </div>
        ) : (
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              next();
            }}
          >
            {/* Progress */}
            <ol className="grid grid-cols-3 gap-2">
              {p.steps.map((label, i) => (
                <li key={label}>
                  <span className={cn("block h-1.5 rounded-full transition-colors", i <= step ? "bg-primary" : "bg-secondary")} />
                  <span className={cn("mt-2 block text-xs", i === step ? "font-semibold text-foreground" : "text-muted-foreground")}>
                    {p.stepOf} {(i + 1).toLocaleString(lang === "fa" ? "fa-IR" : "en-US")} · {label}
                  </span>
                </li>
              ))}
            </ol>

            <div key={step} className="mt-7 grid gap-6 animate-in fade-in slide-in-from-bottom-2">
              {step === 0 && (
                <Question title={p.serviceQ} error={errors.service}>
                  {p.services.map((s, i) => (
                    <Chip key={s} selected={draft.service === i} onClick={() => set("service", i)}>
                      {s}
                    </Chip>
                  ))}
                </Question>
              )}

              {step === 1 && (
                <>
                  <Question title={p.cityQ} error={errors.city}>
                    {p.cities.map((c, i) => (
                      <Chip key={c} selected={draft.city === i} onClick={() => set("city", i)}>
                        {c}
                      </Chip>
                    ))}
                  </Question>
                  <Question title={p.modeQ} error={errors.mode}>
                    {p.modes.map((m, i) => {
                      const Icon = modeIcons[i] ?? Ship;
                      return (
                        <Chip key={m.label} selected={draft.mode === i} onClick={() => set("mode", i)}>
                          <Icon className="size-4" />
                          {m.label}
                        </Chip>
                      );
                    })}
                  </Question>
                  <Question title={p.sizeQ} error={errors.size}>
                    {p.sizes.map((s, i) => (
                      <Chip key={s} selected={draft.size === i} onClick={() => set("size", i)}>
                        {s}
                      </Chip>
                    ))}
                  </Question>
                </>
              )}

              {step === 2 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="inq-goods">{p.goodsLabel}</Label>
                    <Input
                      id="inq-goods"
                      value={draft.goods}
                      onChange={(e) => set("goods", e.target.value)}
                      placeholder={p.goodsPh}
                      className={cn("mt-2", fieldClass)}
                      aria-invalid={!!errors.goods}
                    />
                    {errors.goods && <p className="mt-2 text-xs font-medium text-destructive">{errors.goods}</p>}
                  </div>
                  <div>
                    <Label htmlFor="inq-name">{p.nameLabel}</Label>
                    <Input
                      id="inq-name"
                      autoComplete="name"
                      value={draft.name}
                      onChange={(e) => set("name", e.target.value)}
                      placeholder={p.namePh}
                      className={cn("mt-2", fieldClass)}
                      aria-invalid={!!errors.name}
                    />
                    {errors.name && <p className="mt-2 text-xs font-medium text-destructive">{errors.name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="inq-phone">{p.phoneLabel}</Label>
                    <Input
                      id="inq-phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      dir="ltr"
                      value={draft.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      placeholder={p.phonePh}
                      className={cn("mt-2 rtl:text-end", fieldClass)}
                      aria-invalid={!!errors.phone}
                    />
                    {errors.phone && <p className="mt-2 text-xs font-medium text-destructive">{errors.phone}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="inq-note">{p.noteLabel}</Label>
                    <Textarea
                      id="inq-note"
                      rows={3}
                      value={draft.note}
                      onChange={(e) => set("note", e.target.value)}
                      placeholder={p.notePh}
                      className="mt-2 rounded-2xl border-border bg-background px-4 py-3 text-base md:text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="inq-files">{p.filesLabel}</Label>
                    <p className="mt-1 text-xs text-muted-foreground">{p.filesHint}</p>
                    <input
                      ref={fileInput}
                      id="inq-files"
                      type="file"
                      multiple
                      accept={FILE_RULES.types.join(",")}
                      className="sr-only"
                      onChange={(e) => addFiles(e.target.files)}
                    />
                    {files.length > 0 && (
                      <ul className="mt-3 grid gap-2">
                        {files.map((f, i) => (
                          <li key={`${f.name}-${i}`} className="flex items-center gap-3 rounded-2xl bg-secondary/60 px-4 py-2.5 text-sm">
                            <FileText className="size-4 shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 truncate" dir="auto">
                              {f.name}
                            </span>
                            <span className="shrink-0 text-xs text-muted-foreground" dir="ltr">
                              {(f.size / 1024 / 1024).toFixed(1)} MB
                            </span>
                            <button
                              type="button"
                              aria-label={p.fileRemove}
                              onClick={() => {
                                setFiles(files.filter((_, j) => j !== i));
                                setFileIssue(null);
                              }}
                              className="grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground"
                            >
                              <X className="size-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    {files.length < FILE_RULES.maxFiles && (
                      <button
                        type="button"
                        onClick={() => fileInput.current?.click()}
                        className="mt-3 inline-flex items-center gap-2 rounded-full border border-dashed border-primary/50 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
                      >
                        <Paperclip className="size-4" />
                        {p.filesAdd}
                      </button>
                    )}
                    {fileIssue && <p className="mt-2 text-xs font-medium text-destructive">{p.fileErrors[fileIssue]}</p>}
                  </div>
                </div>
              )}
            </div>

            {sendError && (
              <p role="alert" className="mt-6 rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                {sendError}
              </p>
            )}
            <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="rounded-full px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  {p.back}
                </button>
              ) : (
                <span />
              )}
              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-70"
              >
                {sending ? p.submitting : step < 2 ? p.next : p.submit}
                {sending ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4 rtl:rotate-180" />}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
