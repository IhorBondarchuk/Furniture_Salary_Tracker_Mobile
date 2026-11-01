import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors } from "@/lib/theme";

export function LoadingScreen({ message }: { message?: string }) {
  return (
    <View style={styles.screen}>
      <ActivityIndicator size="large" color={colors.bench} />
      {message ? <Text style={styles.text}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: colors.paper,
  },
  text: {
    color: colors.textMuted,
    fontSize: 15,
  },
});
