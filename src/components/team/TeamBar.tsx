import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { langSearch } from "@/components/site/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { content, type Lang } from "@/lib/sungroup-content";
import { cn } from "@/lib/utils";

/** Title row of the team area: section tabs, signed-in email and sign out. */
export function TeamBar({
  lang,
  current,
  isAdmin,
  email,
}: {
  lang: Lang;
  current: "/dashboard" | "/team";
  isAdmin: boolean;
  email: string | null;
}) {
  const d = content[lang].dashboard;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/auth", search: langSearch(lang), replace: true });
  };

  const tab = (to: "/dashboard" | "/team", label: string) => (
    <Link
      to={to}
      search={langSearch(lang)}
      className={cn("rounded-full px-4 py-2 text-sm font-medium transition-colors", current === to ? "bg-inverse text-inverse-foreground" : "hover:bg-secondary")}
    >
      {label}
    </Link>
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <nav className="flex gap-1 rounded-full border border-border bg-card p-1">
        {tab("/dashboard", d.tabs.inquiries)}
        {isAdmin && tab("/team", d.tabs.team)}
      </nav>
      <div className="flex min-w-0 items-center gap-3 text-sm">
        {email && (
          <span className="min-w-0 truncate text-muted-foreground" dir="ltr">
            {email}
          </span>
        )}
        <button
          type="button"
          onClick={() => void signOut()}
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 py-2 font-medium transition-colors hover:bg-secondary"
        >
          <LogOut className="size-4 rtl:rotate-180" />
          {d.signOut}
        </button>
      </div>
    </div>
  );
}

const statusTone = {
  new: "bg-status-new/10 text-status-new",
  reviewing: "bg-status-reviewing/15 text-status-reviewing",
  quoted: "bg-status-quoted/15 text-status-quoted",
} as const;

export function StatusBadge({ lang, status }: { lang: Lang; status: keyof typeof statusTone }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap", statusTone[status])}>
      <span className="size-1.5 rounded-full bg-current" />
      {content[lang].inquiryStatus[status]}
    </span>
  );
}
