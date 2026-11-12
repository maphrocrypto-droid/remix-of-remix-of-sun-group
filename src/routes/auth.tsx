import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import "@lovable.dev/cloud-auth-js/styles.css";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteShell } from "@/components/site/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { content, parseLang } from "@/lib/sungroup-content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  validateSearch: parseLang,
  head: () => ({
    meta: [
      { title: "ورود تیم | SUNGROUP — پنل استعلام‌ها" },
      { name: "description", content: "ورود همکاران گروه بازرگانی آفتاب به پنل مدیریت استعلام‌ها." },
      { property: "og:title", content: "ورود تیم | SUNGROUP" },
      { property: "og:description", content: "پنل داخلی مدیریت استعلام‌های گروه بازرگانی آفتاب." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const GOOGLE_G = (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
    <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
  </svg>
);

function AuthPage() {
  const lang = Route.useSearch().lang ?? "fa";
  const a = content[lang].auth;
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const toDashboard = () => navigate({ to: "/dashboard", search: lang === "en" ? { lang: "en" } : {}, replace: true });

  // Already signed in (or just returned from Google/Lovable): go straight to the dashboard.
  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) void toDashboard();
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) void toDashboard();
    });
    return () => data.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async () => {
    setError(null);
    setNotice(null);
    if (mode === "up" && name.trim().length < 2) return setError(a.errors.name);
    if (password.length < 8) return setError(a.errors.password);
    setBusy(true);
    try {
      if (mode === "in") {
        const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (err) setError(a.errors.signIn);
        else await toDashboard();
      } else {
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth`, data: { full_name: name.trim() } },
        });
        if (err) setError(a.errors.signUp);
        else if (data.session) await toDashboard();
        else {
          setNotice(a.checkEmail);
          setMode("in");
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const social = async (provider: "google" | "lovable") => {
    setError(null);
    const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: `${window.location.origin}/auth` });
    if (result.error) setError(a.errors.oauth);
    else if (!result.redirected) await toDashboard();
  };

  const field = "mt-2 h-12 rounded-2xl px-4 text-base md:text-sm";

  return (
    <SiteShell lang={lang} current="/auth">
      <section className="mx-auto grid max-w-md px-6 py-12 md:py-20">
        <span className="justify-self-start rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">{a.eyebrow}</span>
        <h1 className="mt-5 font-display text-3xl font-semibold">{a.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a.sub}</p>

        <div className="mt-8 rounded-[2rem] bg-card p-5 shadow-soft sm:p-7">
          <div role="tablist" className="grid grid-cols-2 gap-1 rounded-full bg-secondary p-1 text-sm font-medium">
            {(["in", "up"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={cn("rounded-full py-2.5 transition-colors", mode === m ? "bg-card shadow-soft" : "text-muted-foreground")}
              >
                {m === "in" ? a.signInTab : a.signUpTab}
              </button>
            ))}
          </div>

          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
            className="mt-6 grid gap-4"
          >
            {mode === "up" && (
              <div>
                <Label htmlFor="au-name">{a.fullName}</Label>
                <Input id="au-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={field} />
              </div>
            )}
            <div>
              <Label htmlFor="au-email">{a.email}</Label>
              <Input id="au-email" type="email" dir="ltr" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={cn(field, "rtl:text-end")} />
            </div>
            <div>
              <Label htmlFor="au-pass">{a.password}</Label>
              <Input
                id="au-pass"
                type="password"
                dir="ltr"
                autoComplete={mode === "in" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(field, "rtl:text-end")}
              />
            </div>
            {error && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {error}
              </p>
            )}
            {notice && <p className="rounded-2xl bg-primary/10 px-4 py-3 text-sm font-medium text-primary">{notice}</p>}
            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-70"
            >
              {busy && <Loader2 className="size-4 animate-spin" />}
              {busy ? a.working : mode === "in" ? a.submitIn : a.submitUp}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            {a.or}
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="grid gap-3">
            <button
              type="button"
              onClick={() => void social("google")}
              className="inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-full border border-google-border bg-google-surface px-3 text-sm font-medium text-google-text"
            >
              {GOOGLE_G}
              {a.google}
            </button>
            <button type="button" onClick={() => void social("lovable")} className="lovable-auth-button !w-full !rounded-full">
              {a.lovable}
            </button>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
