import type { ReactNode } from "react";
import { Link, type Href } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { Screen } from "@/components/layout/Screen";
import { colors, radius } from "@/lib/theme";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  footerText: string;
  footerLink: string;
  footerHref: Href;
  children: ReactNode;
}

// Спільна картка для входу та реєстрації
export function AuthLayout({ title, subtitle, footerText, footerLink, footerHref, children }: AuthLayoutProps) {
  return (
    <Screen centered>
      <View style={styles.card}>
        <View style={styles.lang}>
          <LanguageSwitcher />
        </View>
        <View style={styles.head}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={styles.form}>{children}</View>
        <Text style={styles.footer}>
          {footerText}{" "}
          <Link href={footerHref} replace style={styles.link}>
            {footerLink}
          </Link>
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
    gap: 18,
  },
  lang: {
    alignItems: "flex-end",
  },
  head: {
    gap: 6,
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
  form: {
    gap: 14,
  },
  footer: {
    textAlign: "center",
    fontSize: 15,
    color: colors.textMuted,
  },
  link: {
    color: colors.bench,
    fontWeight: "700",
  },
});
