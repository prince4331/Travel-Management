import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { offlineDB, STORES } from '../lib/offlineDB';
import { meshNetwork } from '../lib/meshNetwork';
import { CreateExpensePayload } from './useGroupsApi';

export function useCreateExpenseOffline(groupId: string) {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateExpensePayload) => {
      const isOnline = navigator.onLine;

      // Create expense object
      const expense = {
        id: `temp-${Date.now()}`,
        groupId: Number(groupId),
        title: payload.title,
        description: payload.description,
        category: payload.category,
        currency: payload.currency,
        amount: payload.amount,
        splits: payload.splits,
        paidById: payload.paidById,
        incurredOn: payload.incurredOn,
        createdAt: new Date().toISOString(),
      };

      // Save to IndexedDB immediately (works offline)
      await offlineDB.put(STORES.expenses, expense);
      console.log('[OfflineExpense] Saved to IndexedDB:', expense);

      if (isOnline && accessToken) {
        // Online: Try to sync to server immediately
        try {
          const response: any = await apiFetch(`/groups/${groupId}/expenses`, {
            method: 'POST',
            accessToken,
            body: JSON.stringify(payload),
          });
          
          // Update IndexedDB with real ID from server
          await offlineDB.delete(STORES.expenses, expense.id);
          await offlineDB.put(STORES.expenses, { ...expense, id: response.id });
          
          console.log('[OfflineExpense] Synced to server:', response);
          return response;
        } catch (error) {
          console.error('[OfflineExpense] Sync failed, queuing for later:', error);
          // Add to sync queue for later
          await offlineDB.addToSyncQueue({
            type: 'CREATE_EXPENSE',
            method: 'POST',
            url: `/groups/${groupId}/expenses`,
            body: payload,
            groupId: Number(groupId),
          });
        }
      } else {
        // Offline: Add to sync queue
        console.log('[OfflineExpense] Offline - queuing for sync');
        await offlineDB.addToSyncQueue({
          type: 'CREATE_EXPENSE',
          method: 'POST',
          url: `/groups/${groupId}/expenses`,
          body: payload,
          groupId: Number(groupId),
        });
      }

      // MESH NETWORK: Broadcast to connected peers
      try {
        meshNetwork.broadcast({
          type: 'expense',
          data: {
            action: 'create',
            groupId,
            expense,
          },
        });
        console.log('[OfflineExpense] Broadcasted to mesh network');
      } catch (error) {
        console.error('[OfflineExpense] Mesh broadcast failed:', error);
      }

      return expense;
    },
    onSuccess: () => {
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['expenses', groupId] });
      queryClient.invalidateQueries({ queryKey: ['balance', groupId] });
    },
  });
}

export function useUpdateExpenseOffline(groupId: string, expenseId: number) {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<CreateExpensePayload>) => {
      const isOnline = navigator.onLine;

      // Update in IndexedDB
      const existing: any = await offlineDB.get(STORES.expenses, expenseId);
      if (existing) {
        const updated = { ...existing, ...payload };
        await offlineDB.put(STORES.expenses, updated);
      }

      if (isOnline && accessToken) {
        try {
          const response = await apiFetch(`/groups/${groupId}/expenses/${expenseId}`, {
            method: 'PATCH',
            accessToken,
            body: JSON.stringify(payload),
          });
          return response;
        } catch (error) {
          await offlineDB.addToSyncQueue({
            type: 'UPDATE_EXPENSE',
            method: 'PATCH',
            url: `/groups/${groupId}/expenses/${expenseId}`,
            body: payload,
            groupId: Number(groupId),
          });
        }
      } else {
        await offlineDB.addToSyncQueue({
          type: 'UPDATE_EXPENSE',
          method: 'PATCH',
          url: `/groups/${groupId}/expenses/${expenseId}`,
          body: payload,
          groupId: Number(groupId),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['expenses', groupId] });
    },
  });
}

export function useDeleteExpenseOffline(groupId: string, expenseId: number) {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const isOnline = navigator.onLine;

      // Mark as deleted in IndexedDB (soft delete)
      const existing: any = await offlineDB.get(STORES.expenses, expenseId);
      if (existing) {
        await offlineDB.put(STORES.expenses, { ...existing, _deleted: true });
      }

      if (isOnline && accessToken) {
        try {
          await apiFetch(`/groups/${groupId}/expenses/${expenseId}`, {
            method: 'DELETE',
            accessToken,
          });
          // Hard delete from IndexedDB on success
          await offlineDB.delete(STORES.expenses, expenseId);
        } catch (error) {
          await offlineDB.addToSyncQueue({
            type: 'DELETE_EXPENSE',
            method: 'DELETE',
            url: `/groups/${groupId}/expenses/${expenseId}`,
            groupId: Number(groupId),
          });
        }
      } else {
        await offlineDB.addToSyncQueue({
          type: 'DELETE_EXPENSE',
          method: 'DELETE',
          url: `/groups/${groupId}/expenses/${expenseId}`,
          groupId: Number(groupId),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['expenses', groupId] });
    },
  });
}
