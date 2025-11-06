import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";
import { useAppStore } from "../store/useAppStore";
import { offlineDB, STORES } from "../lib/offlineDB";

export function useOfflineSync() {
  const { accessToken } = useAuth();
  const { syncQueue, markJobSynced, markJobFailed } = useAppStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof window === "undefined" ? true : navigator.onLine
  );

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log('[OfflineSync] Back online! Starting sync...');
      setIsOnline(true);
    };
    
    const handleOffline = () => {
      console.log('[OfflineSync] Gone offline');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen for service worker sync messages
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'BACKGROUND_SYNC') {
          console.log('[OfflineSync] Background sync triggered');
          // Trigger sync
          if (isOnline && accessToken) {
            syncPendingData();
          }
        }
      };

      navigator.serviceWorker.addEventListener('message', handleMessage);
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }
  }, [isOnline, accessToken]);

  // Sync pending data from IndexedDB and app store
  const syncPendingData = async () => {
    if (isSyncing || !isOnline || !accessToken) return;

    setIsSyncing(true);
    console.log('[OfflineSync] Starting sync...');

    try {
      // Sync from IndexedDB queue
      const pendingItems = await offlineDB.getPendingSyncItems();
      console.log(`[OfflineSync] Found ${pendingItems.length} items in IndexedDB queue`);

      for (const item of pendingItems) {
        try {
          await apiFetch(item.url, {
            method: item.method,
            accessToken,
            body: item.body ? JSON.stringify(item.body) : undefined,
          });
          await offlineDB.markSyncItemComplete(item.id);
          console.log(`[OfflineSync] Synced item ${item.id}`);
        } catch (error: any) {
          console.error(`[OfflineSync] Failed to sync item ${item.id}:`, error);
          await offlineDB.markSyncItemFailed(item.id);
        }
      }

      // Sync from app store queue
      for (const job of syncQueue.filter((item) => item.status === "pending")) {
        try {
          await apiFetch(`/sync/${job.entity}`, {
            method: "POST",
            accessToken,
            body: JSON.stringify(job.payload),
          });
          markJobSynced(job.id);
          console.log(`[OfflineSync] Synced job ${job.id}`);
        } catch (error: any) {
          console.error(`[OfflineSync] Failed to sync job ${job.id}:`, error);
          markJobFailed(job.id, error?.message ?? "Unknown error");
        }
      }

      console.log('[OfflineSync] Sync complete');
    } catch (error) {
      console.error('[OfflineSync] Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && accessToken && syncQueue.length > 0) {
      const timeoutId = setTimeout(() => {
        syncPendingData();
      }, 1000); // Wait 1 second after coming online

      return () => clearTimeout(timeoutId);
    }
  }, [isOnline, accessToken, syncQueue.length]);

  return {
    isSyncing,
    isOnline,
    pendingJobs: syncQueue.filter((job) => job.status === "pending").length,
    syncNow: syncPendingData,
  };
}
