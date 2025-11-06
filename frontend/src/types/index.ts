export type RoleName = "admin" | "co-admin" | "member" | "guest" | "super_admin";

export interface Role {
  id: number;
  name: RoleName;
}

export interface UserProfile {
  id: number;
  email: string;
  phone: string;
  photoUrl?: string | null;
  bloodGroup?: string | null;
  emergencyContact?: string | null;
  role?: Role | null;
  createdAt: string;
}

export interface MemberProfile extends UserProfile {
  displayName?: string;
  status?: "active" | "pending" | "invited" | "left";
}

export interface InviteLink {
  id: string;
  code: string;
  expiresAt?: string | null;
  usageLimit?: number | null;
  usedCount: number;
  createdAt: string;
  createdBy: number;
}

export interface ExpenseAllocation {
  memberId: number;
  amount: number;
}

export interface ExpenseRecord {
  id: string;
  groupId: string;
  title: string;
  description?: string;
  category: "accommodation" | "transport" | "food" | "activities" | "gear" | "other";
  currency: string;
  amount: number;
  splits: ExpenseAllocation[];
  paidBy: number;
  incurredOn: string;
  receiptUrl?: string | null;
  attachments?: DocumentRecord[];
  createdAt: string;
}

export interface DocumentRecord {
  id: string;
  groupId?: string;
  ownerType: "group" | "user" | "trip";
  ownerId: string | number;
  title: string;
  description?: string;
  fileType: string;
  fileSize: number;
  storageKey: string;
  expiresAt?: string | null;
  createdAt: string;
  createdBy: number;
  isEncrypted?: boolean;
}

export interface ItineraryItem {
  id: string;
  groupId: string;
  title: string;
  description?: string;
  location?: string;
  startsAt: string;
  endsAt: string;
  tags?: string[];
}

export interface OfflinePackage {
  id: string;
  name: string;
  region: string;
  sizeMB: number;
  status: "available" | "downloading" | "downloaded";
  updatedAt: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

export interface GroupSummary {
  id: string;
  title: string;
  description?: string;
  destination: string;
  startDate: string;
  endDate: string;
  isPublic: boolean;
  inviteCode: string;
  coverImage?: string;
  guides?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  admins: number[];
  financeSummary: {
    totalExpenses: number;
    totalMembers: number;
    outstandingBalance: number;
  };
  offlinePackages: OfflinePackage[];
  members: MemberProfile[];
  documents: DocumentRecord[];
  itinerary: ItineraryItem[];
  emergencyContacts: EmergencyContact[];
  invites: InviteLink[];
  expenses: ExpenseRecord[];
}

export interface SyncJob {
  id: string;
  type: "create" | "update" | "delete";
  entity: "group" | "expense" | "document" | "itinerary";
  payload: Record<string, unknown>;
  createdAt: string;
  lastTriedAt?: string;
  status: "pending" | "failed" | "synced";
  error?: string;
}

export interface NotificationPreference {
  channel: "push" | "email" | "sms" | "in-app";
  enabled: boolean;
  quietHours?: {
    start: string;
    end: string;
  };
}
