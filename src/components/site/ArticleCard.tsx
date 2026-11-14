import { Link } from "@tanstack/react-router";
import { ArrowRight, Newspaper } from "lucide-react";
import { langSearch } from "@/components/site/SiteShell";
import { content, type Lang } from "@/lib/sungroup-content";
import { formatDay } from "@/lib/format";
import type { PublicArticle } from "@/lib/articles.functions";
import { cn } from "@/lib/utils";

export function ArticleCard({ lang, a, featured = false }: { lang: Lang; a: PublicArticle; featured?: boolean }) {
  const t = content[lang].insights;
  return (
    <Link
      to="/insights/$slug"
      params={{ slug: a.slug }}
      search={langSearch(lang)}
      className={cn(
        "group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-soft",
        featured && "md:col-span-2 md:flex-row",
      )}
    >
      <div className={cn("relative aspect-[4/3] overflow-hidden bg-inverse", featured && "md:aspect-auto md:w-3/5")}>
        {a.coverUrl ? (
          <img src={a.coverUrl} alt="" loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="grid size-full place-items-center text-inverse-foreground/40">
            <Newspaper className="size-12" />
          </div>
        )}
        <span className="absolute start-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur">
          {t.categories[a.category]}
        </span>
      </div>
      <div className={cn("flex flex-1 flex-col p-6", featured && "md:justify-center md:p-10")}>
        {a.publishedAt && <p className="text-xs text-muted-foreground">{formatDay(a.publishedAt, lang)}</p>}
        <h3 className={cn("mt-2 font-display font-semibold leading-snug", featured ? "text-2xl md:text-3xl" : "text-lg")}>{a.title}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{a.excerpt}</p>
        <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-primary">
          {t.readMore}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
