import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { useAppStore } from "../store/useAppStore";
import {
  mapApiDocumentToRecord,
  mapApiExpenseToRecord,
  mapGroupResponseToSummary,
} from "../lib/groupTransform";
import {
  ApiBalanceResponse,
  ApiDocument,
  ApiExpense,
  ApiGroupResponse,
} from "../types/api";
import { ExpenseRecord, GroupSummary } from "../types";

export interface CreateGroupPayload {
  title: string;
  description?: string;
  destination: string;
  startDate: string;
  endDate: string;
  isPublic: boolean;
  tourType?: 'friendly' | 'paid';
  showFinancialDetailsToMembers?: boolean;
  coverImage?: string;
  guides?: string[];
  tags?: string[];
  members?: Array<{
    userId: number;
    role?: "admin" | "co-admin" | "member";
    displayName?: string;
  }>;
}

export interface CreateExpensePayload {
  title: string;
  description?: string;
  category: string;
  currency: string;
  amount: number;
  paidById: number;
  incurredOn: string;
  splits: Array<{
    memberId: number;
    amount: number;
  }>;
}

export interface CreatePersonalExpensePayload {
  title: string;
  description?: string;
  category: string;
  currency: string;
  amount: number;
  incurredOn: string;
}

export interface UploadDocumentPayload {
  ownerType: "group" | "user" | "trip";
  ownerId: string;
  title: string;
  description?: string;
  fileType: string;
  fileSize: number;
  storageKey: string;
  expiresAt?: string;
  isEncrypted?: boolean;
  metadata?: Record<string, unknown>;
}

export const useGroupsQuery = () => {
  const { authFetch } = useAuth();
  const setGroups = useAppStore((state) => state.setGroups);

  return useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const response = await authFetch<ApiGroupResponse[]>("/groups");
      const groups = response.map(mapGroupResponseToSummary);
      setGroups(groups);
      return groups;
    },
    staleTime: 1000 * 30,
  });
};

export const useGroupQuery = (groupId?: string) => {
  const { authFetch } = useAuth();
  const setGroup = useAppStore((state) => state.setGroup);

  return useQuery({
    queryKey: ["groups", groupId],
    enabled: Boolean(groupId),
    queryFn: async () => {
      const response = await authFetch<ApiGroupResponse>(`/groups/${groupId}`);
      const group = mapGroupResponseToSummary(response);
      setGroup(group);
      return group;
    },
    staleTime: 1000 * 30,
  });
};

export const useCreateGroupMutation = () => {
  const { authFetch } = useAuth();
  const setGroup = useAppStore((state) => state.setGroup);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateGroupPayload) => {
      const response = await authFetch<ApiGroupResponse>("/groups", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return mapGroupResponseToSummary(response);
    },
    onSuccess: (group: GroupSummary) => {
      setGroup(group);
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["groups", group.id] });
    },
  });
};

