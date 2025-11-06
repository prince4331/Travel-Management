import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import localforage from "localforage";
import { nanoid } from "nanoid";
import {
  DocumentRecord,
  ExpenseRecord,
  GroupSummary,
  ItineraryItem,
  NotificationPreference,
  OfflinePackage,
  SyncJob,
} from "../types";

export interface AppState {
  groups: Record<string, GroupSummary>;
  syncQueue: SyncJob[];
  notifications: NotificationPreference[];
  lastSyncedAt?: string;
  setGroups: (groups: GroupSummary[]) => void;
  setGroup: (group: GroupSummary) => void;
  addGroup: (group: Omit<GroupSummary, "createdAt" | "updatedAt">) => GroupSummary;
  updateGroup: (groupId: string, data: Partial<GroupSummary>) => void;
  removeGroup: (groupId: string) => void;
  addExpense: (groupId: string, expense: Omit<ExpenseRecord, "id" | "createdAt">) => ExpenseRecord;
  removeExpense: (groupId: string, expenseId: string) => void;
  addDocument: (groupId: string, document: Omit<DocumentRecord, "id" | "createdAt">) => DocumentRecord;
  removeDocument: (groupId: string, documentId: string) => void;
  addItineraryItem: (groupId: string, item: Omit<ItineraryItem, "id">) => ItineraryItem;
  updateOfflinePackage: (groupId: string, pkg: OfflinePackage) => void;
  enqueueSync: (job: Omit<SyncJob, "id" | "createdAt" | "status">) => void;
  markJobSynced: (jobId: string) => void;
  markJobFailed: (jobId: string, error: string) => void;
  setNotifications: (preferences: NotificationPreference[]) => void;
  reset: () => void;
}

const defaultNotifications: NotificationPreference[] = [
  { channel: "push", enabled: true },
  { channel: "email", enabled: true },
  { channel: "sms", enabled: false },
  { channel: "in-app", enabled: true },
];

