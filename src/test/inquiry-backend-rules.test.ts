import { describe, expect, it } from "vitest";
import { checkFiles, phonesMatch, safeFileName } from "@/lib/inquiry";

const MB = 1024 * 1024;

describe("inquiry attachments", () => {
  it("accepts up to 5 photos or PDFs of 10 MB each", () => {
    const files = Array.from({ length: 5 }, () => ({ type: "image/jpeg", size: 10 * MB }));
    expect(checkFiles(files)).toBeNull();
  });

  it("rejects a sixth file", () => {
    const files = Array.from({ length: 6 }, () => ({ type: "application/pdf", size: MB }));
    expect(checkFiles(files)).toBe("count");
  });

  it("rejects a file larger than 10 MB", () => {
    expect(checkFiles([{ type: "image/png", size: 10 * MB + 1 }])).toBe("size");
  });

  it("rejects files that are not photos or PDFs", () => {
    expect(checkFiles([{ type: "application/zip", size: MB }])).toBe("type");
  });

  it("keeps the extension in a storage-safe name", () => {
    expect(safeFileName("عکس کالا.JPG")).toBe("file.jpg");
    expect(safeFileName("invoice 2026.pdf")).toBe("invoice-2026.pdf");
  });
});

describe("inquiry tracking", () => {
  it("matches the same phone written with +98, 0 or Persian digits", () => {
    expect(phonesMatch("+98 912 527 7838", "09125277838")).toBe(true);
    expect(phonesMatch("۰۹۱۲۵۲۷۷۸۳۸", "+989125277838")).toBe(true);
  });

  it("does not match a different phone", () => {
    expect(phonesMatch("09125277838", "09125277839")).toBe(false);
  });
});
