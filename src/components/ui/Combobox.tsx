import { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { Field, fieldStyles } from "@/components/ui/Field";
import { useI18n } from "@/lib/store/locale";
import { colors } from "@/lib/theme";

export interface ComboboxOption {
  id: string;
  name: string;
  hint?: string;
}

interface ComboboxProps {
  label?: string;
  options: ComboboxOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  error?: string;
}

// Пошук без урахування регістру та діакритики: "lozko" знайде "Łóżko"
function normalize(text: string) {
  const lower = text.toLowerCase();
  // String.prototype.normalize є не в усіх збірках Hermes
  const decomposed = typeof lower.normalize === "function" ? lower.normalize("NFD") : lower;
  return decomposed.replace(/[̀-ͯ]/g, "").replace(/ł/g, "l");
}

// На телефоні випадаючий список під полем закриває клавіатура, тому вибір — у повноекранному модальному вікні з пошуком
export function Combobox({ label, options, value, onChange, placeholder, error }: ComboboxProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = options.find((option) => option.id === value);

  const filtered = useMemo(() => {
    const needle = normalize(query.trim());
    return needle ? options.filter((option) => normalize(option.name).includes(needle)) : options;
  }, [options, query]);

  const openList = () => {
    setQuery("");
    setOpen(true);
  };

  const choose = (option: ComboboxOption) => {
    onChange(option.id);
    setOpen(false);
  };

  return (
    <Field label={label} error={error}>
      <Pressable
        accessibilityRole="combobox"
        accessibilityLabel={label}
        style={[fieldStyles.control, styles.trigger, error && fieldStyles.controlError]}
        onPress={openList}
      >
        <Text style={[styles.value, !selected && styles.placeholder]} numberOfLines={1}>
          {selected?.name ?? placeholder ?? t.combobox.placeholder}
        </Text>
        <Text style={styles.icon}>▾</Text>
      </Pressable>

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={styles.sheet} edges={["top", "bottom"]}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <Button title={t.common.cancel} variant="ghost" compact onPress={() => setOpen(false)} />
          </View>
          <TextInput
            autoFocus
            style={fieldStyles.control}
            value={query}
            onChangeText={setQuery}
            placeholder={t.combobox.placeholder}
            placeholderTextColor={colors.textMuted}
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={() => {
              if (filtered[0]) choose(filtered[0]);
            }}
          />
          <FlatList
            data={filtered}
            keyExtractor={(option) => option.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.list}
            ListEmptyComponent={<Text style={styles.empty}>{t.combobox.empty}</Text>}
            renderItem={({ item }) => {
              const isSelected = item.id === value;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  style={({ pressed }) => [styles.option, isSelected && styles.selected, pressed && styles.pressed]}
                  onPress={() => choose(item)}
                >
                  <Text style={styles.optionName}>{item.name}</Text>
                  {item.hint ? <Text style={styles.hint}>{item.hint}</Text> : null}
                </Pressable>
              );
            }}
          />
        </SafeAreaView>
      </Modal>
    </Field>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  value: {
    flex: 1,
    fontSize: 16,
    color: colors.ink,
  },
  placeholder: {
    color: colors.textMuted,
  },
  icon: {
    color: colors.textMuted,
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.paper,
    paddingHorizontal: 16,
    gap: 12,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.ink,
  },
  list: {
    gap: 6,
    paddingBottom: 24,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selected: {
    borderColor: colors.bench,
    backgroundColor: colors.benchSoft,
  },
  pressed: {
    opacity: 0.7,
  },
  optionName: {
    flex: 1,
    fontSize: 16,
    color: colors.ink,
  },
  hint: {
    fontSize: 14,
    color: colors.textMuted,
    fontVariant: ["tabular-nums"],
  },
  empty: {
    textAlign: "center",
    color: colors.textMuted,
    paddingVertical: 24,
  },
});
