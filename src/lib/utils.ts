import { Alert, Platform } from "react-native";

// Польські злоті: "1 250 zł", дробові суми з грошами — "12,50 zł"
export function formatMoney(value: number, intlLocale = "uk-UA") {
  const fractionDigits = Number.isInteger(value) ? 0 : 2;
  try {
    return new Intl.NumberFormat(intlLocale, {
      style: "currency",
      currency: "PLN",
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    // Hermes на деяких Android-збірках не знає narrowSymbol
    return `${value.toFixed(fractionDigits).replace(".", ",")} zł`;
  }
}

// Ціна з поля вводу: "12", "12.5", "12,50" (до 2 знаків після коми); null — якщо формат невірний
export function parsePrice(value: string) {
  const normalized = value.trim().replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Number(normalized);
}

// YYYY-MM-DD у локальному часовому поясі (toISOString зсуває дату в UTC)
export function toLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// "YYYY-MM-DD" → локальна північ (new Date("YYYY-MM-DD") дає UTC-північ)
export function fromLocalDateString(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return year && month && day ? new Date(year, month - 1, day) : new Date();
}

export function defaultMonthRange() {
  const now = new Date();
  return {
    from: toLocalDateString(new Date(now.getFullYear(), now.getMonth(), 1)),
    to: toLocalDateString(now),
  };
}

export function formatDate(value: string, intlLocale = "uk-UA") {
  // голий "YYYY-MM-DD" (фільтри, поля дати) — локальна дата; повні ISO-рядки з API — як є
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? fromLocalDateString(value) : new Date(value);
  return new Intl.DateTimeFormat(intlLocale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

interface ConfirmLabels {
  confirm: string;
  cancel: string;
}

// Alert.alert з кнопками не працює у вебі, там лишається window.confirm
export function confirmAction(message: string, labels: ConfirmLabels, onConfirm: () => void) {
  if (Platform.OS === "web") {
    if (window.confirm(message)) onConfirm();
    return;
  }
  Alert.alert(message, undefined, [
    { text: labels.cancel, style: "cancel" },
    { text: labels.confirm, style: "destructive", onPress: onConfirm },
  ]);
}
