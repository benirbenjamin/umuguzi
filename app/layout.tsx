import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getPublicSiteSettings } from "@/lib/settings";
import { getCurrentUser } from "@/lib/auth";
import { AppProviders } from "@/components/providers/AppProviders";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  return {
    title: {
      default: `${settings.app_name || "Umuguzipro"} — Rwanda & Global Media & Commerce`,
      template: `%s | ${settings.app_name || "Umuguzipro"}`,
    },
    description: settings.app_tagline || "Discover videos, creative services, and digital marketplace in Rwanda and worldwide.",
    icons: {
      icon: settings.favicon_url || "/favicon.ico",
    },
    openGraph: {
      title: settings.app_name || "Umuguzipro",
      description: settings.app_tagline || "Discover videos, creative services, and digital marketplace.",
      type: "website",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getPublicSiteSettings();
  const user = await getCurrentUser();

  const brandCssVars = `
    :root {
      --brand-primary: ${settings.brand_primary || "#2563eb"};
      --brand-primary-hover: ${settings.brand_primary_hover || "#1d4ed8"};
      --brand-accent: ${settings.brand_accent || "#0ea5e9"};
    }
  `;

  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: brandCssVars }} />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased`}>
        <AppProviders initialSettings={settings} initialUser={user}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
