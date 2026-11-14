import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type ArticleCategory = "guide" | "news" | "market";
export type PublicArticle = {
  slug: string;
  lang: string;
  category: ArticleCategory;
  title: string;
  excerpt: string;
  body: string;
  coverUrl: string | null;
  instagramUrl: string | null;
  publishedAt: string | null;
};

function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

type Row = Database["public"]["Tables"]["articles"]["Row"];

async function toPublic(rows: Row[]): Promise<PublicArticle[]> {
  const sb = publicClient();
  const paths = rows.map((r) => r.cover_url).filter((p): p is string => !!p);
  const signed = new Map<string, string>();
  if (paths.length) {
    const { data } = await sb.storage.from("article-covers").createSignedUrls(paths, 60 * 60 * 24 * 7);
    for (const d of data ?? []) if (d.path && d.signedUrl) signed.set(d.path, d.signedUrl);
  }
  return rows.map((r) => ({
    slug: r.slug,
    lang: r.lang,
    category: r.category,
    title: r.title,
    excerpt: r.excerpt,
    body: r.body,
    coverUrl: r.cover_url ? (signed.get(r.cover_url) ?? null) : null,
    instagramUrl: r.instagram_url,
    publishedAt: r.published_at,
  }));
}

export const listArticles = createServerFn({ method: "GET" })
  .inputValidator(z.object({ lang: z.enum(["fa", "en"]), limit: z.number().int().min(1).max(60).default(30) }))
  .handler(async ({ data }) => {
    const { data: rows, error } = await publicClient()
      .from("articles")
      .select("*")
      .eq("status", "published")
      .eq("lang", data.lang)
      .order("published_at", { ascending: false })
      .limit(data.limit);
    if (error) throw new Error("Could not load articles");
    return toPublic(rows ?? []);
  });

export const getArticle = createServerFn({ method: "GET" })
  .inputValidator(z.object({ slug: z.string().min(1).max(120) }))
  .handler(async ({ data }) => {
    const { data: row, error } = await publicClient().from("articles").select("*").eq("status", "published").eq("slug", data.slug).maybeSingle();
    if (error) throw new Error("Could not load article");
    if (!row) return null;
    return (await toPublic([row]))[0] ?? null;
  });
