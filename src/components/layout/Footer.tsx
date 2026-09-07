type Locale = "en" | "ta";

const LABELS = {
  en: { tagline: "Tamil Recipes: A Bilingual Collection" },
  ta: { tagline: "தமிழர் சமையல் குறிப்புகள் இருமொழித் தொகுப்பு" },
} satisfies Record<Locale, Record<string, string>>;

export function Footer({ locale }: { locale: Locale }) {
  const t = LABELS[locale];

  return (
    <footer className="mt-auto border-t-2 border-brand p-4 text-center text-sm text-neutral-600">
      <p>{t.tagline}</p>
    </footer>
  );
}
