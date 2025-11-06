import { ApiDocument, ApiExpense, ApiGroupResponse, ApiGroupMember } from "../types/api";
import {
  DocumentRecord,
  ExpenseAllocation,
  ExpenseRecord,
  GroupSummary,
  InviteLink,
  MemberProfile,
} from "../types";

const mapMember = (member: ApiGroupMember): MemberProfile => ({
  id: member.user.id,
  email: member.user.email,
  phone: member.user.phone,
  photoUrl: member.user.photoUrl ?? null,
  bloodGroup: member.user.bloodGroup ?? null,
  emergencyContact: member.user.emergencyContact ?? null,
  createdAt: member.joinedAt,
  role: null,
  displayName: member.displayName ?? member.user.email,
  status: member.status as MemberProfile["status"],
});

export const mapApiExpenseToRecord = (groupId: string, expense: ApiExpense): ExpenseRecord => ({
  id: String(expense.id),
  groupId,
  title: expense.title,
  description: expense.description ?? undefined,
  category: expense.category as ExpenseRecord["category"],
  currency: expense.currency,
  amount: expense.amount,
  splits: expense.splits.map<ExpenseAllocation>((split) => ({
    memberId: split.memberId,
    amount: split.amount,
  })),
  paidBy: expense.paidBy.id,
  incurredOn: expense.incurredOn,
  receiptUrl: undefined,
  attachments: [],
  createdAt: expense.createdAt,
});

export const mapApiDocumentToRecord = (document: ApiDocument): DocumentRecord => ({
  id: String(document.id),
  ownerType: document.ownerType as DocumentRecord["ownerType"],
  ownerId: document.ownerId,
  groupId: document.ownerType === "group" ? String(document.ownerId) : undefined,
  title: document.title,
  description: document.description ?? undefined,
  fileType: document.fileType,
  fileSize: document.fileSize,
  storageKey: document.storageKey,
  expiresAt: document.expiresAt ?? undefined,
  createdAt: document.createdAt,
  createdBy: document.createdBy.id,
  isEncrypted: document.isEncrypted,
});

const mapInvite = (invite: ApiGroupResponse["invites"][number]): InviteLink => ({
  id: String(invite.id),
  code: invite.code,
  expiresAt: invite.expiresAt ?? undefined,
  usageLimit: invite.usageLimit ?? undefined,
  usedCount: invite.usedCount,
  createdAt: invite.createdAt,
  createdBy: invite.createdBy.id,
});

export const mapGroupResponseToSummary = (apiGroup: ApiGroupResponse): GroupSummary => {
  const groupId = String(apiGroup.id);
  const members = apiGroup.members.map(mapMember);
  const expenses = apiGroup.expenses.map((expense) => mapApiExpenseToRecord(groupId, expense));
  const documents = apiGroup.documents.map(mapApiDocumentToRecord);

  return {
    id: groupId,
    title: apiGroup.title,
    description: apiGroup.description ?? undefined,
    destination: apiGroup.destination,
    startDate: apiGroup.startDate,
    endDate: apiGroup.endDate,
    isPublic: apiGroup.isPublic,
    inviteCode: apiGroup.inviteCode,
    coverImage: apiGroup.coverImage ?? undefined,
    guides: apiGroup.guides ?? [],
    tags: apiGroup.tags ?? [],
    createdAt: apiGroup.createdAt,
    updatedAt: apiGroup.updatedAt,
    admins: apiGroup.members
      .filter((member) => member.role === "admin" || member.role === "co-admin")
      .map((member) => member.user.id),
    financeSummary: {
      totalExpenses: apiGroup.financeSummary.totalExpenses,
      totalMembers: apiGroup.financeSummary.totalMembers,
      outstandingBalance: apiGroup.financeSummary.outstandingBalance,
    },
    offlinePackages: apiGroup.offlinePackages ?? [],
    members,
    documents,
    itinerary: apiGroup.itinerary ?? [],
    emergencyContacts: apiGroup.emergencyContacts ?? [],
    invites: apiGroup.invites.map(mapInvite),
    expenses,
  };
};
