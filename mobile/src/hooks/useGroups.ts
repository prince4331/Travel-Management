import { useCallback, useEffect, useMemo, useState } from "react";
import { GroupsApi } from "../api/client";
import { ApiGroupResponse, ApiExpense, ApiBalanceResponse } from "../types/api";
import { useAuth } from "../context/AuthContext";

type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

function useAsyncState<T>(initial: T | null = null): [AsyncState<T>, (updater: (prev: AsyncState<T>) => AsyncState<T>) => void] {
  const [state, setState] = useState<AsyncState<T>>({
    data: initial,
    loading: false,
    error: null,
  });

  const update = useCallback((updater: (prev: AsyncState<T>) => AsyncState<T>) => {
    setState((prev) => updater(prev));
  }, []);

  return [state, update];
}

export const useGroups = () => {
  const { accessToken, refreshTokens, logout } = useAuth();
  const [state, update] = useAsyncState<ApiGroupResponse[]>([]);

  const refresh = useCallback(async () => {
    if (!accessToken) {
      update(() => ({ data: null, loading: false, error: "Missing auth token" }));
      return;
    }
    update((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const groups = await GroupsApi.list(accessToken);
      update(() => ({ data: groups, loading: false, error: null }));
    } catch (error: any) {
      if (error?.status === 401) {
        const newToken = await refreshTokens();
        if (newToken) {
          try {
            const groups = await GroupsApi.list(newToken);
            update(() => ({ data: groups, loading: false, error: null }));
            return;
          } catch (refreshError: any) {
            update((prev) => ({ ...prev, loading: false, error: refreshError.message ?? "Failed to load groups" }));
            return;
          }
        }
        logout();
      }
      update((prev) => ({ ...prev, loading: false, error: error?.message ?? "Failed to load groups" }));
    }
  }, [accessToken, refreshTokens, logout, update]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return useMemo(
    () => ({
      ...state,
      refresh,
    }),
    [state, refresh],
  );
};

export const useGroupExpenses = (groupId: number | null) => {
  const { accessToken, refreshTokens, logout } = useAuth();
  const [state, update] = useAsyncState<ApiExpense[]>([]);

  const refresh = useCallback(async () => {
    if (!accessToken || !groupId) {
      update(() => ({ data: null, loading: false, error: groupId ? "Missing auth token" : null }));
      return;
    }
    update((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const expenses = await GroupsApi.expenses(groupId, accessToken);
      update(() => ({ data: expenses, loading: false, error: null }));
    } catch (error: any) {
      if (error?.status === 401) {
        const newToken = await refreshTokens();
        if (newToken) {
          try {
            const expenses = await GroupsApi.expenses(groupId, newToken);
            update(() => ({ data: expenses, loading: false, error: null }));
            return;
          } catch (refreshError: any) {
            update((prev) => ({ ...prev, loading: false, error: refreshError.message ?? "Failed to load expenses" }));
            return;
          }
        }
        logout();
      }
      update((prev) => ({ ...prev, loading: false, error: error?.message ?? "Failed to load expenses" }));
    }
  }, [groupId, accessToken, refreshTokens, logout, update]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return useMemo(
    () => ({
      ...state,
      refresh,
    }),
    [state, refresh],
  );
};

export const useGroupBalance = (groupId: number | null) => {
  const { accessToken, refreshTokens, logout } = useAuth();
  const [state, update] = useAsyncState<ApiBalanceResponse | null>(null);

  const refresh = useCallback(async () => {
    if (!accessToken || !groupId) {
      update(() => ({ data: null, loading: false, error: groupId ? "Missing auth token" : null }));
      return;
    }
    update((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const balance = await GroupsApi.balance(groupId, accessToken);
      update(() => ({ data: balance, loading: false, error: null }));
    } catch (error: any) {
      if (error?.status === 401) {
        const newToken = await refreshTokens();
        if (newToken) {
          try {
            const balance = await GroupsApi.balance(groupId, newToken);
            update(() => ({ data: balance, loading: false, error: null }));
            return;
          } catch (refreshError: any) {
            update((prev) => ({ ...prev, loading: false, error: refreshError.message ?? "Failed to load balance" }));
            return;
          }
        }
        logout();
      }
      update((prev) => ({ ...prev, loading: false, error: error?.message ?? "Failed to load balance" }));
    }
  }, [groupId, accessToken, refreshTokens, logout, update]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return useMemo(
    () => ({
      ...state,
      refresh,
    }),
    [state, refresh],
  );
};
