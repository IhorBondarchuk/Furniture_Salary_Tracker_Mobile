import { TextInput, type StyleProp, type TextInputProps, type ViewStyle } from "react-native";
import { Field, fieldStyles } from "@/components/ui/Field";
import { colors } from "@/lib/theme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export function Input({ label, error, containerStyle, style, ...props }: InputProps) {
  return (
    <Field label={label} error={error} style={containerStyle}>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.textMuted}
        style={[fieldStyles.control, error && fieldStyles.controlError, style]}
        {...props}
      />
    </Field>
  );
}
