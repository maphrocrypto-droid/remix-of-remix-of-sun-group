import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/site/SiteShell";
import { ArticleCard } from "@/components/site/ArticleCard";
import { listArticles } from "@/lib/articles.functions";
import { content, parseLang, type Lang } from "@/lib/sungroup-content";

const articlesQuery = (lang: Lang) => queryOptions({ queryKey: ["articles", lang], queryFn: () => listArticles({ data: { lang, limit: 30 } }) });

export const Route = createFileRoute("/insights/")({
  validateSearch: parseLang,
  loaderDeps: ({ search }) => ({ lang: search.lang ?? "fa" }),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(articlesQuery(deps.lang)),
  head: () => ({
    meta: [
      { title: "اخبار و آموزش بازرگانی | SUNGROUP" },
      { name: "description", content: "راهنمای واردات از چین، اخبار گمرک و ترخیص و تحلیل بازار چین از گروه بازرگانی آفتاب." },
      { property: "og:title", content: "اخبار و آموزش بازرگانی | SUNGROUP" },
      { property: "og:description", content: "راهنمای واردات، اخبار گمرک و بازار چین." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: ({ error }) => <p role="alert" className="p-10">{error.message}</p>,
  notFoundComponent: () => <p className="p-10">Not found</p>,
  component: InsightsPage,
});

function InsightsPage() {
  const lang = Route.useSearch().lang ?? "fa";
  const t = content[lang].insights;
  const { data } = useSuspenseQuery(articlesQuery(lang));
  return (
    <SiteShell lang={lang} current="/insights">
      <section className="mx-auto max-w-7xl px-6 py-12 md:py-20">
        <p className="text-sm font-semibold text-primary">{t.eyebrow}</p>
        <h1 className="mt-3 max-w-3xl font-display text-3xl font-semibold sm:text-5xl">{t.title}</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground sm:text-lg">{t.sub}</p>
        {data.length === 0 ? (
          <p className="mt-12 rounded-3xl bg-card p-10 text-center text-muted-foreground">{t.empty}</p>
        ) : (
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {data.map((a, i) => <ArticleCard key={a.slug} lang={lang} a={a} featured={i === 0} />)}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
