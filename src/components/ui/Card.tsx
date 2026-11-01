import type { ReactNode } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, radius } from "@/lib/theme";

interface CardProps {
  title?: string;
  hint?: string;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

export function Card({ title, hint, style, children }: CardProps) {
  return (
    <View style={[styles.card, style]}>
      {title ? (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {hint ? <Text style={styles.hint}>{hint}</Text> : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={[styles.card, styles.stat]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 14,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.ink,
  },
  hint: {
    fontSize: 13,
    color: colors.textMuted,
  },
  stat: {
    flex: 1,
    gap: 6,
    padding: 16,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: colors.textMuted,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.ink,
    fontVariant: ["tabular-nums"],
  },
});
