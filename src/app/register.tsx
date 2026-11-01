import { useState } from "react";
import { router } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FormError } from "@/components/layout/PageHeading";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Segmented } from "@/components/ui/Segmented";
import { registerUser, translateAuthError } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/auth";
import { useI18n } from "@/lib/store/locale";
import type { Role } from "@/lib/types";

export default function RegisterScreen() {
  const { t } = useI18n();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("worker");
  const [adminCode, setAdminCode] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; adminCode?: string }>({});

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess(data) {
      setAuth(data);
      router.replace(data.user.role === "admin" ? "/admin" : "/worker");
    },
  });

  const handleSubmit = () => {
    const nextErrors: typeof errors = {};

    if (!name.trim()) nextErrors.name = t.auth.errors.nameRequired;
    else if (name.trim().length < 2) nextErrors.name = t.auth.errors.nameTooShort;
    if (!email.trim()) nextErrors.email = t.auth.errors.emailRequired;
    if (!password) nextErrors.password = t.auth.errors.passwordRequired;
    if (password && password.length < 6) nextErrors.password = t.auth.errors.passwordTooShort;
    if (role === "admin" && !adminCode.trim()) nextErrors.adminCode = t.auth.errors.adminCodeRequired;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    mutation.mutate({ name: name.trim(), email: email.trim(), password, role, adminCode: adminCode.trim() });
  };

  return (
    <AuthLayout
      title={t.register.title}
      subtitle={t.register.subtitle}
      footerText={t.register.haveAccount}
      footerLink={t.register.loginLink}
      footerHref="/login"
    >
      <Input label={t.auth.name} autoComplete="name" textContentType="name" value={name} onChangeText={setName} error={errors.name} />
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
        autoComplete="new-password"
        textContentType="newPassword"
        value={password}
        onChangeText={setPassword}
        error={errors.password}
      />
      <Segmented
        label={t.register.role}
        value={role}
        onChange={setRole}
        options={[
          { value: "worker", label: t.roles.worker },
          { value: "admin", label: t.roles.admin },
        ]}
      />
      {role === "admin" ? (
        <Input
          label={t.auth.adminCode}
          secureTextEntry
          autoComplete="off"
          value={adminCode}
          onChangeText={setAdminCode}
          error={errors.adminCode}
        />
      ) : null}
      <FormError message={mutation.isError ? translateAuthError(t, mutation.error.message) : null} />
      <Button
        title={mutation.isPending ? t.register.creating : t.register.submit}
        disabled={mutation.isPending}
        onPress={handleSubmit}
      />
    </AuthLayout>
  );
}
