// IndexedDB wrapper for offline data storage
const DB_NAME = 'TravelManagementDB';
const DB_VERSION = 1;

export interface OfflineStore {
  groups: 'groups';
  expenses: 'expenses';
  members: 'members';
  documents: 'documents';
  syncQueue: 'syncQueue';
  tripPackages: 'tripPackages';
}

export const STORES: OfflineStore = {
  groups: 'groups',
  expenses: 'expenses',
  members: 'members',
  documents: 'documents',
  syncQueue: 'syncQueue',
  tripPackages: 'tripPackages',
};

class OfflineDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('[OfflineDB] Error opening database');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[OfflineDB] Database opened successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        console.log('[OfflineDB] Upgrading database...');

        // Create object stores
        if (!db.objectStoreNames.contains(STORES.groups)) {
          const groupsStore = db.createObjectStore(STORES.groups, { keyPath: 'id' });
          groupsStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.expenses)) {
          const expensesStore = db.createObjectStore(STORES.expenses, { keyPath: 'id' });
          expensesStore.createIndex('groupId', 'groupId', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.members)) {
          const membersStore = db.createObjectStore(STORES.members, { keyPath: 'id' });
          membersStore.createIndex('groupId', 'groupId', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.documents)) {
          const docsStore = db.createObjectStore(STORES.documents, { keyPath: 'id' });
          docsStore.createIndex('groupId', 'ownerId', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.syncQueue)) {
          const queueStore = db.createObjectStore(STORES.syncQueue, { 
            keyPath: 'id',
            autoIncrement: true 
          });
          queueStore.createIndex('status', 'status', { unique: false });
          queueStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.tripPackages)) {
          const packagesStore = db.createObjectStore(STORES.tripPackages, { keyPath: 'groupId' });
          packagesStore.createIndex('downloadedAt', 'downloadedAt', { unique: false });
        }

        console.log('[OfflineDB] Database upgrade complete');
      };
    });
  }

  async get<T>(storeName: keyof OfflineStore, key: string | number): Promise<T | undefined> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: keyof OfflineStore): Promise<T[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getByIndex<T>(
    storeName: keyof OfflineStore,
    indexName: string,
    value: any
  ): Promise<T[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async put<T>(storeName: keyof OfflineStore, data: T): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: keyof OfflineStore, key: string | number): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName: keyof OfflineStore): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async addToSyncQueue(action: {
    type: string;
    method: string;
    url: string;
    body?: any;
    groupId?: number;
  }): Promise<void> {
    const queueItem = {
      ...action,
      status: 'pending',
      createdAt: new Date().toISOString(),
      retries: 0,
    };

    await this.put(STORES.syncQueue, queueItem);
    console.log('[OfflineDB] Added to sync queue:', queueItem);

    // Register background sync if supported
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).sync.register('sync-queue');
        console.log('[OfflineDB] Registered background sync');
      } catch (error) {
        console.log('[OfflineDB] Background sync not supported');
      }
    }
  }

  async getPendingSyncItems(): Promise<any[]> {
    return this.getByIndex(STORES.syncQueue, 'status', 'pending');
  }

  async markSyncItemComplete(id: number): Promise<void> {
    const item: any = await this.get(STORES.syncQueue, id);
    if (item) {
      await this.put(STORES.syncQueue, { ...item, status: 'completed' });
    }
  }

  async markSyncItemFailed(id: number): Promise<void> {
    const item: any = await this.get(STORES.syncQueue, id);
    if (item) {
      await this.put(STORES.syncQueue, { 
        ...item, 
        status: 'failed',
        retries: (item.retries || 0) + 1,
      });
    }
  }
}

export const offlineDB = new OfflineDB();

// Initialize database when module loads
if (typeof window !== 'undefined') {
  offlineDB.init().catch(console.error);
}
