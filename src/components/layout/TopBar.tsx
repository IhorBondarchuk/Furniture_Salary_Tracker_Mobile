import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { logoutUser } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/auth";
import { useI18n } from "@/lib/store/locale";
import { colors } from "@/lib/theme";

export function TopBar() {
  const { t } = useI18n();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // сесію все одно скидаємо локально
    } finally {
      clearAuth();
      router.replace("/login");
    }
  };

  return (
    <View style={styles.bar}>
      <View style={styles.row}>
        <Text style={styles.brand}>{t.common.brand}</Text>
        <LanguageSwitcher />
      </View>
      {user ? (
        <View style={styles.row}>
          <View style={styles.user}>
            <Text style={styles.role}>{t.roles[user.role]}</Text>
            <Text style={styles.name} numberOfLines={1}>
              {user.name}
            </Text>
          </View>
          <Pressable accessibilityRole="button" onPress={handleLogout} hitSlop={8} style={styles.logout}>
            <Text style={styles.logoutText}>{t.common.logout}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.paper,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  brand: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.ink,
  },
  user: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },
  role: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    color: colors.bench,
    backgroundColor: colors.benchSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: "hidden",
  },
  name: {
    flexShrink: 1,
    fontSize: 15,
    color: colors.ink,
  },
  logout: {
    paddingVertical: 4,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.bench,
  },
});
