import { Segmented } from "@/components/ui/Segmented";
import { LOCALES } from "@/lib/i18n/dictionaries";
import { useLocaleStore } from "@/lib/store/locale";

const OPTIONS = LOCALES.map((option) => ({ value: option.code, label: option.label }));

export function LanguageSwitcher() {
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);

  return <Segmented size="sm" options={OPTIONS} value={locale} onChange={setLocale} />;
}
