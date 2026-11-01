import { Pressable, StyleSheet, Text, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import { colors, radius } from "@/lib/theme";

interface ButtonProps extends Omit<PressableProps, "style" | "children"> {
  title: string;
  variant?: "primary" | "secondary" | "ghost";
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({ title, variant = "primary", compact, disabled, style, ...props }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        compact && styles.compact,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      <Text style={[styles.label, variant === "primary" ? styles.labelPrimary : styles.labelDark]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  compact: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.sm,
  },
  primary: {
    backgroundColor: colors.bench,
  },
  secondary: {
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: "rgba(17, 17, 17, 0.08)",
  },
  ghost: {
    backgroundColor: "transparent",
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.6,
  },
  label: {
    fontWeight: "700",
    fontSize: 15,
  },
  labelPrimary: {
    color: "#ffffff",
  },
  labelDark: {
    color: colors.ink,
  },
});
