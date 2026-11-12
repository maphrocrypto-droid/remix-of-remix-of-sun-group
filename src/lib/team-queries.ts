import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

/** Who is signed in and what they may do. Roles are read from the protected roles table. */
export const accessQuery = queryOptions({
  queryKey: ["team", "access"],
  queryFn: async () => {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id ?? null;
    if (!userId) return { userId: null, email: null, isAdmin: false, isTeam: false };
    const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    if (error) throw error;
    const roles = (data ?? []).map((r) => r.role);
    return {
      userId,
      email: auth.user?.email ?? null,
      isAdmin: roles.includes("admin"),
      isTeam: roles.includes("admin") || roles.includes("staff"),
    };
  },
});

export const inquiriesQuery = queryOptions({
  queryKey: ["team", "inquiries"],
  queryFn: async () => {
    const { data, error } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false }).limit(1000);
    if (error) throw error;
    return data ?? [];
  },
});

export type InquiryRow = Tables<"inquiries">;

export const weeklyStatsQuery = queryOptions({
  queryKey: ["team", "weekly"],
  queryFn: async () => {
    const { data, error } = await supabase.rpc("inquiry_weekly_stats", { _weeks: 8 });
    if (error) throw error;
    return (data ?? []).map((w) => ({ week: w.week_start, total: Number(w.total), quoted: Number(w.quoted) }));
  },
});

export const inquiryFilesQuery = (inquiryId: string) =>
  queryOptions({
    queryKey: ["team", "files", inquiryId],
    queryFn: async () => {
      const bucket = supabase.storage.from("inquiry-files");
      const { data: list, error } = await bucket.list(inquiryId, { sortBy: { column: "name", order: "asc" } });
      if (error) throw error;
      const paths = (list ?? []).filter((f) => f.id).map((f) => `${inquiryId}/${f.name}`);
      if (!paths.length) return [];
      const { data: signed, error: signError } = await bucket.createSignedUrls(paths, 60 * 60);
      if (signError) throw signError;
      return (signed ?? []).filter((s) => s.signedUrl).map((s) => ({ path: s.path ?? "", url: s.signedUrl }));
    },
  });

export const teamMembersQuery = queryOptions({
  queryKey: ["team", "members"],
  queryFn: async () => {
    const [{ data: profiles, error: pe }, { data: roles, error: re }] = await Promise.all([
      supabase.from("profiles").select("id, email, full_name, created_at").order("created_at", { ascending: true }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    if (pe) throw pe;
    if (re) throw re;
    return (profiles ?? []).map((p) => {
      const mine = (roles ?? []).filter((r) => r.user_id === p.id).map((r) => r.role);
      return { ...p, isAdmin: mine.includes("admin"), isStaff: mine.includes("staff") };
    });
  },
});
