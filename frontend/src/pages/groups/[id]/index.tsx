import { useState, useMemo } from "react";
import { useRouter } from "next/router";
import { format } from "date-fns";
import Link from "next/link";
import { AppLayout } from "../../../components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/tabs";
import { Trash2, Shield } from "lucide-react";
import { useGroupQuery, useGroupExpensesQuery, useGroupBalanceQuery, useCreateExpenseMutation, useInviteMemberMutation, useAddMemberMutation, useRemoveMemberMutation, usePersonalExpensesQuery, useCreatePersonalExpenseMutation, useDeletePersonalExpenseMutation } from "../../../hooks/useGroupsApi";
import GroupChat from "../../../components/ui/GroupChat";
import { useAuth } from "../../../context/AuthContext";

export default function GroupDetailPage() {
  const router = useRouter();
  const groupId = router.query.id as string;
  const { user } = useAuth();
  
  console.log('=== GROUP DETAIL PAGE RENDER ===');
  console.log('Router query:', router.query);
  console.log('Group ID:', groupId);
  console.log('Router pathname:', router.pathname);
  console.log('Router asPath:', router.asPath);
  
  const { data: group, isLoading, refetch: refetchGroup } = useGroupQuery(groupId);
  const { data: expenses } = useGroupExpensesQuery(groupId);
  const { data: balance } = useGroupBalanceQuery(groupId);
  const createExpenseMutation = useCreateExpenseMutation(groupId);
  const inviteMemberMutation = useInviteMemberMutation(groupId);
  const addMemberMutation = useAddMemberMutation(groupId);
  const removeMemberMutation = useRemoveMemberMutation(groupId);
  
  const { data: personalExpenses = [] } = usePersonalExpensesQuery();
  const createPersonalExpenseMutation = useCreatePersonalExpenseMutation();
  const deletePersonalExpenseMutation = useDeletePersonalExpenseMutation();

  // Check if current user is admin or co-admin
  const currentMember = useMemo(() => {
    if (!group || !user) return null;
    return group.members.find(m => m.id === user.id);
  }, [group, user]);

  const isAdmin = useMemo(() => {
    if (!currentMember || !user) return false;
    // Check if user is in the admins array of the group
    return group?.admins?.includes(user.id) || false;
  }, [currentMember, user, group]);

  const isCoAdminOrHigher = useMemo(() => {
    if (!currentMember) return false;
    // For co-admin check, we need to check the member's role if available
    // or check if they're in the admins array
    return isAdmin || currentMember.role?.name === 'co-admin';
  }, [currentMember, isAdmin]);

  const [activeTab, setActiveTab] = useState("overview");
  const [expenseType, setExpenseType] = useState<"group" | "personal">("group");
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [newMember, setNewMember] = useState({
    email: "",
    phone: "",
    role: "member",
    displayName: "",
    password: "",
  });
  const [newExpense, setNewExpense] = useState({
    title: "",
    amount: "",
    category: "food",
    currency: "USD",
    paidById: "",
  });
  
  const [newPersonalExpense, setNewPersonalExpense] = useState({
    title: "",
    amount: "",
    category: "food",
    currency: "USD",
  });

  if (isLoading) {
    return (
      <AppLayout title="Loading..." description="Please wait" actions={null}>
        <Card>
          <CardContent>
            <p className="text-sm text-slate-600">Loading group details...</p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  if (!group) {
    return (
      <AppLayout title="Not Found" description="Group not found" actions={null}>
        <Card>
          <CardContent>
            <p className="text-sm text-slate-600">Group not found. It may have been deleted or you may not have access.</p>
            <Button variant="secondary" className="mt-4" asChild>
              <Link href="/groups">Back to Groups</Link>
            </Button>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    try {
      await inviteMemberMutation.mutateAsync({ email: inviteEmail, role: "member" });
      setInviteEmail("");
      alert("Invitation sent successfully!");
    } catch (error: any) {
      alert("Failed to invite member: " + (error?.message || "Unknown error"));
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.email && !newMember.phone) {
      alert("Please provide either email or phone number");
      return;
    }
    
    console.log('=== ADD MEMBER DEBUG ===');
    console.log('Group ID:', groupId);
    console.log('Current group data:', group);
    console.log('Payload:', {
      email: newMember.email || undefined,
      phone: newMember.phone || undefined,
      role: newMember.role,
      displayName: newMember.displayName || undefined,
    });
    
    try {
      const result = await addMemberMutation.mutateAsync({
        email: newMember.email || undefined,
        phone: newMember.phone || undefined,
        role: newMember.role as any,
        displayName: newMember.displayName || undefined,
        password: newMember.password || undefined,
      });
      console.log('✅ Mutation SUCCESS:', result);
      console.log('Group ID after mutation:', groupId);
      
      setNewMember({ email: "", phone: "", role: "member", displayName: "", password: "" });
      setShowAddMemberForm(false);
      
      // Force refetch to ensure member list updates
      console.log('Starting refetch...');
      await refetchGroup();
      console.log('✅ Refetch complete');
      
      alert("Member added successfully!");
    } catch (error: any) {
      console.error('❌ ADD MEMBER ERROR ===', error);
      console.error('Error status:', error?.status);
      console.error('Error message:', error?.message);
      console.error('Full error:', JSON.stringify(error, null, 2));
      
      // Don't show generic alert, show specific error
      const errorMsg = error?.message || error?.statusText || 'Unknown error';
      alert(`Failed to add member: ${errorMsg}\n\nCheck console for details (F12)`);
      
      // PREVENT the default error behavior
      return;
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.title || !newExpense.amount || !newExpense.paidById) {
      alert("Please fill in all required fields");
      return;
    }
    
    const paidBy = parseInt(newExpense.paidById);
    
    try {
      const amount = parseFloat(newExpense.amount);
      const memberCount = group.members.length;
      const splitAmount = Math.floor((amount / memberCount) * 100) / 100; // Round down to 2 decimals
      
      // Group expense - split equally among all members
      const splits = group.members.map((member, index) => {
        const isLast = index === memberCount - 1;
        const memberAmount = isLast 
          ? Number((amount - (splitAmount * (memberCount - 1))).toFixed(2)) // Last member gets remainder
          : Number(splitAmount);
        
        return {
          memberId: Number(member.id),
          amount: memberAmount,
        };
      });

      // Verify total (for debugging)
      const total = splits.reduce((sum, split) => sum + split.amount, 0);
      console.log('Expense details:', {
        amount,
        splits,
        total,
        difference: Math.abs(total - amount)
      });

      await createExpenseMutation.mutateAsync({
        title: newExpense.title,
        category: newExpense.category as any,
        currency: newExpense.currency,
        amount: Number(amount),
        paidById: Number(paidBy),
        incurredOn: new Date().toISOString(),
        splits,
      });
      
      setNewExpense({ 
        title: "", 
        amount: "", 
        category: "food", 
        currency: "USD",
        paidById: "",
      });
      alert("Expense added successfully!");
    } catch (error: any) {
      console.error("Expense creation error:", error);
      alert("Failed to add expense: " + (error?.message || "Unknown error"));
    }
  };
  
  const handleCreatePersonalExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonalExpense.title || !newPersonalExpense.amount) {
      alert("Please fill in all required fields");
      return;
    }
    
    try {
      await createPersonalExpenseMutation.mutateAsync({
        title: newPersonalExpense.title,
        category: newPersonalExpense.category as any,
        currency: newPersonalExpense.currency,
        amount: Number(newPersonalExpense.amount),
        incurredOn: new Date().toISOString(),
      });
      
      setNewPersonalExpense({ 
        title: "", 
        amount: "", 
        category: "food", 
        currency: "USD",
      });
      alert("Personal expense added successfully!");
    } catch (error: any) {
      alert("Failed to add personal expense: " + (error?.message || "Unknown error"));
    }
  };
  
  const handleDeletePersonalExpense = async (expenseId: number) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    
    try {
      await deletePersonalExpenseMutation.mutateAsync(expenseId);
      alert("Personal expense deleted successfully!");
    } catch (error: any) {
      alert("Failed to delete expense: " + (error?.message || "Unknown error"));
    }
  };

  return (
    <AppLayout 
      title={group.title} 
      description={group.destination}
      actions={
        <>
          {currentMember && (
            <Badge variant="info" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              {isAdmin && '👑 Admin'}
              {!isAdmin && currentMember.role?.name === 'co-admin' && '⭐ Co-Admin'}
              {!isAdmin && currentMember.role?.name !== 'co-admin' && '👤 Member'}
            </Badge>
          )}
          {isAdmin && (
            <Button variant="secondary" asChild>
              <Link href={`/groups/${groupId}/edit`}>Edit Group</Link>
            </Button>
          )}
          <Button variant="ghost" asChild>
            <Link href="/groups">Back</Link>
          </Button>
        </>
      }
    >
      {/* Header Info */}
      <Card className="mb-6">
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{group.title}</h2>
              <p className="text-slate-600">{group.destination}</p>
            </div>
            <Badge variant={group.isPublic ? "info" : "default"}>
              {group.isPublic ? "Public" : "Private"}
            </Badge>
          </div>
          
          {group.description && (
            <p className="text-sm text-slate-700">{group.description}</p>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div>
              <p className="text-slate-500">Start Date</p>
              <p className="font-medium text-slate-900">{format(new Date(group.startDate), "PPP")}</p>
            </div>
            <div>
              <p className="text-slate-500">End Date</p>
              <p className="font-medium text-slate-900">{format(new Date(group.endDate), "PPP")}</p>
            </div>
            <div>
              <p className="text-slate-500">Invite Code</p>
              <p className="font-mono font-medium text-primary-600">{group.inviteCode}</p>
            </div>
            <div>
              <p className="text-slate-500">Total Spent</p>
              <p className="font-medium text-slate-900">${group.financeSummary.totalExpenses.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="chat">💬 Chat</TabsTrigger>
          <TabsTrigger value="members">Members ({group.members.length})</TabsTrigger>
          <TabsTrigger value="expenses">Expenses ({expenses?.length || 0})</TabsTrigger>
          <TabsTrigger value="documents">Documents ({group.documents.length})</TabsTrigger>
          <TabsTrigger value="itinerary">Itinerary ({group.itinerary.length})</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Financial Summary - Only for Admin or if showFinancialDetailsToMembers is true */}
            {isAdmin ? (
              <Card className="border-white/50 bg-white/80 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    💰 Financial Summary
                    <Badge variant="info" className="bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs">
                      Admin View
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total Expenses</span>
                    <span className="font-semibold">${group.financeSummary.totalExpenses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Outstanding Balance</span>
                    <span className="font-semibold">${group.financeSummary.outstandingBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Per Person Average</span>
                    <span className="font-semibold">
                      ${group.members.length > 0 ? (group.financeSummary.totalExpenses / group.members.length).toFixed(2) : "0.00"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-white/50 bg-white/80 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle>💰 Financial Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 bg-amber-50 rounded-xl border border-amber-200">
                    <Shield className="w-12 h-12 mx-auto text-amber-600 mb-3" />
                    <p className="text-sm text-amber-700 mb-2 font-medium">Financial details are private</p>
                    <p className="text-xs text-amber-600">Only the group admin can view detailed financial information.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Members</span>
                  <span className="font-semibold">{group.members.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Documents</span>
                  <span className="font-semibold">{group.documents.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Itinerary Items</span>
                  <span className="font-semibold">{group.itinerary.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat">
          <Card className="h-[700px]">
            <CardContent className="p-0 h-full">
              <GroupChat groupId={groupId} groupName={group.title} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members">
          <div className="space-y-6">
            {/* Non-admin message */}
            {!isAdmin && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <p className="text-sm text-blue-800">
                      You are viewing as a <strong>{currentMember?.role?.name || 'member'}</strong>. 
                      Only the group admin can add or remove members.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Add Member Section - Only for Admins */}
            {isAdmin && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    Add Member (Admin Only)
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant={!showAddMemberForm ? "secondary" : "subtle"}
                      size="sm"
                      onClick={() => setShowAddMemberForm(false)}
                    >
                      By Email Invite
                    </Button>
                    <Button 
                      variant={showAddMemberForm ? "secondary" : "subtle"}
                      size="sm"
                      onClick={() => setShowAddMemberForm(true)}
                    >
                      Direct Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {!showAddMemberForm ? (
                    <form onSubmit={handleInviteMember} className="space-y-3">
                      <p className="text-sm text-slate-600">Send an invitation link to join this group</p>
                      <div className="flex gap-3">
                        <input
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="Enter email address"
                          className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                        />
                        <Button type="submit" isLoading={inviteMemberMutation.isPending}>
                          Send Invite
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleAddMember} className="space-y-3">
                      <p className="text-sm text-slate-600">Add a member directly (creates account if they dont exist)</p>
                      <div className="grid gap-3 md:grid-cols-2">
                        <input
                          type="email"
                          value={newMember.email}
                          onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                          placeholder="Email (required if no phone)"
                          className="rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                        />
                        <input
                          type="tel"
                          value={newMember.phone}
                          onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                          placeholder="Phone (required if no email)"
                          className="rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                        />
                        <input
                          type="text"
                          value={newMember.displayName}
                          onChange={(e) => setNewMember({ ...newMember, displayName: e.target.value })}
                          placeholder="Display Name (optional)"
                          className="rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                        />
                        <input
                          type="password"
                          value={newMember.password}
                          onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                          placeholder="Password (optional, auto-generated)"
                          className="rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                        />
                        <select
                          value={newMember.role}
                          onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                          className="rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                        >
                          <option value="member">Member</option>
                          <option value="co-admin">Co-Admin</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <Button type="submit" isLoading={addMemberMutation.isPending}>
                        Add Member
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Current Members List */}
            <Card>
              <CardHeader>
                <CardTitle>Current Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {group.members.length === 0 ? (
                    <p className="text-sm text-slate-500">No members yet. Invite someone to get started!</p>
                  ) : (
                    group.members.map((member) => {
                      const memberIsAdmin = group.admins?.includes(member.id);
                      return (
                        <div key={member.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-slate-900">{member.displayName || member.email}</p>
                              {memberIsAdmin && (
                                <Badge variant="info" className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                                  👑 Admin
                                </Badge>
                              )}
                              {!memberIsAdmin && member.role?.name === 'co-admin' && (
                                <Badge variant="info" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                                  ⭐ Co-Admin
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">{member.email}</p>
                            {member.emergencyContact && (
                              <p className="text-xs text-slate-500">Emergency: {member.emergencyContact}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={member.status === "active" ? "success" : "default"}>
                              {member.status || "active"}
                            </Badge>
                            {/* Only admins can remove members, and can't remove themselves */}
                            {isAdmin && member.id !== user?.id && (
                              <Button 
                                variant="danger" 
                                size="sm"
                                onClick={() => removeMemberMutation.mutate(member.id)}
                                isLoading={removeMemberMutation.isPending}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses">
          <div className="space-y-6">
            {/* Expense Type Toggle */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Button
                    variant={expenseType === "group" ? "primary" : "secondary"}
                    onClick={() => setExpenseType("group")}
                    className="flex-1"
                  >
                    Group Expenses ({expenses?.length || 0})
                  </Button>
                  <Button
                    variant={expenseType === "personal" ? "primary" : "secondary"}
                    onClick={() => setExpenseType("personal")}
                    className="flex-1"
                  >
                    Personal Expenses ({personalExpenses?.length || 0})
                  </Button>
                </div>
              </CardContent>
            </Card>

            {expenseType === "group" ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Group Expense</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateExpense} className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      type="text"
                      value={newExpense.title}
                      onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                      placeholder="Expense title"
                      required
                      className="rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                      placeholder="Amount"
                      required
                      className="rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    />
                    <select
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                      className="rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    >
                      <option value="food">Food</option>
                      <option value="accommodation">Accommodation</option>
                      <option value="transport">Transport</option>
                      <option value="activities">Activities</option>
                      <option value="gear">Gear</option>
                      <option value="other">Other</option>
                    </select>
                    <select
                      value={newExpense.paidById}
                      onChange={(e) => setNewExpense({ ...newExpense, paidById: e.target.value })}
                      className="rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                      required
                    >
                      <option value="">Who paid?</option>
                      {group.members.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.displayName || member.email}
                        </option>
                      ))}
                    </select>
                    <select
                      value={newExpense.currency}
                      onChange={(e) => setNewExpense({ ...newExpense, currency: e.target.value })}
                      className="rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="INR">INR</option>
                      <option value="BDT">BDT</option>
                    </select>
                  </div>
                  <Button type="submit" isLoading={createExpenseMutation.isPending}>
                    Add Expense
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {!expenses || expenses.length === 0 ? (
                    <p className="text-sm text-slate-500">No expenses recorded yet.</p>
                  ) : (
                    expenses.map((expense) => {
                      // Find who paid from group members
                      const paidByMember = group.members.find(m => m.id === expense.paidBy);
                      const paidByName = paidByMember?.displayName || paidByMember?.email || 'Unknown';
                      
                      return (
                      <div key={expense.id} className="border-b border-slate-100 pb-3 last:border-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-slate-900">{expense.title}</p>
                            </div>
                            <p className="text-xs text-slate-500">
                              {expense.category} · {format(new Date(expense.incurredOn), "PPP")}
                            </p>
                            <p className="text-xs text-slate-600 mt-1">
                              Paid by: <span className="font-medium">{paidByName}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-900">
                              {expense.currency} {expense.amount.toFixed(2)}
                            </p>
                            <p className="text-xs text-slate-500">
                              Split: {expense.currency} {(expense.amount / expense.splits.length).toFixed(2)} each
                            </p>
                          </div>
                        </div>
                      </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {balance && balance.members && balance.members.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Who Paid & Who Owes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {balance.members.map((member: any) => (
                      <div key={member.memberId} className="border rounded-lg p-4 hover:bg-slate-50 transition">
                        <p className="font-semibold text-slate-900 mb-3">{member.displayName || `Member #${member.memberId}`}</p>
                        
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-xs text-blue-600 font-medium mb-1">I Paid</p>
                            <p className="text-lg font-bold text-blue-900">${member.paid.toFixed(2)}</p>
                          </div>
                          <div className="bg-slate-100 rounded-lg p-3">
                            <p className="text-xs text-slate-600 font-medium mb-1">My Share</p>
                            <p className="text-lg font-bold text-slate-900">${member.owed.toFixed(2)}</p>
                          </div>
                        </div>

                        <div className={`rounded-lg p-3 ${member.balance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                          <p className={`text-xs font-medium mb-1 ${member.balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {member.balance >= 0 ? 'I Get Back' : 'I Need to Pay'}
                          </p>
                          <p className={`text-2xl font-bold ${member.balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {member.balance >= 0 ? '+' : '-'}${Math.abs(member.balance).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Summary */}
                    {balance.totals && (
                      <div className="mt-4 rounded-lg bg-slate-100 p-4">
                        <p className="text-sm font-semibold text-slate-900 mb-3">Trip Summary</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-slate-600">Total Expenses</p>
                            <p className="font-bold text-slate-900">{balance.totals.expensesCount} items</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Total Amount</p>
                            {balance.totals.amountByCurrency && Object.entries(balance.totals.amountByCurrency).map(([currency, amount]: [string, any]) => (
                              <p key={currency} className="font-bold text-slate-900">
                                {currency} ${amount.toFixed(2)}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
              </>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Add Personal Expense</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreatePersonalExpense} className="space-y-3">
                      <p className="text-sm text-slate-600 mb-3">Personal expenses are private and not shared with the group.</p>
                      <div className="grid gap-3 md:grid-cols-2">
                        <input
                          type="text"
                          value={newPersonalExpense.title}
                          onChange={(e) => setNewPersonalExpense({ ...newPersonalExpense, title: e.target.value })}
                          placeholder="Expense title"
                          required
                          className="rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                        />
                        <input
                          type="number"
                          step="0.01"
                          value={newPersonalExpense.amount}
                          onChange={(e) => setNewPersonalExpense({ ...newPersonalExpense, amount: e.target.value })}
                          placeholder="Amount"
                          required
                          className="rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                        />
                        <select
                          value={newPersonalExpense.category}
                          onChange={(e) => setNewPersonalExpense({ ...newPersonalExpense, category: e.target.value })}
                          className="rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                        >
                          <option value="food">Food</option>
                          <option value="accommodation">Accommodation</option>
                          <option value="transport">Transport</option>
                          <option value="activities">Activities</option>
                          <option value="gear">Gear</option>
                          <option value="other">Other</option>
                        </select>
                        <select
                          value={newPersonalExpense.currency}
                          onChange={(e) => setNewPersonalExpense({ ...newPersonalExpense, currency: e.target.value })}
                          className="rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                        >
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="INR">INR</option>
                          <option value="BDT">BDT</option>
                        </select>
                      </div>
                      <Button type="submit" isLoading={createPersonalExpenseMutation.isPending}>
                        Add Personal Expense
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Personal Expenses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {!personalExpenses || personalExpenses.length === 0 ? (
                        <p className="text-sm text-slate-500">No personal expenses recorded yet.</p>
                      ) : (
                        personalExpenses.map((expense: any) => (
                          <div key={expense.id} className="border-b border-slate-100 pb-3 last:border-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-slate-900">{expense.title}</p>
                                <p className="text-xs text-slate-500">
                                  {expense.category} · {format(new Date(expense.incurredOn), "PPP")}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <p className="font-semibold text-slate-900">
                                  {expense.currency} {expense.amount.toFixed(2)}
                                </p>
                                <button
                                  onClick={() => handleDeletePersonalExpense(expense.id)}
                                  className="text-red-600 hover:text-red-700 transition"
                                  title="Delete expense"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents & Files</CardTitle>
            </CardHeader>
            <CardContent>
              {group.documents.length === 0 ? (
                <p className="text-sm text-slate-500">No documents uploaded yet.</p>
              ) : (
                <div className="space-y-3">
                  {group.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
                      <div>
                        <p className="font-medium text-slate-900">{doc.title}</p>
                        <p className="text-xs text-slate-500">
                          {doc.fileType}  {(doc.fileSize / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <Button variant="secondary" size="sm">
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <Button variant="secondary" className="mt-4">
                Upload Document
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Itinerary Tab */}
        <TabsContent value="itinerary">
          <Card>
            <CardHeader>
              <CardTitle>Travel Itinerary</CardTitle>
            </CardHeader>
            <CardContent>
              {group.itinerary.length === 0 ? (
                <p className="text-sm text-slate-500">No itinerary items yet. Add activities and events to plan your trip!</p>
              ) : (
                <div className="space-y-4">
                  {group.itinerary.map((item) => (
                    <div key={item.id} className="border-l-4 border-primary-500 pl-4">
                      <p className="font-medium text-slate-900">{item.title}</p>
                      {item.location && (
                        <p className="text-sm text-slate-600"> {item.location}</p>
                      )}
                      <p className="text-xs text-slate-500">
                        {format(new Date(item.startsAt), "PPP p")} - {format(new Date(item.endsAt), "PPP p")}
                      </p>
                      {item.description && (
                        <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <Button variant="secondary" className="mt-4">
                Add Itinerary Item
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
