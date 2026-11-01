import type { ReactNode } from "react";
import { Redirect } from "expo-router";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { useAuthStore } from "@/lib/store/auth";
import { useI18n } from "@/lib/store/locale";
import type { Role } from "@/lib/types";

interface ProtectedScreenProps {
  children: ReactNode;
  role?: Role;
}

export function ProtectedScreen({ children, role }: ProtectedScreenProps) {
  const { t } = useI18n();
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.initialized);

  if (!initialized) return <LoadingScreen message={t.common.checkingAccess} />;
  if (!user) return <Redirect href="/login" />;
  if (role && user.role !== role) return <Redirect href={user.role === "admin" ? "/admin" : "/worker"} />;

  return <>{children}</>;
}
