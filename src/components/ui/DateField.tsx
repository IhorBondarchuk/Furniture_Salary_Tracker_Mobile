import { useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, TextInput, View, type StyleProp, type ViewStyle } from "react-native";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Button } from "@/components/ui/Button";
import { Field, fieldStyles } from "@/components/ui/Field";
import { useI18n } from "@/lib/store/locale";
import { colors, radius } from "@/lib/theme";
import { formatDate, fromLocalDateString, toLocalDateString } from "@/lib/utils";

interface DateFieldProps {
  label?: string;
  error?: string;
  // YYYY-MM-DD, як і в API
  value: string;
  onChange: (value: string) => void;
  style?: StyleProp<ViewStyle>;
}

export function DateField({ label, error, value, onChange, style }: DateFieldProps) {
  const { t, intlLocale } = useI18n();
  const [iosOpen, setIosOpen] = useState(false);
  const [draft, setDraft] = useState(() => fromLocalDateString(value));

  // datetimepicker не підтримує веб — там звичайне поле YYYY-MM-DD
  if (Platform.OS === "web") {
    return (
      <Field label={label} error={error} style={style}>
        <TextInput
          accessibilityLabel={label}
          style={[fieldStyles.control, error && fieldStyles.controlError]}
          value={value}
          placeholder="YYYY-MM-DD"
          onChangeText={onChange}
        />
      </Field>
    );
  }

  const open = () => {
    const current = fromLocalDateString(value);
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: current,
        mode: "date",
        onValueChange: (_event, date) => onChange(toLocalDateString(date)),
      });
      return;
    }
    setDraft(current);
    setIosOpen(true);
  };

  return (
    <Field label={label} error={error} style={style}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[fieldStyles.control, styles.trigger, error && fieldStyles.controlError]}
        onPress={open}
      >
        <Text style={styles.value}>{value ? formatDate(value, intlLocale) : "—"}</Text>
        <Text style={styles.icon}>▾</Text>
      </Pressable>

      {Platform.OS === "ios" ? (
        <Modal visible={iosOpen} transparent animationType="fade" onRequestClose={() => setIosOpen(false)}>
          <Pressable style={styles.backdrop} onPress={() => setIosOpen(false)}>
            <Pressable style={styles.sheet}>
              <DateTimePicker
                value={draft}
                mode="date"
                display="inline"
                locale={intlLocale}
                accentColor={colors.bench}
                onValueChange={(_event, date) => setDraft(date)}
              />
              <View style={styles.actions}>
                <Button title={t.common.cancel} variant="ghost" onPress={() => setIosOpen(false)} />
                <Button
                  title={t.common.done}
                  onPress={() => {
                    onChange(toLocalDateString(draft));
                    setIosOpen(false);
                  }}
                />
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </Field>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  value: {
    fontSize: 16,
    color: colors.ink,
    fontVariant: ["tabular-nums"],
  },
  icon: {
    color: colors.textMuted,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(17, 17, 17, 0.4)",
    justifyContent: "center",
    padding: 16,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
});