export const useUpdateGroupMutation = (groupId: string) => {
  const { authFetch } = useAuth();
  const setGroup = useAppStore((state) => state.setGroup);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<CreateGroupPayload>) => {
      const response = await authFetch<ApiGroupResponse>(`/groups/${groupId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      return mapGroupResponseToSummary(response);
    },
    onSuccess: (group: GroupSummary) => {
      setGroup(group);
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["groups", groupId] });
    },
  });
};

export const useDeleteGroupMutation = () => {
  const { authFetch } = useAuth();
  const removeGroup = useAppStore((state) => state.removeGroup);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: string) => {
      await authFetch(`/groups/${groupId}`, {
        method: "DELETE",
      });
      return groupId;
    },
    onSuccess: (groupId: string) => {
      removeGroup(groupId);
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
};

export const useInviteMemberMutation = (groupId: string) => {
  const { authFetch } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { email: string; role?: "admin" | "co-admin" | "member" }) => {
      const response = await authFetch(`/groups/${groupId}/invite`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
};

export const useAddMemberMutation = (groupId: string) => {
  const { authFetch } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { 
      userId?: number; 
      email?: string; 
      phone?: string; 
      role?: "admin" | "co-admin" | "member"; 
      displayName?: string;
      password?: string;
    }) => {
      const response = await authFetch(`/groups/${groupId}/members`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
};

export const useRemoveMemberMutation = (groupId: string) => {
  const { authFetch } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: number) => {
      await authFetch(`/groups/${groupId}/members/${memberId}`, {
        method: "DELETE",
      });
      return memberId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
};

export const useUpdateMemberRoleMutation = (groupId: string) => {
  const { authFetch } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { memberId: number; role: "admin" | "co-admin" | "member" }) => {
      const response = await authFetch(`/groups/${groupId}/members/${payload.memberId}`, {
        method: "PATCH",
        body: JSON.stringify({ role: payload.role }),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
};

export const useCreateExpenseMutation = (groupId?: string) => {
  const { authFetch } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateExpensePayload) => {
      if (!groupId) {
        throw new Error("Group id is required to create an expense");
      }
      return authFetch<ApiExpense>(`/groups/${groupId}/expenses`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (_expense, _variables, context) => {
      if (groupId) {
        queryClient.invalidateQueries({ queryKey: ["groups", groupId] });
        queryClient.invalidateQueries({ queryKey: ["groups", groupId, "expenses"] });
        queryClient.invalidateQueries({ queryKey: ["groups", groupId, "balance"] });
        queryClient.invalidateQueries({ queryKey: ["groups"] });
      }
      return context;
    },
  });
};

export const useUpdateExpenseMutation = (groupId: string, expenseId: string) => {
  const { authFetch } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<CreateExpensePayload>) => {
      return authFetch<ApiExpense>(`/groups/${groupId}/expenses/${expenseId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groups", groupId, "expenses"] });
      queryClient.invalidateQueries({ queryKey: ["groups", groupId, "balance"] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
};

export const useDeleteExpenseMutation = (groupId: string) => {
  const { authFetch } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expenseId: string) => {
      await authFetch(`/groups/${groupId}/expenses/${expenseId}`, {
        method: "DELETE",
      });
      return expenseId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groups", groupId, "expenses"] });
      queryClient.invalidateQueries({ queryKey: ["groups", groupId, "balance"] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
};

export const useUploadDocumentMutation = (groupId?: string) => {
  const { authFetch } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UploadDocumentPayload) => {
      return authFetch<ApiDocument>("/upload/document", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      if (groupId) {
        queryClient.invalidateQueries({ queryKey: ["groups", groupId] });
      }
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
};

export const useGroupExpensesQuery = (groupId?: string) => {
  const { authFetch } = useAuth();

  return useQuery({
    queryKey: ["groups", groupId, "expenses"],
    enabled: Boolean(groupId),
    queryFn: async (): Promise<ExpenseRecord[]> => {
      if (!groupId) return [];
      const response = await authFetch<ApiExpense[]>(`/groups/${groupId}/expenses`);
      return response.map((expense) => mapApiExpenseToRecord(groupId, expense));
    },
    staleTime: 1000 * 15,
  });
};

export const useGroupBalanceQuery = (groupId?: string) => {
  const { authFetch } = useAuth();

  return useQuery({
    queryKey: ["groups", groupId, "balance"],
    enabled: Boolean(groupId),
    queryFn: async () => {
      if (!groupId) return null;
      const response = await authFetch<ApiBalanceResponse>(`/groups/${groupId}/balance`);
      return response;
    },
    staleTime: 1000 * 15,
  });
};

// Personal Expenses
export const useCreatePersonalExpenseMutation = () => {
  const { authFetch } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePersonalExpensePayload) => {
      return authFetch("/expenses/personal", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["personal-expenses"] });
    },
  });
};

export const usePersonalExpensesQuery = () => {
  const { authFetch } = useAuth();

  return useQuery({
    queryKey: ["personal-expenses"],
    queryFn: async () => {
      const response = await authFetch<any[]>("/expenses/personal");
      return response;
    },
    staleTime: 1000 * 15,
  });
};

export const useDeletePersonalExpenseMutation = () => {
  const { authFetch } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expenseId: number) => {
      await authFetch(`/expenses/personal/${expenseId}`, {
        method: "DELETE",
      });
      return expenseId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["personal-expenses"] });
    },
  });
};
