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
import { Combobox } from "@/components/ui/Combobox";
import { DateField } from "@/components/ui/DateField";
import { Input } from "@/components/ui/Input";
import { getCatalog } from "@/lib/api/catalog";
import { createRecord, deleteRecord, getRecords, getSalarySummary, updateRecord } from "@/lib/api/records";
import { useAuthStore } from "@/lib/store/auth";
import { useI18n } from "@/lib/store/locale";
import { colors } from "@/lib/theme";
import type { CatalogItem, RecordPayload, SalarySummary, WorkRecord } from "@/lib/types";
import { confirmAction, defaultMonthRange, formatDate, formatMoney } from "@/lib/utils";

export default function WorkerScreen() {
  return (
    <ProtectedScreen role="worker">
      <WorkerDashboard />
    </ProtectedScreen>
  );
}

function WorkerDashboard() {
  const user = useAuthStore((state) => state.user);
  const { t, intlLocale } = useI18n();
  const queryClient = useQueryClient();
  const [range, setRange] = useState(defaultMonthRange);
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [date, setDate] = useState(range.to);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItemId, setEditItemId] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editDate, setEditDate] = useState("");
  const [tableError, setTableError] = useState<string | null>(null);
  // дії над записами приховані, доки користувач явно не ввімкне режим редагування
  const [isEditMode, setIsEditMode] = useState(false);

  const catalogQuery = useQuery<CatalogItem[]>({
    queryKey: ["catalog"],
    queryFn: getCatalog,
  });

  const recordsQuery = useQuery<WorkRecord[]>({
    queryKey: ["records", user?.id, range.from, range.to],
    queryFn: () => getRecords({ workerId: user?.id, from: range.from, to: range.to }),
    enabled: Boolean(user),
  });

  const summaryQuery = useQuery<SalarySummary>({
    queryKey: ["summary", user?.id, range.from, range.to],
    queryFn: () => getSalarySummary({ workerId: user?.id, from: range.from, to: range.to }),
    enabled: Boolean(user),
  });

  const refreshRecords = () => {
    queryClient.invalidateQueries({ queryKey: ["records"] });
    queryClient.invalidateQueries({ queryKey: ["summary"] });
  };

  const createMutation = useMutation<WorkRecord, Error, RecordPayload>({
    mutationFn: createRecord,
    onSuccess() {
      refreshRecords();
      setFormError(null);
      // дату залишаємо — зазвичай додають кілька записів за один день
      setItemId("");
      setQuantity("");
    },
    onError(error) {
      setFormError(error.message);
    },
  });

  const updateMutation = useMutation<WorkRecord, Error, { id: string; furniture: string; quantity: number; date: string }>({
    mutationFn: ({ id, ...payload }) => updateRecord(id, payload),
    onSuccess() {
      refreshRecords();
      setEditingId(null);
      setTableError(null);
    },
    onError(error) {
      setTableError(error.message);
    },
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: deleteRecord,
    onSuccess() {
      refreshRecords();
      setTableError(null);
    },
    onError(error) {
      setTableError(error.message);
    },
  });

  const catalogItems = useMemo(() => catalogQuery.data ?? [], [catalogQuery.data]);
  const selectedItem = useMemo(() => catalogItems.find((item) => item.id === itemId), [catalogItems, itemId]);
  const catalogOptions = useMemo(
    () => catalogItems.map((item) => ({ id: item.id, name: item.name, hint: formatMoney(item.price, intlLocale) })),
    [catalogItems, intlLocale],
  );

  const handleSubmit = () => {
    if (!selectedItem) {
      setFormError(t.worker.errors.itemRequired);
      return;
    }
    const count = Number(quantity);
    if (!Number.isInteger(count) || count < 1) {
      setFormError(t.worker.errors.quantityInvalid);
      return;
    }
    setFormError(null);
    createMutation.mutate({ furniture: selectedItem.id, quantity: count, date });
  };

  const startEdit = (record: WorkRecord) => {
    setEditingId(record.id);
    setEditItemId(record.itemId);
    setEditQuantity(String(record.quantity));
    // дати записів зберігаються як UTC-північ, тому беремо частину YYYY-MM-DD
    setEditDate(record.date.slice(0, 10));
    setTableError(null);
  };

  const handleUpdate = () => {
    if (!editingId) return;
    const count = Number(editQuantity);
    if (!editItemId) {
      setTableError(t.worker.errors.itemRequired);
      return;
    }
    if (!Number.isInteger(count) || count < 1) {
      setTableError(t.worker.errors.quantityInvalid);
      return;
    }
    if (!editDate) {
      setTableError(t.worker.errors.dateRequired);
      return;
    }
    updateMutation.mutate({ id: editingId, furniture: editItemId, quantity: count, date: editDate });
  };

  const handleDelete = (record: WorkRecord) => {
    confirmAction(
      t.worker.deleteConfirm(record.itemName, record.quantity, formatDate(record.date, intlLocale)),
      { confirm: t.common.delete, cancel: t.common.cancel },
      () => deleteMutation.mutate(record.id),
    );
  };

  const toggleEditMode = () => {
    setIsEditMode((prev) => !prev);
    setEditingId(null);
    setTableError(null);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries();
  };

  return (
    <Screen
      header={<TopBar />}
      refreshing={recordsQuery.isRefetching || summaryQuery.isRefetching}
      onRefresh={handleRefresh}
    >
      <PageHeading pretitle={t.worker.pretitle} title={t.worker.title} subtitle={t.worker.subtitle} />

      <View style={styles.stats}>
        <StatCard label={t.worker.earned} value={formatMoney(summaryQuery.data?.totalEarned ?? 0, intlLocale)} />
        <StatCard label={t.worker.recordsCount} value={recordsQuery.data?.length ?? 0} />
      </View>

      <Card title={t.worker.addTitle} hint={t.worker.addHint}>
        <Combobox label={t.common.item} options={catalogOptions} value={selectedItem?.id ?? ""} onChange={setItemId} />
        <View style={styles.pair}>
          <Input
            containerStyle={styles.cell}
            label={t.common.quantity}
            keyboardType="number-pad"
            placeholder="1"
            value={quantity}
            onChangeText={setQuantity}
          />
          <DateField style={styles.cell} label={t.common.date} value={date} onChange={setDate} />
        </View>
        <FormError message={formError} />
        <Button
          title={createMutation.isPending ? t.common.saving : t.worker.addSubmit}
          disabled={createMutation.isPending || !catalogItems.length}
          onPress={handleSubmit}
        />
      </Card>

      <DateRangeCard title={t.worker.filterTitle} hint={t.worker.filterHint} range={range} onChange={setRange} />

      <Card>
        <View style={styles.historyHead}>
          <View style={styles.historyTitle}>
            <Text style={styles.title}>{t.worker.historyTitle}</Text>
            <Text style={styles.hint}>
              {t.worker.period(formatDate(range.from, intlLocale), formatDate(range.to, intlLocale))}
            </Text>
          </View>
          <Button
            compact
            title={isEditMode ? t.common.done : t.common.edit}
            variant={isEditMode ? "primary" : "secondary"}
            onPress={toggleEditMode}
          />
        </View>
        <FormError message={tableError} />
        <View style={listStyles.list}>
          {recordsQuery.isLoading ? (
            <Text style={listStyles.empty}>{t.common.loading}</Text>
          ) : recordsQuery.isError ? (
            <FormError message={recordsQuery.error.message} />
          ) : recordsQuery.data?.length ? (
            recordsQuery.data.map((record) =>
              editingId === record.id ? (
                <View key={record.id} style={styles.editRow}>
                  <Combobox label={t.common.item} options={catalogOptions} value={editItemId} onChange={setEditItemId} />
                  <View style={styles.pair}>
                    <Input
                      containerStyle={styles.cell}
                      label={t.common.quantity}
                      keyboardType="number-pad"
                      value={editQuantity}
                      onChangeText={setEditQuantity}
                    />
                    <DateField style={styles.cell} label={t.common.date} value={editDate} onChange={setEditDate} />
                  </View>
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
                <RecordRow
                  key={record.id}
                  record={record}
                  actions={
                    isEditMode ? (
                      <View style={listStyles.actions}>
                        <Button compact variant="secondary" title={t.common.edit} onPress={() => startEdit(record)} />
                        <Button
                          compact
                          variant="ghost"
                          title={t.common.delete}
                          disabled={deleteMutation.isPending && deleteMutation.variables === record.id}
                          onPress={() => handleDelete(record)}
                        />
                      </View>
                    ) : null
                  }
                />
              ),
            )
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
  pair: {
    flexDirection: "row",
    gap: 10,
  },
  cell: {
    flex: 1,
  },
  historyHead: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  historyTitle: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.ink,
  },
  hint: {
    fontSize: 13,
    color: colors.textMuted,
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
