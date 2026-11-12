import { useEffect, useState } from "react";
import { content, type Lang } from "@/lib/sungroup-content";
import { formatOfficeTime, isOfficeOpen, officeSchedules } from "@/lib/office-hours";
import { cn } from "@/lib/utils";

/** Current time, ticking every 30s. Null until mounted so server and client markup match. */
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function officeState(index: number, now: Date | null, lang: Lang) {
  const schedule = officeSchedules[index]!;
  return {
    schedule,
    time: now ? formatOfficeTime(now, schedule.timeZone, lang) : "--:--",
    open: now ? isOfficeOpen(schedule, now) : null,
  };
}

/** Green-light style dot + label for open/closed. */
export function StatusPill({ open, lang, className }: { open: boolean | null; lang: Lang; className?: string }) {
  const p = content[lang].contactPage;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        open ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground",
        open === null && "invisible",
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", open ? "animate-pulse bg-primary" : "bg-muted-foreground")} />
      {open ? p.open : p.closed}
    </span>
  );
}

/** Compact live clock chip for one office. */
export function OfficeClockChip({
  index,
  now,
  lang,
  className,
}: {
  index: number;
  now: Date | null;
  lang: Lang;
  className?: string;
}) {
  const office = content[lang].offices[index]!;
  const { time, open } = officeState(index, now, lang);
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-full border border-border bg-card py-1.5 pe-2 ps-4 text-sm shadow-soft",
        className,
      )}
    >
      <span className="flex items-center gap-3">
        <span className="font-medium">{office.city}</span>
        <span className="font-display font-semibold tabular-nums" dir="ltr">
          {time}
        </span>
      </span>
      <StatusPill open={open} lang={lang} />
    </div>
  );
}
