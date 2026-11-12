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
