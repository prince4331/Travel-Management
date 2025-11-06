export interface ApiRole {
  id: number;
  name: string;
}

export interface ApiUser {
  id: number;
  email: string;
  phone: string;
  photoUrl?: string | null;
  bloodGroup?: string | null;
  emergencyContact?: string | null;
  role?: ApiRole | null;
  createdAt: string;
}

export interface ApiGroupMember {
  id: number;
  role: "admin" | "co-admin" | "member";
  status: string;
  displayName?: string | null;
  joinedAt: string;
  user: ApiUser;
}

export interface ApiExpenseSplit {
  memberId: number;
  amount: number;
}

export interface ApiExpense {
  id: number;
  title: string;
  description?: string | null;
  category: string;
  currency: string;
  amount: number;
  splits: ApiExpenseSplit[];
  paidBy: {
    id: number;
    email: string;
  };
  incurredOn: string;
  createdAt: string;
}

export interface ApiInvite {
  id: number;
  code: string;
  expiresAt?: string | null;
  usageLimit?: number | null;
  usedCount: number;
  createdAt: string;
  createdBy: {
    id: number;
    email: string;
  };
}

export interface ApiDocument {
  id: number;
  title: string;
  description?: string | null;
  fileType: string;
  fileSize: number;
  storageKey: string;
  ownerType: string;
  ownerId: string;
  expiresAt?: string | null;
  isEncrypted: boolean;
  createdAt: string;
  createdBy: {
    id: number;
    email: string;
  };
  uploadUrl?: string;
}

export interface ApiGroupResponse {
  id: number;
  title: string;
  description?: string | null;
  destination: string;
  startDate: string;
  endDate: string;
  isPublic: boolean;
  inviteCode: string;
  coverImage?: string | null;
  guides: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  financeSummary: {
    totalExpenses: number;
    totalMembers: number;
    outstandingBalance: number;
  };
  members: ApiGroupMember[];
  invites: ApiInvite[];
  expenses: ApiExpense[];
  documents: ApiDocument[];
  itinerary: any[];
  emergencyContacts: any[];
  offlinePackages: any[];
}

export interface ApiBalanceMember {
  memberId: number;
  displayName: string | null;
  role: string;
  paid: number;
  owed: number;
  balance: number;
}

export interface ApiBalanceResponse {
  groupId: number;
  members: ApiBalanceMember[];
  totals: {
    expensesCount: number;
    amountByCurrency: Record<string, number>;
    lastExpenseAt: string | null;
  };
}
