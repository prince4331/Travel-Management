import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useGroupBalance, useGroupExpenses } from "../hooks/useGroups";
import { GroupsApi, CreateExpensePayload } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { ApiGroupResponse, ApiExpense } from "../types/api";

type GroupExpensesScreenProps = {
  group: ApiGroupResponse;
};

export const GroupExpensesScreen: React.FC<GroupExpensesScreenProps> = ({ group }) => {
  const { accessToken, refreshTokens, logout } = useAuth();
  const [saving, setSaving] = useState(false);
  const { data: expenses = [], loading, error, refresh } = useGroupExpenses(group.id);
  const {
    data: balance,
    refresh: refreshBalance,
    loading: balanceLoading,
  } = useGroupBalance(group.id);

  const handleRefresh = useCallback(() => {
    refresh();
    refreshBalance();
  }, [refresh, refreshBalance]);

  const ensureToken = useCallback(async () => {
    if (accessToken) return accessToken;
    const refreshed = await refreshTokens();
    if (!refreshed) {
      logout();
      throw new Error("Authentication required");
    }
    return refreshed;
  }, [accessToken, refreshTokens, logout]);

  const handleQuickExpense = useCallback(async () => {
    setSaving(true);
    try {
      const token = await ensureToken();
      const payload: CreateExpensePayload = {
        title: "Field refreshment",
        amount: 25,
        currency: "USD",
        category: "food",
        paidById: group.members[0]?.user.id ?? 0,
        incurredOn: new Date().toISOString(),
        splits: group.members.map((member) => ({
          memberId: member.user.id,
          amount: Number((25 / Math.max(group.members.length, 1)).toFixed(2)),
        })),
      };
      await GroupsApi.createExpense(group.id, payload, token);
      await handleRefresh();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("Failed to create expense", err);
    } finally {
      setSaving(false);
    }
  }, [group.members, group.id, ensureToken, handleRefresh]);

  const balanceMembers = useMemo(() => balance?.members ?? [], [balance]);

  if (!accessToken) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.centeredText}>No auth token available. Please login first.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={loading || balanceLoading} onRefresh={handleRefresh} tintColor="#38bdf8" />}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{group.title}</Text>
          <Text style={styles.headerSubtitle}>{group.destination}</Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.section}>
          <TouchableOpacity disabled={saving} onPress={handleQuickExpense} style={styles.quickButton}>
            <Text style={styles.quickButtonText}>{saving ? "Saving..." : "Log quick $25 team expense"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expense ledger</Text>
        </View>
        {loading && expenses.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#38bdf8" />
            <Text style={styles.loadingCaption}>Loading expenses...</Text>
          </View>
        ) : (
          <FlatList
            data={expenses}
            scrollEnabled={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <ExpenseListItem expense={item} />}
          />
        )}

        <View style={styles.balanceContainer}>
          <Text style={styles.sectionTitle}>Outstanding balances</Text>
          {balanceLoading && !balance && <ActivityIndicator size="small" color="#38bdf8" />}
          {!balanceLoading && balanceMembers.length === 0 && (
            <Text style={styles.balanceEmpty}>No balance information yet.</Text>
          )}
          {balanceMembers.map((member) => (
            <View key={member.memberId} style={styles.balanceRow}>
              <Text style={styles.balanceName}>
                {group.members.find((m) => m.user.id === member.memberId)?.displayName ?? member.memberId}
              </Text>
              <Text style={member.balance >= 0 ? styles.balancePositive : styles.balanceNegative}>
                {member.balance >= 0 ? "+" : "-"}${Math.abs(member.balance).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const ExpenseListItem: React.FC<{ expense: ApiExpense }> = ({ expense }) => (
  <View style={styles.expenseCard}>
    <Text style={styles.expenseTitle}>{expense.title}</Text>
    {expense.description ? <Text style={styles.expenseDescription}>{expense.description}</Text> : null}
    <View style={styles.expenseFooter}>
      <Text style={styles.expenseMeta}>{expense.category}</Text>
      <Text style={styles.expenseMeta}>
        {expense.amount.toFixed(2)} {expense.currency}
      </Text>
    </View>
    <Text style={styles.expenseMeta}>
      Paid by {expense.paidBy.email} on {new Date(expense.incurredOn).toLocaleDateString()}
    </Text>
  </View>
);

export default GroupExpensesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  centered: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  centeredText: {
    color: "#f8fafc",
    fontSize: 16,
    textAlign: "center",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#f9fafb",
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#cbd5f5",
  },
  errorContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  errorText: {
    fontSize: 12,
    color: "#fca5a5",
    backgroundColor: "rgba(248,113,113,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#e2e8f0",
  },
  quickButton: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: "#0ea5e9",
    paddingVertical: 12,
  },
  quickButtonText: {
    textAlign: "center",
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "500",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingCaption: {
    marginTop: 12,
    fontSize: 12,
    color: "#94a3b8",
  },
  balanceContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  balanceEmpty: {
    fontSize: 12,
    color: "#94a3b8",
  },
  balanceRow: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  balanceName: {
    fontSize: 14,
    color: "#e2e8f0",
  },
  balancePositive: {
    fontSize: 14,
    color: "#34d399",
  },
  balanceNegative: {
    fontSize: 14,
    color: "#f87171",
  },
  expenseCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    backgroundColor: "#111827",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  expenseTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#f8fafc",
  },
  expenseDescription: {
    marginTop: 4,
    fontSize: 12,
    color: "#94a3b8",
  },
  expenseFooter: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  expenseMeta: {
    fontSize: 11,
    color: "#94a3b8",
  },
});
