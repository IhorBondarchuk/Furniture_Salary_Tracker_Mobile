import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useI18n } from "@/lib/store/locale";
import { colors } from "@/lib/theme";
import type { WorkRecord } from "@/lib/types";
import { formatDate, formatMoney } from "@/lib/utils";

interface RecordRowProps {
  record: WorkRecord;
  showWorker?: boolean;
  actions?: ReactNode;
}

// Рядок таблиці записів у вигляді картки: на вузькому екрані 4–5 колонок не вміщуються
export function RecordRow({ record, showWorker, actions }: RecordRowProps) {
  const { intlLocale } = useI18n();

  return (
    <View style={styles.row}>
      <View style={styles.main}>
        <View style={styles.info}>
          <Text style={styles.item} numberOfLines={2}>
            {record.itemName}
          </Text>
          <Text style={styles.meta}>
            {formatDate(record.date, intlLocale)}
            {showWorker ? ` · ${record.workerName}` : ""}
          </Text>
        </View>
        <View style={styles.numbers}>
          <Text style={styles.amount}>{formatMoney(record.earned, intlLocale)}</Text>
          <Text style={styles.meta}>× {record.quantity}</Text>
        </View>
      </View>
      {actions}
    </View>
  );
}

export const listStyles = StyleSheet.create({
  list: {
    gap: 8,
  },
  empty: {
    textAlign: "center",
    color: colors.textMuted,
    paddingVertical: 20,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
});

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  main: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  numbers: {
    alignItems: "flex-end",
    gap: 4,
  },
  item: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.ink,
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink,
    fontVariant: ["tabular-nums"],
  },
  meta: {
    fontSize: 13,
    color: colors.textMuted,
    fontVariant: ["tabular-nums"],
  },
});
