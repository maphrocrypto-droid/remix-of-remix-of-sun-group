// Office opening hours, in each office's own time zone.
// Same order as content[lang].offices (Tehran, Guangzhou).
// Hours are placeholders until the client confirms the real schedule.

/** Day 0 = Sunday … 6 = Saturday; value = [open, close] in minutes after midnight. */
export type OfficeSchedule = {
  timeZone: string;
  utcLabel: string;
  days: Partial<Record<number, readonly [number, number]>>;
};

const h = (hours: number) => hours * 60;

export const officeSchedules: readonly OfficeSchedule[] = [
  {
    timeZone: "Asia/Tehran",
    utcLabel: "UTC+3:30",
    days: { 6: [h(9), h(17)], 0: [h(9), h(17)], 1: [h(9), h(17)], 2: [h(9), h(17)], 3: [h(9), h(17)], 4: [h(9), h(13)] },
  },
  {
    timeZone: "Asia/Shanghai",
    utcLabel: "UTC+8",
    days: { 1: [h(9), h(18)], 2: [h(9), h(18)], 3: [h(9), h(18)], 4: [h(9), h(18)], 5: [h(9), h(18)], 6: [h(9), h(18)] },
  },
];

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Weekday and minutes after midnight for `date` in the given time zone. */
export function localDayAndMinutes(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    day: weekdays.indexOf(get("weekday")),
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

export function isOfficeOpen(schedule: OfficeSchedule, date: Date) {
  const { day, minutes } = localDayAndMinutes(date, schedule.timeZone);
  const range = schedule.days[day];
  return !!range && minutes >= range[0] && minutes < range[1];
}

/** "14:05" style clock in the office's time zone, with Persian digits for fa. */
export function formatOfficeTime(date: Date, timeZone: string, lang: "fa" | "en") {
  return new Intl.DateTimeFormat(lang === "fa" ? "fa-IR" : "en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}
