import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  SITE_NAME,
  SITE_URL,
  OG_LOCALE,
  OG_ALTERNATE_LOCALE,
  fallbackOgImage,
  type Locale,
  SUPPORTED_LOCALES,
} from "@/lib/metadata";

function isSupportedLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

const SITE_DESCRIPTION: Record<Locale, string> = {
  en: "A bilingual collection of Tamil recipes, preserved from a printed cookbook and translated for home cooks everywhere.",
  ta: "அச்சிடப்பட்ட சமையல் புத்தகத்திலிருந்து பாதுகாக்கப்பட்ட, இருமொழி தமிழ் சமையல் குறிப்புகளின் தொகுப்பு.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const resolvedLocale: Locale = isSupportedLocale(locale) ? locale : "en";
  const siteName = SITE_NAME[resolvedLocale];
  const image = fallbackOgImage(resolvedLocale);

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: siteName, template: `%s | ${siteName}` },
    description: SITE_DESCRIPTION[resolvedLocale],
    openGraph: {
      siteName,
      type: "website",
      locale: OG_LOCALE[resolvedLocale],
      alternateLocale: OG_ALTERNATE_LOCALE[resolvedLocale],
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      images: [image.url],
    },
    verification: {
      google: "Q8idzl2UZNNAr50igNOC_nEXwQ5RknQUhkG-qHyGUFk",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body>
        <div className="flex min-h-screen flex-col">
          <Header locale={locale} />
          <main className="mx-auto w-full max-w-4xl flex-1 p-4">{children}</main>
          <Footer locale={locale} />
        </div>
      </body>
    </html>
  );
}
