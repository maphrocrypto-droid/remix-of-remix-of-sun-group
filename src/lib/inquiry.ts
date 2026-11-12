// Pure helpers for the smart inquiry form on /contact.

/** Converts Persian/Arabic digits to Latin and keeps only digits (and a leading +). */
export function normalizePhone(raw: string) {
  const latin = raw
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
  const trimmed = latin.trim();
  const digits = trimmed.replace(/\D/g, "");
  return trimmed.startsWith("+") ? `+${digits}` : digits;
}

/** A phone number is accepted when it has 8 to 15 digits. */
export function isValidPhone(raw: string) {
  const digits = normalizePhone(raw).replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

/** Short reference code like SG-K7Q2M9 (no 0/O/1/I to avoid confusion when read aloud). */
export function makeReferenceCode(random: () => number = Math.random) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += alphabet[Math.floor(random() * alphabet.length)];
  return `SG-${code}`;
}

/** wa.me link that opens WhatsApp with the message prefilled. */
export function whatsappLink(tel: string, message: string) {
  return `https://wa.me/${tel.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

/** Attachment rules for the inquiry form: up to 5 photos or PDFs, 10 MB each. */
export const FILE_RULES = {
  maxFiles: 5,
  maxBytes: 10 * 1024 * 1024,
  types: ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"] as const,
};

export type FileIssue = "type" | "size" | "count";

/** First rule a set of attachments breaks, or null when all are acceptable. */
export function checkFiles(files: { type: string; size: number }[]): FileIssue | null {
  if (files.length > FILE_RULES.maxFiles) return "count";
  for (const f of files) {
    if (!(FILE_RULES.types as readonly string[]).includes(f.type)) return "type";
    if (f.size <= 0 || f.size > FILE_RULES.maxBytes) return "size";
  }
  return null;
}

/** Storage-safe file name that keeps the extension (e.g. "عکس کالا.JPG" -> "file.jpg"). */
export function safeFileName(name: string) {
  const dot = name.lastIndexOf(".");
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) : "";
  const base = (dot > 0 ? name.slice(0, dot) : name)
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${base || "file"}${ext ? `.${ext}` : ""}`;
}

/**
 * Two phone numbers are the same customer when their last 8 digits match,
 * so "0912 527 7838", "+98 912 527 7838" and "۰۹۱۲۵۲۷۷۸۳۸" all match.
 */
export function phonesMatch(a: string, b: string) {
  const da = normalizePhone(a).replace(/\D/g, "");
  const db = normalizePhone(b).replace(/\D/g, "");
  return da.length >= 8 && db.length >= 8 && da.slice(-8) === db.slice(-8);
}

/** Cryptographically random number in [0, 1) for reference codes. */
export function secureRandom() {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0]! / 2 ** 32;
}
