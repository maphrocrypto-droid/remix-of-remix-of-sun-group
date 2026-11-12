import type { Lang } from "@/lib/sungroup-content";

const locale = (lang: Lang) => (lang === "fa" ? "fa-IR" : "en-GB");

/** Date + time in Tehran time, in the reader's language and calendar. */
export function formatDateTime(lang: Lang, iso: string) {
  return new Intl.DateTimeFormat(locale(lang), { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Tehran" }).format(new Date(iso));
}

/** Short day + month, e.g. for week labels. */
export function formatDay(lang: Lang, isoDate: string) {
  return new Intl.DateTimeFormat(locale(lang), { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${isoDate}T00:00:00Z`));
}

export function formatNumber(lang: Lang, n: number) {
  return n.toLocaleString(locale(lang));
}
