import Link from 'next/link';
import { TrendingUp, UsersRound, Wallet, Download, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '../context/AuthContext';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { useGroupsQuery, usePersonalExpensesQuery, useCreatePersonalExpenseMutation, useDeletePersonalExpenseMutation } from '../hooks/useGroupsApi';

export default function Dashboard() {
  const groups = useAppStore((state) => state.groups);
  const lastSyncedAt = useAppStore((state) => state.lastSyncedAt);
  const { user } = useAuth();
  const { data: groupsData, isLoading: isGroupsLoading } = useGroupsQuery();
  const { data: personalExpenses = [] } = usePersonalExpensesQuery();
  const { isSyncing, pendingJobs } = useOfflineSync();
  
  const createPersonalExpenseMutation = useCreatePersonalExpenseMutation();
  const deletePersonalExpenseMutation = useDeletePersonalExpenseMutation();

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    category: 'food',
    currency: 'USD'
  });

  const totalGroups = groupsData?.length || 0;
  const totalMembers = groupsData?.reduce((acc, g) => acc + (g.members?.length || 0), 0) || 0;

  // Calculate total group expenses and user's share
  const totalGroupExpenses = groupsData?.reduce((sum, group) => {
    const expenses = group.expenses || [];
    return sum + expenses.reduce((expSum, exp) => expSum + exp.amount, 0);
  }, 0) || 0;

  // Calculate user's balance across all groups
  const myBalance = groupsData?.reduce((sum, group) => {
    if (!user) return sum;
    
    const expenses = group.expenses || [];
    let paid = 0;
    let owed = 0;
    
    expenses.forEach(expense => {
      // If I paid for this expense
      const payerId = typeof expense.paidBy === 'number' ? expense.paidBy : (expense.paidBy as any)?.id;
      if (payerId === user.id) {
        paid += expense.amount;
      }
      
      // Find my share of this expense
      const myShare = expense.splits?.find(s => s.memberId === user.id);
      if (myShare) {
        owed += myShare.amount;
      }
    });
    
    const balance = paid - owed;
    return sum + balance;
  }, 0) || 0;

  const personalExpenseTotal = personalExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalExpenses = totalGroupExpenses + personalExpenseTotal;

  const handleAddExpense = async () => {
    if (!newExpense.title || !newExpense.amount) return;
    
    try {
      await createPersonalExpenseMutation.mutateAsync({
        title: newExpense.title,
        category: newExpense.category,
        currency: newExpense.currency,
        amount: parseFloat(newExpense.amount),
        incurredOn: new Date().toISOString()
      });
      
      setNewExpense({ title: '', amount: '', category: 'food', currency: 'USD' });
      setShowAddExpense(false);
    } catch (error) {
      console.error('Failed to add expense:', error);
    }
  };

  const handleDeleteExpense = async (expenseId: number) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      await deletePersonalExpenseMutation.mutateAsync(expenseId);
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  };

  const exportToCSV = () => {
    const allExpenses: any[] = [];
    
    groupsData?.forEach(group => {
      group.expenses?.forEach(exp => {
        allExpenses.push({
          Type: 'Group',
          Group: group.title,
          Title: exp.title,
          Amount: exp.amount,
          Currency: exp.currency,
          Category: exp.category,
          Date: exp.incurredOn ? format(new Date(exp.incurredOn), 'yyyy-MM-dd') : ''
        });
      });
    });
    
    personalExpenses.forEach(exp => {
      allExpenses.push({
        Type: 'Personal',
        Group: '-',
        Title: exp.title,
        Amount: exp.amount,
        Currency: exp.currency,
        Category: exp.category,
        Date: exp.incurredOn ? format(new Date(exp.incurredOn), 'yyyy-MM-dd') : ''
      });
    });
    
    if (allExpenses.length === 0) {
      alert('No expenses to export');
      return;
    }
    
    const headers = Object.keys(allExpenses[0]);
    const csvContent = [
      headers.join(','),
      ...allExpenses.map(row => headers.map(h => row[h]).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all-expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <AppLayout
      title="Overview"
      description="Your travel dashboard"
      actions={
        <Button onClick={exportToCSV} variant="secondary">
          <Download className="h-4 w-4 mr-2" />
          Export All
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden">
            <CardContent className="pt-6 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm font-medium text-blue-100">Active Groups</p>
                  <p className="text-4xl font-bold text-white mt-1">{totalGroups}</p>
                  <p className="text-xs text-blue-100 mt-2">✈️ Adventures await</p>
                </div>
                <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                  <UsersRound className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white overflow-hidden">
            <CardContent className="pt-6 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm font-medium text-purple-100">Total Members</p>
                  <p className="text-4xl font-bold text-white mt-1">{totalMembers}</p>
                  <p className="text-xs text-purple-100 mt-2">🌍 Global community</p>
                </div>
                <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-600 text-white overflow-hidden">
            <CardContent className="pt-6 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm font-medium text-orange-100">Total Expenses</p>
                  <p className="text-3xl font-bold text-white mt-1">${totalExpenses.toLocaleString()}</p>
                  <div className="mt-1 space-y-0.5">
                    <p className="text-xs text-orange-100">
                      Groups: ${totalGroupExpenses.toLocaleString()}
                    </p>
                    <p className="text-xs text-orange-100">
                      Personal: ${personalExpenseTotal.toLocaleString()}
                    </p>
                    {myBalance !== 0 && (
                      <p className={`text-xs font-semibold ${myBalance >= 0 ? 'text-white bg-white/20 px-2 py-1 rounded' : 'text-white bg-white/20 px-2 py-1 rounded'}`}>
                        {myBalance >= 0 ? '💰 You are owed' : '💸 You owe'} ${Math.abs(myBalance).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                  <Wallet className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-white/50 bg-white/60 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🌏</span>
                Group Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isGroupsLoading ? (
                <p className="text-sm text-slate-500">Loading...</p>
              ) : groupsData && groupsData.length > 0 ? (
                <div className="space-y-3">
                  {groupsData.map(group => {
                    const groupTotal = group.expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
                    
                    // Calculate my balance in this group
                    const expenses = group.expenses || [];
                    let paid = 0;
                    let owed = 0;
                    
                    expenses.forEach(expense => {
                      const payerId = typeof expense.paidBy === 'number' ? expense.paidBy : (expense.paidBy as any)?.id;
                      if (payerId === user?.id) {
                        paid += expense.amount;
                      }
                      const myShare = expense.splits?.find(s => s.memberId === user?.id);
                      if (myShare) {
                        owed += myShare.amount;
                      }
                    });
                    
                    const myBalance = paid - owed;
                    const recentExpenses = group.expenses?.slice(0, 3) || [];
                    
                    return (
                      <div key={group.id} className="border-b pb-3 last:border-b-0">
                        <Link href={`/groups/${group.id}`}>
                          <div className="flex justify-between items-start hover:bg-slate-50 p-2 rounded cursor-pointer">
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">{group.title}</p>
                              <p className="text-xs text-slate-500">{group.destination}</p>
                              {recentExpenses.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {recentExpenses.map(exp => (
                                    <p key={exp.id} className="text-xs text-slate-600">
                                       {exp.title}: {exp.currency} {exp.amount}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-slate-900">${groupTotal.toFixed(2)}</p>
                              <p className={`text-xs font-medium ${myBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {myBalance >= 0 ? `+$${myBalance.toFixed(2)}` : `-$${Math.abs(myBalance).toFixed(2)}`}
                              </p>
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500 mb-4">No group expenses yet</p>
                  <Link href="/groups">
                    <Button variant="secondary" size="sm">View Groups</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/50 bg-white/60 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">💳</span>
                  Personal Expenses
                </CardTitle>
                <Button
                  size="sm"
                  variant={showAddExpense ? "secondary" : "primary"}
                  onClick={() => setShowAddExpense(!showAddExpense)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showAddExpense && (
                <div className="mb-4 p-4 border rounded-lg bg-slate-50 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={newExpense.title}
                      onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Expense title"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                      <input
                        type="number"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                      <select
                        value={newExpense.currency}
                        onChange={(e) => setNewExpense({ ...newExpense, currency: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="BDT">BDT</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <select
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="food">Food</option>
                      <option value="accommodation">Accommodation</option>
                      <option value="transport">Transport</option>
                      <option value="activities">Activities</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddExpense} disabled={createPersonalExpenseMutation.isPending} className="flex-1">
                      {createPersonalExpenseMutation.isPending ? 'Adding...' : 'Add Expense'}
                    </Button>
                    <Button variant="secondary" onClick={() => setShowAddExpense(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {personalExpenses.length > 0 ? (
                <div className="space-y-2">
                  {personalExpenses.map(expense => (
                    <div key={expense.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-slate-50">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{expense.title}</p>
                        <p className="text-xs text-slate-500">{expense.category}</p>
                        {expense.incurredOn && (
                          <p className="text-xs text-slate-400">
                            {format(new Date(expense.incurredOn), 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">
                            {expense.currency} {expense.amount}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          disabled={deletePersonalExpenseMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-slate-700">Total Personal</p>
                      <p className="font-bold text-slate-900">{personalExpenseTotal.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500">No personal expenses yet</p>
                  <p className="text-xs text-slate-400 mt-1">Click + to add your first expense</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {groupsData && groupsData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Active Trips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupsData.map(group => (
                  <Link key={group.id} href={`/groups/${group.id}`}>
                    <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <h3 className="font-semibold text-slate-900">{group.title}</h3>
                      <p className="text-sm text-slate-600">{group.destination}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <Badge variant="default">{group.members?.length || 0} members</Badge>
                        <p className="text-sm text-slate-500">{group.expenses?.length || 0} expenses</p>
                      </div>
                      {group.startDate && (
                        <p className="text-xs text-slate-400 mt-2">
                          {format(new Date(group.startDate), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
