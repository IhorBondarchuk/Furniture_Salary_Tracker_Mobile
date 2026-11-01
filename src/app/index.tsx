import { Redirect, router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { Screen } from "@/components/layout/Screen";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/lib/store/auth";
import { useI18n } from "@/lib/store/locale";
import { colors, radius } from "@/lib/theme";

export default function Home() {
  const { t } = useI18n();
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.initialized);

  // Залогінений користувач одразу потрапляє у свою панель
  if (!initialized) return <LoadingScreen />;
  if (user) return <Redirect href={user.role === "admin" ? "/admin" : "/worker"} />;

  return (
    <Screen centered>
      <View style={styles.lang}>
        <LanguageSwitcher />
      </View>
      <View style={styles.panel}>
        <Text style={styles.badge}>{t.home.badge}</Text>
        <Text style={styles.title}>{t.home.title}</Text>
        <Text style={styles.description}>{t.home.description}</Text>
        <View style={styles.actions}>
          <Button title={t.common.login} onPress={() => router.push("/login")} />
          <Button title={t.common.register} variant="secondary" onPress={() => router.push("/register")} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  lang: {
    alignItems: "flex-end",
  },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    gap: 16,
  },
  badge: {
    alignSelf: "flex-start",
    fontSize: 12,
    fontWeight: "700",
    color: colors.bench,
    backgroundColor: colors.benchSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    overflow: "hidden",
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: colors.ink,
  },
  description: {
    fontSize: 16,
    lineHeight: 23,
    color: colors.textMuted,
  },
  actions: {
    gap: 10,
    marginTop: 4,
  },
});
