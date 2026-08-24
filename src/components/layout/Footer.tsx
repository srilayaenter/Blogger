type Locale = "en" | "ta";

const LABELS = {
  en: { tagline: "Preserving Tamil recipes, one dish at a time." },
  ta: { tagline: "தமிழ் சமையல் குறிப்புகளைப் பாதுகாக்கிறோம்." },
} satisfies Record<Locale, Record<string, string>>;

export function Footer({ locale }: { locale: Locale }) {
  const t = LABELS[locale];

  return (
    <footer className="mt-auto border-t-2 border-brand p-4 text-center text-sm text-neutral-600">
      <p>{t.tagline}</p>
    </footer>
  );
}
