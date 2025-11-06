import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { offlineDB, STORES } from '../lib/offlineDB';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';

export function useAutoOfflineCache(groupId: string, enabled: boolean = true) {
  const { accessToken } = useAuth();
  const [isCaching, setIsCaching] = useState(false);
  const [cacheProgress, setCacheProgress] = useState(0);
  const [lastCached, setLastCached] = useState<string | null>(null);

  // Automatically cache group data when loaded
  const { data: group } = useQuery({
    queryKey: ['group', groupId],
    queryFn: async () => {
      if (!accessToken) return null;
      const data = await apiFetch(`/groups/${groupId}`, { accessToken });
      
      // Auto-cache in IndexedDB
      if (enabled && data) {
        await offlineDB.put(STORES.groups, data);
        console.log('[AutoCache] Cached group data:', groupId);
      }
      
      return data;
    },
    enabled: !!accessToken && !!groupId && enabled,
  });

  // Automatically cache expenses
  useQuery({
    queryKey: ['expenses', groupId],
    queryFn: async () => {
      if (!accessToken) return [];
      const data = await apiFetch(`/groups/${groupId}/expenses`, { accessToken });
      
      // Cache each expense individually
      if (enabled && Array.isArray(data)) {
        for (const expense of data) {
          await offlineDB.put(STORES.expenses, { ...expense, groupId: Number(groupId) });
        }
        console.log(`[AutoCache] Cached ${data.length} expenses for group ${groupId}`);
      }
      
      return data;
    },
    enabled: !!accessToken && !!groupId && enabled,
  });

  // Automatically cache members
  useEffect(() => {
    if (!group || !enabled) return;

    const cacheMembers = async () => {
      const g = group as any;
      if (g.members && Array.isArray(g.members)) {
        for (const member of g.members) {
          await offlineDB.put(STORES.members, { 
            ...member, 
            groupId: Number(groupId),
            id: member.user?.id || member.id 
          });
        }
        console.log(`[AutoCache] Cached ${g.members.length} members for group ${groupId}`);
      }
    };

    cacheMembers();
  }, [group, groupId, enabled]);

  // Automatically cache documents
  useEffect(() => {
    if (!group || !enabled) return;

    const cacheDocuments = async () => {
      const g = group as any;
      if (g.documents && Array.isArray(g.documents)) {
        for (const doc of g.documents) {
          await offlineDB.put(STORES.documents, doc);
        }
        console.log(`[AutoCache] Cached ${g.documents.length} documents for group ${groupId}`);
      }
    };

    cacheDocuments();
  }, [group, groupId, enabled]);

  // Cache complete trip package
  const cacheCompleteTrip = async () => {
    if (!accessToken || !groupId) return;

    setIsCaching(true);
    setCacheProgress(0);

    try {
      // 1. Cache group data
      setCacheProgress(20);
      const groupData = await apiFetch(`/groups/${groupId}`, { accessToken });
      await offlineDB.put(STORES.groups, groupData);

      // 2. Cache expenses
      setCacheProgress(40);
      const expenses: any = await apiFetch(`/groups/${groupId}/expenses`, { accessToken });
      for (const expense of expenses) {
        await offlineDB.put(STORES.expenses, { ...expense, groupId: Number(groupId) });
      }

      // 3. Cache balance
      setCacheProgress(60);
      try {
        const balance = await apiFetch(`/groups/${groupId}/balance`, { accessToken });
        // Store balance in trip package
        await offlineDB.put(STORES.tripPackages, {
          groupId,
          group: groupData,
          expenses,
          balance,
          cachedAt: new Date().toISOString(),
          version: 1,
        });
      } catch (error) {
        console.warn('[AutoCache] Could not cache balance:', error);
      }

      // 4. Cache members from group data
      setCacheProgress(80);
      const gData = groupData as any;
      if (gData.members) {
        for (const member of gData.members) {
          await offlineDB.put(STORES.members, {
            ...member,
            groupId: Number(groupId),
            id: member.user?.id || member.id,
          });
        }
      }

      // 5. Cache documents
      setCacheProgress(90);
      if (gData.documents) {
        for (const doc of gData.documents) {
          await offlineDB.put(STORES.documents, doc);
        }
      }

      setCacheProgress(100);
      setLastCached(new Date().toISOString());
      console.log(`[AutoCache] Complete trip package cached for group ${groupId}`);

      // Notify service worker
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_TRIP_PACKAGE',
          payload: {
            groupId,
            data: {
              group: groupData,
              expenses,
            },
          },
        });
      }
    } catch (error) {
      console.error('[AutoCache] Error caching trip:', error);
    } finally {
      setIsCaching(false);
    }
  };

  // Auto-cache on mount if data is fresh
  useEffect(() => {
    if (!enabled || !groupId) return;

    const checkAndCache = async () => {
      const existingPackage: any = await offlineDB.get(STORES.tripPackages, groupId);
      
      // Cache if no existing package or it's older than 24 hours
      if (!existingPackage) {
        console.log('[AutoCache] No cached package found, caching now...');
        cacheCompleteTrip();
      } else {
        const cachedAt = new Date(existingPackage.cachedAt);
        const hoursSinceCached = (Date.now() - cachedAt.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceCached > 24) {
          console.log('[AutoCache] Cache is stale, refreshing...');
          cacheCompleteTrip();
        } else {
          setLastCached(existingPackage.cachedAt);
          console.log('[AutoCache] Using cached package from', existingPackage.cachedAt);
        }
      }
    };

    checkAndCache();
  }, [groupId, enabled]);

  return {
    isCaching,
    cacheProgress,
    lastCached,
    refreshCache: cacheCompleteTrip,
  };
}
