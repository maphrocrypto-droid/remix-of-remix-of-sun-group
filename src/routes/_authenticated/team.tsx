import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/site/SiteShell";
import { TeamBar } from "@/components/team/TeamBar";
import { supabase } from "@/integrations/supabase/client";
import { content, parseLang, type Lang } from "@/lib/sungroup-content";
import { accessQuery, teamMembersQuery } from "@/lib/team-queries";

export const Route = createFileRoute("/_authenticated/team")({
  validateSearch: parseLang,
  head: () => ({
    meta: [
      { title: "اعضای تیم | SUNGROUP" },
      { name: "description", content: "مدیریت دسترسی همکاران به پنل استعلام‌های گروه بازرگانی آفتاب." },
      { property: "og:title", content: "اعضای تیم | SUNGROUP" },
      { property: "og:description", content: "مدیریت دسترسی تیم." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: async ({ context }) => {
    const access = await context.queryClient.ensureQueryData(accessQuery);
    if (access.isAdmin) await context.queryClient.ensureQueryData(teamMembersQuery);
  },
  component: TeamPage,
});

function TeamPage() {
  const lang = Route.useSearch().lang ?? "fa";
  const tm = content[lang].team;
  const { data: access } = useSuspenseQuery(accessQuery);
  return (
    <SiteShell lang={lang} current="/team">
      <section className="mx-auto max-w-4xl px-6 py-8 md:py-12">
        <TeamBar lang={lang} current="/team" isAdmin={access.isAdmin} email={access.email} />
        {access.isAdmin ? <Members lang={lang} me={access.userId} /> : <p className="mt-10 rounded-2xl bg-card p-8 text-muted-foreground">{tm.onlyAdmins}</p>}
      </section>
    </SiteShell>
  );
}

function Members({ lang, me }: { lang: Lang; me: string | null }) {
  const tm = content[lang].team;
  const qc = useQueryClient();
  const { data: members } = useSuspenseQuery(teamMembersQuery);
  const [error, setError] = useState<string | null>(null);

  const change = async (userId: string, role: "admin" | "staff", add: boolean) => {
    setError(null);
    const res = add
      ? await supabase.from("user_roles").insert({ user_id: userId, role })
      : await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
    if (res.error) setError(tm.error);
    await qc.invalidateQueries({ queryKey: ["team"] });
  };

  const btn = "rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary";

  return (
    <>
      <h1 className="mt-8 font-display text-3xl font-semibold">{tm.title}</h1>
      <p className="mt-2 text-muted-foreground">{tm.sub}</p>
      {error && <p className="mt-4 text-sm font-medium text-destructive">{error}</p>}
      <ul className="mt-6 grid gap-2">
        {members.map((m) => (
          <li key={m.id} className="flex flex-wrap items-center gap-3 rounded-2xl bg-card p-4">
            <div className="min-w-0 flex-1">
              <div className="font-medium">
                {m.full_name || m.email}
                {m.id === me && <span className="ms-2 text-xs text-muted-foreground">({tm.you})</span>}
              </div>
              <div className="truncate text-xs text-muted-foreground" dir="ltr">{m.email}</div>
            </div>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
              {m.isAdmin ? tm.admin : m.isStaff ? tm.staff : tm.pending}
            </span>
            {m.id !== me && (
              <div className="flex gap-2">
                {m.isStaff || m.isAdmin ? (
                  m.isStaff && <button type="button" className={btn} onClick={() => void change(m.id, "staff", false)}>{tm.revoke}</button>
                ) : (
                  <button type="button" className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground" onClick={() => void change(m.id, "staff", true)}>{tm.approve}</button>
                )}
                <button type="button" className={btn} onClick={() => void change(m.id, "admin", !m.isAdmin)}>
                  {m.isAdmin ? tm.removeAdmin : tm.makeAdmin}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
