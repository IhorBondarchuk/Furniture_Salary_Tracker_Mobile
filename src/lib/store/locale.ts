import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dictionaries, INTL_LOCALES, type Locale } from "@/lib/i18n/dictionaries";

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: "uk",
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: "workbench-locale",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

// Для коду поза компонентами (напр. fetcher)
export function getDictionary() {
  return dictionaries[useLocaleStore.getState().locale];
}

export function useI18n() {
  const locale = useLocaleStore((state) => state.locale);
  return { t: dictionaries[locale], locale, intlLocale: INTL_LOCALES[locale] };
}
