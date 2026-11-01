import { useState } from "react";
import { router } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FormError } from "@/components/layout/PageHeading";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Segmented } from "@/components/ui/Segmented";
import { loginUser, translateAuthError } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/auth";
import { useI18n } from "@/lib/store/locale";
import type { Role } from "@/lib/types";

export default function LoginScreen() {
  const { t } = useI18n();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("worker");
  const [adminCode, setAdminCode] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; adminCode?: string }>({});

  // Відповідність ролі та код адміністратора перевіряє бекенд
  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess(data) {
      setAuth(data);
      router.replace(data.user.role === "admin" ? "/admin" : "/worker");
    },
  });

  const handleSubmit = () => {
    const nextErrors: typeof errors = {};

    if (!email.trim()) nextErrors.email = t.auth.errors.emailRequired;
    if (!password) nextErrors.password = t.auth.errors.passwordRequired;
    if (password && password.length < 6) nextErrors.password = t.auth.errors.passwordTooShort;
    if (role === "admin" && !adminCode.trim()) nextErrors.adminCode = t.auth.errors.adminCodeRequired;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    mutation.mutate({ email: email.trim(), password, role, adminCode: adminCode.trim() });
  };

  return (
    <AuthLayout
      title={t.login.title}
      subtitle={role === "admin" ? t.login.adminSubtitle : t.login.workerSubtitle}
      footerText={t.login.noAccount}
      footerLink={t.login.registerLink}
      footerHref="/register"
    >
      <Segmented
        label={t.login.loginAs}
        value={role}
        onChange={setRole}
        options={[
          { value: "worker", label: t.roles.worker },
          { value: "admin", label: t.roles.admin },
        ]}
      />
      <Input
        label={t.auth.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
      />
      <Input
        label={t.auth.password}
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        returnKeyType="go"
        onSubmitEditing={role === "admin" ? undefined : handleSubmit}
      />
      {role === "admin" ? (
        <Input
          label={t.auth.adminCode}
          secureTextEntry
          autoComplete="off"
          value={adminCode}
          onChangeText={setAdminCode}
          error={errors.adminCode}
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
        />
      ) : null}
      <FormError message={mutation.isError ? translateAuthError(t, mutation.error.message) : null} />
      <Button
        title={mutation.isPending ? t.common.loading : t.common.login}
        disabled={mutation.isPending}
        onPress={handleSubmit}
      />
    </AuthLayout>
  );
}
