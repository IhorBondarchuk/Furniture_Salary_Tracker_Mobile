import type { ReactNode } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { colors } from "@/lib/theme";

interface FieldProps {
  label?: string;
  error?: string;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

// Підпис + контрол + помилка: спільна обгортка для Input, DateField, Combobox
export function Field({ label, error, style, children }: FieldProps) {
  return (
    <View style={[styles.field, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {children}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export const fieldStyles = StyleSheet.create({
  control: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.ink,
  },
  controlError: {
    borderColor: colors.danger,
  },
});

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
  },
  error: {
    fontSize: 13,
    color: colors.danger,
  },
});
