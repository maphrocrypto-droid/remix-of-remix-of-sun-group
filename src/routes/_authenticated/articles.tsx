import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/site/SiteShell";
import { TeamBar } from "@/components/team/TeamBar";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { content, parseLang, type Lang } from "@/lib/sungroup-content";
import { accessQuery } from "@/lib/team-queries";

type Article = Tables<"articles">;
const allArticlesQuery = queryOptions({
  queryKey: ["team", "articles"],
  queryFn: async () => {
    const { data, error } = await supabase.from("articles").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export const Route = createFileRoute("/_authenticated/articles")({
  validateSearch: parseLang,
  head: () => ({
    meta: [
      { title: "مدیریت اخبار و آموزش | SUNGROUP" },
      { name: "description", content: "ثبت و انتشار مطالب آموزشی و اخبار گروه بازرگانی آفتاب." },
      { property: "og:title", content: "مدیریت اخبار و آموزش | SUNGROUP" },
      { property: "og:description", content: "پنل مطالب تیم." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(accessQuery);
    await context.queryClient.ensureQueryData(allArticlesQuery);
  },
  component: ArticlesAdmin,
});

const blank = { slug: "", title: "", excerpt: "", body: "", category: "guide" as Article["category"], lang: "fa", status: "draft" as Article["status"], instagram_url: "", cover_url: null as string | null };

function ArticlesAdmin() {
  const lang: Lang = Route.useSearch().lang ?? "fa";
  const t = content[lang].articlesAdmin;
  const cats = content[lang].insights.categories;
  const qc = useQueryClient();
  const { data: access } = useSuspenseQuery(accessQuery);
  const { data: rows } = useSuspenseQuery(allArticlesQuery);
  const [form, setForm] = useState<(typeof blank & { id?: string }) | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!form) return;
    setBusy(true); setError(null);
    let cover = form.cover_url;
    if (file) {
      const path = `${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, "")}`;
      const up = await supabase.storage.from("article-covers").upload(path, file);
      if (!up.error) cover = path;
    }
    const { id, ...rest } = form;
    const payload = { ...rest, slug: rest.slug.trim().toLowerCase(), instagram_url: rest.instagram_url || null, cover_url: cover, author_id: access.userId };
    const res = id ? await supabase.from("articles").update(payload).eq("id", id) : await supabase.from("articles").insert(payload);
    setBusy(false);
    if (res.error) return setError(t.error);
    setForm(null); setFile(null);
    await qc.invalidateQueries({ queryKey: ["team", "articles"] });
  };

  const remove = async (id: string) => {
    if (!confirm(t.confirmRemove)) return;
    await supabase.from("articles").delete().eq("id", id);
    await qc.invalidateQueries({ queryKey: ["team", "articles"] });
  };

  const field = "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2";
  return (
    <SiteShell lang={lang} current="/articles">
      <section className="mx-auto max-w-4xl px-6 py-8 md:py-12">
        <TeamBar lang={lang} current="/articles" isAdmin={access.isAdmin} email={access.email} />
        {form ? (
          <div className="mt-8 space-y-4 rounded-3xl bg-card p-6">
            <h2 className="text-xl font-semibold">{form.id ? t.editTitle : t.newTitle}</h2>
            <label className="block text-sm">{t.title}<input className={field} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
            <label className="block text-sm">{t.slug}<input dir="ltr" className={field} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.replace(/[^a-zA-Z0-9-]/g, "-") })} /></label>
            <label className="block text-sm">{t.excerpt}<textarea rows={2} className={field} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></label>
            <label className="block text-sm">{t.body}<textarea rows={10} className={field} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></label>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block text-sm">{t.category}<select className={field} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Article["category"] })}>{(Object.keys(cats) as (keyof typeof cats)[]).map((c) => <option key={c} value={c}>{cats[c]}</option>)}</select></label>
              <label className="block text-sm">{t.lang}<select className={field} value={form.lang} onChange={(e) => setForm({ ...form, lang: e.target.value })}><option value="fa">فارسی</option><option value="en">English</option></select></label>
              <label className="block text-sm">{t.status.published}<select className={field} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Article["status"] })}><option value="draft">{t.status.draft}</option><option value="published">{t.status.published}</option></select></label>
            </div>
            <label className="block text-sm">{t.instagram}<input dir="ltr" className={field} value={form.instagram_url ?? ""} onChange={(e) => setForm({ ...form, instagram_url: e.target.value })} /></label>
            <label className="block text-sm">{t.cover}<input type="file" accept="image/*" className={field} onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></label>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <button type="button" disabled={busy || !form.title || !form.slug} onClick={() => void save()} className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">{busy ? t.saving : t.save}</button>
              <button type="button" onClick={() => setForm(null)} className="rounded-full border border-border px-5 py-2 text-sm">{t.cancel}</button>
            </div>
          </div>
        ) : (
          <>
            <button type="button" onClick={() => setForm({ ...blank, lang })} className="mt-8 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">{t.add}</button>
            {rows.length === 0 ? <p className="mt-6 text-muted-foreground">{t.empty}</p> : (
              <ul className="mt-6 divide-y divide-border rounded-3xl bg-card">
                {rows.map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="font-semibold">{r.title}</p>
                      <p className="text-xs text-muted-foreground">{cats[r.category]} · {t.status[r.status]} · {r.lang.toUpperCase()}</p>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <button type="button" className="rounded-full border border-border px-3 py-1.5" onClick={() => setForm({ id: r.id, slug: r.slug, title: r.title, excerpt: r.excerpt, body: r.body, category: r.category, lang: r.lang, status: r.status, instagram_url: r.instagram_url ?? "", cover_url: r.cover_url })}>{t.editTitle}</button>
                      <button type="button" className="rounded-full border border-border px-3 py-1.5 text-destructive" onClick={() => void remove(r.id)}>{t.remove}</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </SiteShell>
  );
}
