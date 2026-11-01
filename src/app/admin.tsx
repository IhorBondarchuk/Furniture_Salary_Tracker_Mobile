import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProtectedScreen } from "@/components/auth/ProtectedScreen";
import { FormError, PageHeading } from "@/components/layout/PageHeading";
import { Screen } from "@/components/layout/Screen";
import { TopBar } from "@/components/layout/TopBar";
import { DateRangeCard } from "@/components/records/DateRangeCard";
import { listStyles, RecordRow } from "@/components/records/RecordRow";
import { Button } from "@/components/ui/Button";
import { Card, StatCard } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { createCatalogItem, deleteCatalogItem, getCatalog, updateCatalogItem } from "@/lib/api/catalog";
import { getRecords } from "@/lib/api/records";
import { useAuthStore } from "@/lib/store/auth";
import { useI18n } from "@/lib/store/locale";
import { colors } from "@/lib/theme";
import type { CatalogItem, WorkRecord } from "@/lib/types";
import { confirmAction, defaultMonthRange, formatDate, formatMoney, parsePrice } from "@/lib/utils";

export default function AdminScreen() {
  return (
    <ProtectedScreen role="admin">
      <AdminDashboard />
    </ProtectedScreen>
  );
}

function AdminDashboard() {
  const user = useAuthStore((state) => state.user);
  const { t, intlLocale } = useI18n();
  const queryClient = useQueryClient();
  const [range, setRange] = useState(defaultMonthRange);
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  const catalogQuery = useQuery<CatalogItem[]>({
    queryKey: ["catalog"],
    queryFn: getCatalog,
  });

  const recordsQuery = useQuery<WorkRecord[]>({
    queryKey: ["records", range.from, range.to],
    queryFn: () => getRecords({ from: range.from, to: range.to }),
    enabled: Boolean(user),
  });

  const createMutation = useMutation<CatalogItem, Error, { name: string; price: number }>({
    mutationFn: createCatalogItem,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
      setItemName("");
      setItemPrice("");
      setCreateError(null);
    },
    onError(error) {
      setCreateError(error.message);
    },
  });

  const updateMutation = useMutation<CatalogItem, Error, { id: string; name: string; price: number }>({
    mutationFn: ({ id, name, price }) => updateCatalogItem(id, { name, price }),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
      setEditingId(null);
      setEditError(null);
    },
    onError(error) {
      setEditError(error.message);
    },
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (id: string) => deleteCatalogItem(id),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
    },
  });

  const totalPayments = useMemo(
    () => recordsQuery.data?.reduce((sum, record) => sum + record.earned, 0) ?? 0,
    [recordsQuery.data],
  );

  const topItems = useMemo(() => {
    const breakdown = new Map<string, { quantity: number; earned: number }>();

    recordsQuery.data?.forEach((record) => {
      const existing = breakdown.get(record.itemName) ?? { quantity: 0, earned: 0 };
      existing.quantity += record.quantity;
      existing.earned += record.earned;
      breakdown.set(record.itemName, existing);
    });

    return Array.from(breakdown.entries())
      .map(([name, data]) => ({ itemName: name, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 3);
  }, [recordsQuery.data]);

  const handleCreate = () => {
    const price = parsePrice(itemPrice);
    if (!itemName.trim()) {
      setCreateError(t.admin.errors.nameRequired);
      return;
    }
    if (price === null || price <= 0) {
      setCreateError(t.admin.errors.priceInvalid);
      return;
    }
    setCreateError(null);
    createMutation.mutate({ name: itemName.trim(), price });
  };

  const startEdit = (item: CatalogItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPrice(String(item.price));
    setEditError(null);
  };

  const handleUpdate = () => {
    if (!editingId) return;
    const price = parsePrice(editPrice);
    if (!editName.trim()) {
      setEditError(t.admin.errors.nameRequired);
      return;
    }
    if (price === null || price <= 0) {
      setEditError(t.admin.errors.priceInvalid);
      return;
    }
    setEditError(null);
    updateMutation.mutate({ id: editingId, name: editName.trim(), price });
  };

  const handleDelete = (item: CatalogItem) => {
    confirmAction(t.admin.deleteConfirm(item.name), { confirm: t.common.delete, cancel: t.common.cancel }, () =>
      deleteMutation.mutate(item.id),
    );
  };

  return (
    <Screen
      header={<TopBar />}
      refreshing={catalogQuery.isRefetching || recordsQuery.isRefetching}
      onRefresh={() => queryClient.invalidateQueries()}
    >
      <PageHeading pretitle={t.admin.pretitle} title={t.admin.title} subtitle={t.admin.subtitle} />

      <View style={styles.stats}>
        <StatCard label={t.admin.totalPayments} value={formatMoney(totalPayments, intlLocale)} />
        <StatCard label={t.admin.topItem} value={topItems[0]?.itemName ?? t.common.none} />
      </View>

      <Card title={t.admin.catalogTitle} hint={t.admin.catalogHint}>
        <Input label={t.admin.name} value={itemName} onChangeText={setItemName} />
        <Input
          label={t.admin.basePrice}
          keyboardType="decimal-pad"
          placeholder="12,50"
          value={itemPrice}
          onChangeText={setItemPrice}
        />
        <FormError message={createError} />
        <Button
          title={createMutation.isPending ? t.common.saving : t.admin.addSubmit}
          disabled={createMutation.isPending}
          onPress={handleCreate}
        />

        <View style={listStyles.list}>
          <FormError message={deleteMutation.isError ? deleteMutation.error.message : null} />
          <FormError message={catalogQuery.isError ? catalogQuery.error.message : null} />
          {catalogQuery.isLoading ? (
            <Text style={listStyles.empty}>{t.admin.catalogLoading}</Text>
          ) : (
            catalogQuery.data?.map((item) =>
              editingId === item.id ? (
                <View key={item.id} style={styles.editRow}>
                  <Input label={t.admin.name} value={editName} onChangeText={setEditName} />
                  <Input label={t.admin.price} keyboardType="decimal-pad" value={editPrice} onChangeText={setEditPrice} />
                  <FormError message={editError} />
                  <View style={listStyles.actions}>
                    <Button compact variant="ghost" title={t.common.cancel} onPress={() => setEditingId(null)} />
                    <Button
                      compact
                      title={updateMutation.isPending ? t.common.saving : t.common.save}
                      disabled={updateMutation.isPending}
                      onPress={handleUpdate}
                    />
                  </View>
                </View>
              ) : (
                <View key={item.id} style={styles.catalogRow}>
                  <View style={styles.catalogInfo}>
                    <Text style={styles.catalogName}>{item.name}</Text>
                    <Text style={styles.catalogMeta}>{formatMoney(item.price, intlLocale)}</Text>
                  </View>
                  <View style={listStyles.actions}>
                    <Button compact variant="secondary" title={t.common.edit} onPress={() => startEdit(item)} />
                    <Button
                      compact
                      variant="ghost"
                      title={t.common.delete}
                      disabled={deleteMutation.isPending && deleteMutation.variables === item.id}
                      onPress={() => handleDelete(item)}
                    />
                  </View>
                </View>
              ),
            )
          )}
        </View>
      </Card>

      <DateRangeCard title={t.admin.filterTitle} hint={t.admin.filterHint} range={range} onChange={setRange} />

      <Card
        title={t.admin.recordsTitle}
        hint={t.admin.period(formatDate(range.from, intlLocale), formatDate(range.to, intlLocale))}
      >
        <View style={listStyles.list}>
          {recordsQuery.isLoading ? (
            <Text style={listStyles.empty}>{t.common.loading}</Text>
          ) : recordsQuery.isError ? (
            <FormError message={recordsQuery.error.message} />
          ) : recordsQuery.data?.length ? (
            recordsQuery.data.map((record) => <RecordRow key={record.id} record={record} showWorker />)
          ) : (
            <Text style={listStyles.empty}>{t.common.noRecords}</Text>
          )}
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: {
    flexDirection: "row",
    gap: 10,
  },
  catalogRow: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  catalogInfo: {
    gap: 2,
  },
  catalogName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.ink,
  },
  catalogMeta: {
    fontSize: 14,
    color: colors.textMuted,
    fontVariant: ["tabular-nums"],
  },
  editRow: {
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.bench,
    backgroundColor: colors.benchSoft,
  },
});
