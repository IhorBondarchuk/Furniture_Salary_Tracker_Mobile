import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/lib/theme";

export function PageHeading({ pretitle, title, subtitle }: { pretitle: string; title: string; subtitle?: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.pretitle}>{pretitle}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function FormError({ message }: { message?: string | null }) {
  return message ? <Text style={styles.error}>{message}</Text> : null;
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  pretitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.bench,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.ink,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.textMuted,
  },
  error: {
    fontSize: 14,
    color: colors.danger,
  },
});
