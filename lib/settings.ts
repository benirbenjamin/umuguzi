import prisma from "./prisma";
import { SiteSettings } from "@/types";

export const DEFAULT_SETTINGS: SiteSettings = {
  app_name: "Umuguzipro",
  app_tagline: "Rwanda & Global Video, Services & Digital Commerce Hub",
  logo_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80",
  favicon_url: "/favicon.ico",
  brand_primary: "#2563eb",
  brand_primary_hover: "#1d4ed8",
  brand_accent: "#0ea5e9",
  contact_email: "support@umuguzi.pro",
  contact_phone: "+250 788 000 111",
  contact_address: "Kigali City Center, KN 4 Ave, Kigali, Rwanda",
  social_facebook: "https://facebook.com",
  social_twitter: "https://x.com",
  social_instagram: "https://instagram.com",
  social_youtube: "https://youtube.com",
  social_linkedin: "https://linkedin.com",
  social_tiktok: "https://tiktok.com",
  social_whatsapp: "https://wa.me/250788000111",
  currency: "RWF",
  commission_rate: "10",
  flutterwave_enabled: "true",
  flutterwave_public_key: "FLWPUBK_TEST-SANDBOX-KEY-12345",
  flutterwave_secret_key: "FLWSECK_TEST-SANDBOX-KEY-67890",
  flutterwave_encryption_key: "FLWSECK_TEST_ENCR",
  manual_payment_enabled: "true",
  manual_payment_instructions: "Send payment via MTN Mobile Money or Airtel Money to (+250 788 000 111) or Bank Transfer to Bank of Kigali Account 00012345678. Reference your Order / Booking ID.",
  manual_payment_account_name: "Umuguzipro Ltd",
  manual_payment_account_number: "00012345678 (BK) / +250 788 000 111 (MTN MoMo)",
  storage_provider: "VERCEL_BLOB", // VERCEL_BLOB, AWS_S3, CLOUDFLARE_R2
  maintenance_mode: "false",
};

let cachedSettings: SiteSettings | null = null;
let cacheTime = 0;
const CACHE_TTL = 30 * 1000; // 30 seconds

export async function getSiteSettings(): Promise<SiteSettings> {
  const now = Date.now();
  if (cachedSettings && now - cacheTime < CACHE_TTL) {
    return cachedSettings;
  }

  try {
    const records = await prisma.siteSetting.findMany();
    if (!records || records.length === 0) {
      return DEFAULT_SETTINGS;
    }

    const settingsObj: any = { ...DEFAULT_SETTINGS };
    for (const record of records) {
      settingsObj[record.key] = record.value;
    }

    cachedSettings = settingsObj as SiteSettings;
    cacheTime = now;
    return cachedSettings;
  } catch (err) {
    console.warn("Could not load settings from DB, using defaults:", err);
    return DEFAULT_SETTINGS;
  }
}

export async function getPublicSiteSettings(): Promise<Partial<SiteSettings>> {
  const settings = await getSiteSettings();
  // Filter out private keys/secrets
  const publicSettings = { ...settings };
  delete (publicSettings as any).flutterwave_secret_key;
  delete (publicSettings as any).flutterwave_encryption_key;
  return publicSettings;
}

export async function updateSiteSettings(entries: Record<string, string>): Promise<SiteSettings> {
  for (const [key, value] of Object.entries(entries)) {
    let category = "GENERAL";
    if (key.startsWith("brand_") || key.startsWith("logo_") || key.startsWith("favicon_") || key.startsWith("app_")) {
      category = "BRANDING";
    } else if (key.startsWith("contact_")) {
      category = "CONTACT";
    } else if (key.startsWith("social_")) {
      category = "SOCIAL";
    } else if (key.startsWith("flutterwave_") || key.startsWith("manual_payment_") || key === "currency" || key === "commission_rate") {
      category = "PAYMENTS";
    }

    await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value: String(value), category },
      update: { value: String(value), category },
    });
  }

  cachedSettings = null; // Invalidate cache
  return getSiteSettings();
}
