// Hook for syncing expenses and data over mesh network
import { useEffect, useState, useCallback } from 'react';
import { meshNetwork } from '../lib/meshNetwork';
import { offlineDB, STORES } from '../lib/offlineDB';

interface MeshSyncStats {
  connectedPeers: number;
  expensesSynced: number;
  messagesReceived: number;
  lastSync: string | null;
}

export function useMeshSync(groupId?: string, enabled = true) {
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [connectedPeers, setConnectedPeers] = useState<any[]>([]);
  const [stats, setStats] = useState<MeshSyncStats>({
    connectedPeers: 0,
    expensesSynced: 0,
    messagesReceived: 0,
    lastSync: null,
  });

  // Update connected peers list
  const updatePeers = useCallback(() => {
    const peers = meshNetwork.getConnectedPeers();
    setConnectedPeers(peers);
    setStats(prev => ({ ...prev, connectedPeers: peers.length }));
  }, []);

  // Start mesh network discovery
  const startDiscovery = useCallback(async () => {
    if (!meshNetwork.isBluetoothSupported()) {
      alert('Bluetooth is not supported in your browser. Try Chrome on Android or desktop.');
      return;
    }

    setIsDiscovering(true);
    try {
      await meshNetwork.startDiscovery();
      updatePeers();
    } catch (error: any) {
      console.error('[MeshSync] Discovery failed:', error);
      alert(`Discovery failed: ${error.message}`);
    } finally {
      setIsDiscovering(false);
    }
  }, [updatePeers]);

  // Sync expense to mesh network
  const syncExpenseToMesh = useCallback(async (expense: any) => {
    if (!groupId) return;

    console.log('[MeshSync] Broadcasting expense:', expense);

    meshNetwork.broadcast({
      type: 'expense',
      data: {
        action: 'create',
        groupId,
        expense,
      },
    });

    setStats(prev => ({
      ...prev,
      expensesSynced: prev.expensesSynced + 1,
      lastSync: new Date().toISOString(),
    }));
  }, [groupId]);

  // Request sync from peers
  const requestSyncFromPeers = useCallback(async () => {
    if (!groupId) return;

    console.log('[MeshSync] Requesting sync from peers...');

    meshNetwork.broadcast({
      type: 'sync',
      data: {
        action: 'request',
        groupId,
        deviceId: meshNetwork.getDeviceInfo().id,
      },
    });
  }, [groupId]);

  // Handle incoming mesh messages
  useEffect(() => {
    if (!enabled || !groupId) return;

    const unsubscribe = meshNetwork.onMessage(async (message) => {
      console.log('[MeshSync] Received message:', message);

      setStats(prev => ({
        ...prev,
        messagesReceived: prev.messagesReceived + 1,
      }));

      if (message.type === 'expense') {
        // Received expense from peer
        const { action, expense } = message.data;

        if (action === 'create' && expense.groupId === groupId) {
          console.log('[MeshSync] Syncing expense from peer:', expense);

          // Save to IndexedDB
          await offlineDB.put(STORES.expenses, {
            ...expense,
            _syncedFromMesh: true,
            _meshSource: message.from,
            _meshTimestamp: message.timestamp,
          });

          // Add to sync queue for server upload when online
          await offlineDB.addToSyncQueue({
            type: 'CREATE_EXPENSE',
            method: 'POST',
            url: `/groups/${groupId}/expenses`,
            body: expense,
          } as any);

          setStats(prev => ({
            ...prev,
            expensesSynced: prev.expensesSynced + 1,
            lastSync: new Date().toISOString(),
          }));
        }
      } else if (message.type === 'sync') {
        // Peer requesting sync
        const { action } = message.data;

        if (action === 'request' && message.data.groupId === groupId) {
          console.log('[MeshSync] Peer requested sync, sending expenses...');

          // Get all expenses for this group from IndexedDB
          const expenses: any = await offlineDB.getByIndex(STORES.expenses, 'groupId', groupId);

          // Send each expense to requesting peer
          if (Array.isArray(expenses)) {
            for (const expense of expenses) {
              meshNetwork.broadcast({
                type: 'expense',
                data: {
                  action: 'create',
                  groupId,
                  expense,
                },
              });
            }
          }
        }
      }
    });

    return unsubscribe;
  }, [enabled, groupId]);

  // Update peers list on connect/disconnect
  useEffect(() => {
    const unsubscribeConnect = meshNetwork.onPeerConnected(() => {
      updatePeers();
      // Auto-request sync when new peer connects
      if (groupId) {
        requestSyncFromPeers();
      }
    });

    const unsubscribeDisconnect = meshNetwork.onPeerDisconnected(() => {
      updatePeers();
    });

    return () => {
      unsubscribeConnect();
      unsubscribeDisconnect();
    };
  }, [updatePeers, requestSyncFromPeers, groupId]);

  // Initial peer list
  useEffect(() => {
    updatePeers();
  }, [updatePeers]);

  return {
    isDiscovering,
    connectedPeers,
    stats,
    startDiscovery,
    syncExpenseToMesh,
    requestSyncFromPeers,
    deviceInfo: meshNetwork.getDeviceInfo(),
  };
}
