import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { FILE_RULES, checkFiles, isValidPhone, makeReferenceCode, normalizePhone, phonesMatch, safeFileName, secureRandom } from "@/lib/inquiry";

const BUCKET = "inquiry-files";
// One phone number may send at most this many inquiries per hour.
const MAX_PER_HOUR = 5;

const index = z.number().int().min(0).max(20);

const submitSchema = z.object({
  lang: z.enum(["fa", "en"]),
  service: index,
  chinaCity: index,
  shippingMode: index,
  volume: index,
  goods: z.string().trim().min(2).max(300),
  name: z.string().trim().min(2).max(120),
  phone: z.string().max(30).refine(isValidPhone),
  note: z.string().trim().max(2000),
  files: z
    .array(z.object({ name: z.string().min(1).max(200), type: z.string().max(100), size: z.number().int() }))
    .max(FILE_RULES.maxFiles)
    .refine((files) => checkFiles(files) === null),
});

export type SubmitInquiryInput = z.infer<typeof submitSchema>;

/** Public: saves a website inquiry and returns its tracking code plus one signed upload slot per attachment. */
export const submitInquiry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => submitSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const phone = normalizePhone(data.phone);

    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from("inquiries")
      .select("id", { count: "exact", head: true })
      .eq("phone", phone)
      .gte("created_at", since);
    if ((count ?? 0) >= MAX_PER_HOUR) return { ok: false as const, error: "rate" as const };

    let row: { id: string; tracking_code: string } | null = null;
    for (let attempt = 0; attempt < 4 && !row; attempt++) {
      const { data: inserted, error } = await supabaseAdmin
        .from("inquiries")
        .insert({
          tracking_code: makeReferenceCode(secureRandom),
          lang: data.lang,
          service: data.service,
          china_city: data.chinaCity,
          shipping_mode: data.shippingMode,
          volume: data.volume,
          goods: data.goods,
          contact_name: data.name,
          phone,
          note: data.note || null,
          file_count: data.files.length,
        })
        .select("id, tracking_code")
        .single();
      if (inserted) row = inserted;
      else if (error?.code !== "23505") throw new Error(error?.message ?? "Insert failed");
    }
    if (!row) throw new Error("Could not create a unique tracking code");

    const uploads: { path: string; token: string }[] = [];
    for (const [i, f] of data.files.entries()) {
      const { data: signed } = await supabaseAdmin.storage
        .from(BUCKET)
        .createSignedUploadUrl(`${row.id}/${i + 1}-${safeFileName(f.name)}`);
      if (signed) uploads.push({ path: signed.path, token: signed.token });
    }

    return { ok: true as const, code: row.tracking_code, uploads };
  });

const trackSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^SG-[A-Z0-9]{6}$/),
  phone: z.string().max(30),
});

/** Public: status of one inquiry, only when both the tracking code and the phone number match. */
export const trackInquiry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => trackSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("inquiries")
      .select("tracking_code, status, service, phone, created_at, status_changed_at")
      .eq("tracking_code", data.code)
      .maybeSingle();
    if (!row || !phonesMatch(row.phone, data.phone)) return { found: false as const };
    return {
      found: true as const,
      code: row.tracking_code,
      status: row.status,
      service: row.service,
      createdAt: row.created_at,
      statusChangedAt: row.status_changed_at,
    };
  });
