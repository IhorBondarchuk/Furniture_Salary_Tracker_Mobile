import { StyleSheet, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { DateField } from "@/components/ui/DateField";
import { useI18n } from "@/lib/store/locale";

export interface DateRange {
  from: string;
  to: string;
}

interface DateRangeCardProps {
  title: string;
  hint: string;
  range: DateRange;
  onChange: (range: DateRange) => void;
}

export function DateRangeCard({ title, hint, range, onChange }: DateRangeCardProps) {
  const { t } = useI18n();

  return (
    <Card title={title} hint={hint}>
      <View style={styles.grid}>
        <DateField style={styles.cell} label={t.common.from} value={range.from} onChange={(from) => onChange({ ...range, from })} />
        <DateField style={styles.cell} label={t.common.to} value={range.to} onChange={(to) => onChange({ ...range, to })} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    gap: 10,
  },
  cell: {
    flex: 1,
  },
});
