import React, { useMemo, useState } from "react";
import { ActivityIndicator, Button, SafeAreaView, StyleSheet, View } from "react-native";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import GroupsScreen from "./src/screens/GroupsScreen";
import GroupExpensesScreen from "./src/screens/GroupExpensesScreen";
import DocumentUploadScreen from "./src/screens/DocumentUploadScreen";
import LoginScreen from "./src/screens/LoginScreen";
import { ApiGroupResponse } from "./src/types/api";

const AuthenticatedNavigator: React.FC = () => {
  const { loading, accessToken } = useAuth();
  const [selectedGroup, setSelectedGroup] = useState<ApiGroupResponse | null>(null);
  const [activeView, setActiveView] = useState<"expenses" | "documents">("expenses");

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </SafeAreaView>
    );
  }

  if (!accessToken) {
    return <LoginScreen />;
  }

  if (!selectedGroup) {
    return (
      <GroupsScreen
        onSelectGroup={(group) => {
          setSelectedGroup(group);
          setActiveView("expenses");
        }}
      />
    );
  }

  const screen = useMemo(() => {
    if (activeView === "documents") {
      return <DocumentUploadScreen group={selectedGroup} />;
    }
    return <GroupExpensesScreen group={selectedGroup} />;
  }, [activeView, selectedGroup]);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.tabRow}>
        <Button title="Expenses" onPress={() => setActiveView("expenses")} color={activeView === "expenses" ? "#0ea5e9" : "#1e293b"} />
        <Button
          title="Documents"
          onPress={() => setActiveView("documents")}
          color={activeView === "documents" ? "#0ea5e9" : "#1e293b"}
        />
      </View>
      {screen}
      <View style={styles.backButton}>
        <Button
          title="Back to groups"
          onPress={() => {
            setSelectedGroup(null);
            setActiveView("expenses");
          }}
        />
      </View>
    </View>
  );
};

const Root: React.FC = () => (
  <AuthProvider>
    <AuthenticatedNavigator />
  </AuthProvider>
);

export default Root;

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#111827",
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});

