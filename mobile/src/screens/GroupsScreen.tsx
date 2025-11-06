import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useGroups } from "../hooks/useGroups";
import { useAuth } from "../context/AuthContext";
import { ApiGroupResponse } from "../types/api";

type GroupsScreenProps = {
  onSelectGroup?: (group: ApiGroupResponse) => void;
};

export const GroupsScreen: React.FC<GroupsScreenProps> = ({ onSelectGroup }) => {
  const { accessToken, logout } = useAuth();
  const { data, loading, error, refresh } = useGroups();

  const handleSelect = useCallback(
    (group: ApiGroupResponse) => {
      if (onSelectGroup) {
        onSelectGroup(group);
      }
    },
    [onSelectGroup],
  );

  if (!accessToken) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.centeredText}>No auth token available. Please login first.</Text>
      </SafeAreaView>
    );
  }

  if (loading && (!data || data.length === 0)) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#38bdf8" />
        <Text style={styles.loadingText}>Loading trips...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Your trips</Text>
        <Button title="Sign out" onPress={logout} color="#ef4444" />
      </View>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor="#38bdf8" />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handleSelect(item)}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>{item.destination}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardFooterText}>
                {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
              </Text>
              <Text style={styles.cardFooterText}>{item.members.length} members</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No groups synced yet.</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default GroupsScreen;

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
    color: "#e2e8f0",
    fontSize: 16,
    textAlign: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 13,
    color: "#cbd5f5",
  },
  errorContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  errorText: {
    backgroundColor: "rgba(248,113,113,0.1)",
    color: "#fca5a5",
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
    color: "#f8fafc",
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    backgroundColor: "#1f2937",
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f8fafc",
  },
  cardSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#cbd5f5",
  },
  cardFooter: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardFooterText: {
    fontSize: 11,
    color: "#94a3b8",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 13,
    color: "#94a3b8",
  },
});
