import { Pressable, StyleSheet, Text, View } from "react-native";
import { Field } from "@/components/ui/Field";
import { colors } from "@/lib/theme";

interface SegmentedProps<T extends string> {
  label?: string;
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  size?: "md" | "sm";
}

// Замість <select> з двома-трьома варіантами: на телефоні всі опції видно одразу
export function Segmented<T extends string>({ label, options, value, onChange, size = "md" }: SegmentedProps<T>) {
  const control = (
    <View style={styles.group} accessibilityRole="radiogroup" accessibilityLabel={label}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            style={[styles.option, size === "sm" ? styles.optionSm : styles.optionMd, active && styles.active]}
            onPress={() => onChange(option.value)}
          >
            <Text style={[styles.text, size === "sm" && styles.textSm, active && styles.activeText]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  return label ? <Field label={label}>{control}</Field> : control;
}

const styles = StyleSheet.create({
  group: {
    flexDirection: "row",
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 3,
    gap: 3,
  },
  option: {
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 11,
  },
  // рівні сегменти на всю ширину; малий варіант (мови) — за шириною тексту
  optionMd: {
    flex: 1,
  },
  optionSm: {
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 9,
  },
  active: {
    backgroundColor: colors.ink,
  },
  text: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.ink,
  },
  textSm: {
    fontSize: 12,
    fontWeight: "700",
  },
  activeText: {
    color: "#ffffff",
  },
});