const initialState: Pick<AppState, "groups" | "syncQueue" | "notifications" | "lastSyncedAt"> = {
  groups: {},
  syncQueue: [],
  notifications: defaultNotifications,
  lastSyncedAt: undefined,
};

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        setGroups: (groupsInput) => {
          const record = groupsInput.reduce<Record<string, GroupSummary>>((acc, group) => {
            acc[group.id] = group;
            return acc;
          }, {});
          set((state) => ({
            ...state,
            groups: record,
          }));
        },
        setGroup: (group) => {
          set((state) => ({
            ...state,
            groups: {
              ...state.groups,
              [group.id]: group,
            },
          }));
        },
        addGroup: (groupInput) => {
          const id = groupInput.id ?? nanoid();
          const now = new Date().toISOString();
          const base: GroupSummary = {
            ...groupInput,
            id,
            createdAt: (groupInput as any).createdAt ?? now,
            updatedAt: now,
            financeSummary: groupInput.financeSummary ?? {
              totalExpenses: groupInput.expenses?.reduce((sum, expense) => sum + expense.amount, 0) ?? 0,
              totalMembers: groupInput.members?.length ?? 0,
              outstandingBalance: 0,
            },
            expenses: groupInput.expenses ?? [],
            documents: groupInput.documents ?? [],
            itinerary: groupInput.itinerary ?? [],
            offlinePackages: groupInput.offlinePackages ?? [],
            emergencyContacts: groupInput.emergencyContacts ?? [],
            invites: groupInput.invites ?? [],
            members: groupInput.members ?? [],
          };

          set((state) => ({
            groups: {
              ...state.groups,
              [id]: base,
            },
            syncQueue: [
              ...state.syncQueue,
              {
                id: nanoid(),
                type: "create" as const,
                entity: "group" as const,
                payload: base as unknown as Record<string, unknown>,
                createdAt: now,
                status: "pending" as const,
              },
            ],
          }));

          return get().groups[id];
        },
        updateGroup: (groupId, data) => {
          set((state) => {
            const existing = state.groups[groupId];
            if (!existing) return state;
            const updated: GroupSummary = {
              ...existing,
              ...data,
              updatedAt: new Date().toISOString(),
            };
            return {
              ...state,
              groups: {
                ...state.groups,
                [groupId]: updated,
              },
              syncQueue: [
                ...state.syncQueue,
                {
                  id: nanoid(),
                  type: "update",
                  entity: "group",
                  payload: { id: groupId, ...data },
                  createdAt: new Date().toISOString(),
                  status: "pending",
                },
              ],
            };
          });
        },
        removeGroup: (groupId) => {
          set((state) => {
            if (!state.groups[groupId]) return state;
            const { [groupId]: _removed, ...rest } = state.groups;
            return {
              ...state,
              groups: rest,
              syncQueue: [
                ...state.syncQueue,
                {
                  id: nanoid(),
                  type: "delete",
                  entity: "group",
                  payload: { id: groupId },
                  createdAt: new Date().toISOString(),
                  status: "pending",
                },
              ],
            };
          });
        },
        addExpense: (groupId, expenseInput) => {
          const expense: ExpenseRecord = {
            id: nanoid(),
            createdAt: new Date().toISOString(),
            ...expenseInput,
          };
          set((state) => {
            const group = state.groups[groupId];
            if (!group) return state;
            const expenses = [expense, ...group.expenses];
            const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
            return {
              ...state,
              groups: {
                ...state.groups,
                [groupId]: {
                  ...group,
                  expenses,
                  financeSummary: {
                    ...group.financeSummary,
                    totalExpenses,
                    outstandingBalance: Math.max(
                      0,
                      totalExpenses - expenses.reduce((sum, item) => sum + item.splits.reduce((acc, split) => acc + split.amount, 0), 0),
                    ),
                  },
                  updatedAt: new Date().toISOString(),
                },
              },
              syncQueue: [
                ...state.syncQueue,
                {
                  id: nanoid(),
                  type: "create",
                  entity: "expense",
                  payload: { groupId, expense },
                  createdAt: new Date().toISOString(),
                  status: "pending",
                },
              ],
            };
          });
          return expense;
        },
        removeExpense: (groupId, expenseId) => {
          set((state) => {
            const group = state.groups[groupId];
            if (!group) return state;
            const expenses = group.expenses.filter((expense) => expense.id !== expenseId);
            const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
            return {
              ...state,
              groups: {
                ...state.groups,
                [groupId]: {
                  ...group,
                  expenses,
                  financeSummary: {
                    ...group.financeSummary,
                    totalExpenses,
                  },
                  updatedAt: new Date().toISOString(),
                },
              },
              syncQueue: [
                ...state.syncQueue,
                {
                  id: nanoid(),
                  type: "delete",
                  entity: "expense",
                  payload: { groupId, expenseId },
                  createdAt: new Date().toISOString(),
                  status: "pending",
                },
              ],
            };
          });
        },
        addDocument: (groupId, documentInput) => {
          const document: DocumentRecord = {
            id: nanoid(),
            createdAt: new Date().toISOString(),
            ...documentInput,
          };
          set((state) => {
            const group = state.groups[groupId];
            if (!group) return state;
            return {
              ...state,
              groups: {
                ...state.groups,
                [groupId]: {
                  ...group,
                  documents: [document, ...group.documents],
                  updatedAt: new Date().toISOString(),
                },
              },
              syncQueue: [
                ...state.syncQueue,
                {
                  id: nanoid(),
                  type: "create",
                  entity: "document",
                  payload: { groupId, document },
                  createdAt: new Date().toISOString(),
                  status: "pending",
                },
              ],
            };
          });
          return document;
        },
        removeDocument: (groupId, documentId) => {
          set((state) => {
            const group = state.groups[groupId];
            if (!group) return state;
            return {
              ...state,
              groups: {
                ...state.groups,
                [groupId]: {
                  ...group,
                  documents: group.documents.filter((doc) => doc.id !== documentId),
                  updatedAt: new Date().toISOString(),
                },
              },
              syncQueue: [
                ...state.syncQueue,
                {
                  id: nanoid(),
                  type: "delete",
                  entity: "document",
                  payload: { groupId, documentId },
                  createdAt: new Date().toISOString(),
                  status: "pending",
                },
              ],
            };
          });
        },
        addItineraryItem: (groupId, itemInput) => {
          const item: ItineraryItem = {
            id: nanoid(),
            ...itemInput,
          };
          set((state) => {
            const group = state.groups[groupId];
            if (!group) return state;
            return {
              ...state,
              groups: {
                ...state.groups,
                [groupId]: {
                  ...group,
                  itinerary: [...group.itinerary, item].sort(
                    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
                  ),
                  updatedAt: new Date().toISOString(),
                },
              },
              syncQueue: [
                ...state.syncQueue,
                {
                  id: nanoid(),
                  type: "create",
                  entity: "itinerary",
                  payload: { groupId, item },
                  createdAt: new Date().toISOString(),
                  status: "pending",
                },
              ],
            };
          });
          return item;
        },
        updateOfflinePackage: (groupId, pkg) => {
          set((state) => {
            const group = state.groups[groupId];
            if (!group) return state;
            const offlinePackages = [...group.offlinePackages];
            const idx = offlinePackages.findIndex((item) => item.id === pkg.id);
            if (idx >= 0) {
              offlinePackages[idx] = pkg;
            } else {
              offlinePackages.push(pkg);
            }
            return {
              ...state,
              groups: {
                ...state.groups,
                [groupId]: {
                  ...group,
                  offlinePackages,
                  updatedAt: new Date().toISOString(),
                },
              },
            };
          });
        },
        enqueueSync: (jobInput) => {
          set((state) => ({
            ...state,
            syncQueue: [
              ...state.syncQueue,
              {
                id: nanoid(),
                createdAt: new Date().toISOString(),
                status: "pending",
                ...jobInput,
              },
            ],
          }));
        },
        markJobSynced: (jobId) => {
          set((state) => ({
            ...state,
            syncQueue: state.syncQueue.map((job) =>
              job.id === jobId
                ? {
                    ...job,
                    status: "synced",
                    lastTriedAt: new Date().toISOString(),
                  }
                : job,
            ),
            lastSyncedAt: new Date().toISOString(),
          }));
        },
        markJobFailed: (jobId, error) => {
          set((state) => ({
            ...state,
            syncQueue: state.syncQueue.map((job) =>
              job.id === jobId
                ? {
                    ...job,
                    status: "failed",
                    error,
                    lastTriedAt: new Date().toISOString(),
                  }
                : job,
            ),
          }));
        },
        setNotifications: (preferences) => {
          set({ notifications: preferences });
        },
        reset: () => {
          set(initialState);
        },
      }),
      {
        name: "travel-management-app",
        storage: createJSONStorage(() => localforage),
        partialize: (state) => ({
          groups: state.groups,
          syncQueue: state.syncQueue,
          notifications: state.notifications,
          lastSyncedAt: state.lastSyncedAt,
        }),
      },
    ),
  ),
);
