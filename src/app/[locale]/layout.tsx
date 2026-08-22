import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const SUPPORTED_LOCALES = ["en", "ta"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

function isSupportedLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

const SITE_NAME = { en: "SriLaYa Recipes", ta: "ஸ்ரீலயா சமையல் குறிப்புகள்" } satisfies Record<
  Locale,
  string
>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const siteName = isSupportedLocale(locale) ? SITE_NAME[locale] : SITE_NAME.en;

  return {
    title: { default: siteName, template: `%s | ${siteName}` },
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
    <div className="flex min-h-screen flex-col">
      <Header locale={locale} />
      <main className="mx-auto w-full max-w-4xl flex-1 p-4">{children}</main>
      <Footer locale={locale} />
    </div>
  );
}
