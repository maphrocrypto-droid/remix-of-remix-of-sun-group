import { describe, expect, it } from "vitest";

import { isValidPhone, normalizePhone, whatsappLink } from "@/lib/inquiry";
import { isOfficeOpen, officeSchedules } from "@/lib/office-hours";

const [tehran, guangzhou] = officeSchedules;

describe("office hours", () => {
  it("Tehran is open on Saturday at 10:00 Tehran time", () => {
    expect(isOfficeOpen(tehran!, new Date("2026-11-07T06:30:00Z"))).toBe(true);
  });

  it("Tehran is closed on Friday", () => {
    expect(isOfficeOpen(tehran!, new Date("2026-11-13T06:30:00Z"))).toBe(false);
  });

  it("Tehran closes at 13:00 on Thursday", () => {
    expect(isOfficeOpen(tehran!, new Date("2026-11-12T10:30:00Z"))).toBe(false);
  });

  it("Guangzhou is closed on Sunday and open on Monday at 10:00 China time", () => {
    expect(isOfficeOpen(guangzhou!, new Date("2026-11-08T02:00:00Z"))).toBe(false);
    expect(isOfficeOpen(guangzhou!, new Date("2026-11-09T02:00:00Z"))).toBe(true);
  });
});

describe("inquiry phone", () => {
  it("accepts a phone typed in Persian digits", () => {
    expect(normalizePhone("۰۹۱۲ ۵۲۷ ۷۸۳۸")).toBe("09125277838");
    expect(isValidPhone("۰۹۱۲ ۵۲۷ ۷۸۳۸")).toBe(true);
  });

  it("rejects a number that is too short", () => {
    expect(isValidPhone("12345")).toBe(false);
  });

  it("builds a WhatsApp link to the office number", () => {
    expect(whatsappLink("+989125277838", "سلام")).toBe("https://wa.me/989125277838?text=%D8%B3%D9%84%D8%A7%D9%85");
  });
});
