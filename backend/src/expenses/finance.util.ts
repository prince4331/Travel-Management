
export interface BalanceMemberInput {
  userId: number;
  displayName?: string | null;
  role: string;
}

export interface BalanceExpenseInput {
  amount: number;
  currency: string;
  paidById: number;
  splits: Array<{
    memberId: number;
    amount: number;
  }>;
  incurredOn: Date;
}

export interface MemberBalance {
  memberId: number;
  displayName: string | null;
  role: string;
  paid: number;
  owed: number;
  balance: number;
}

export interface BalanceSummary {
  expensesCount: number;
  amountByCurrency: Record<string, number>;
  lastExpenseAt: string | null;
}

export interface BalanceResult {
  members: MemberBalance[];
  summary: BalanceSummary;
}

export const roundCurrency = (value: number): number => Math.round(value * 100) / 100;

export function calculateGroupBalance(
  members: BalanceMemberInput[],
  expenses: BalanceExpenseInput[],
): BalanceResult {
  const memberMap = new Map<number, MemberBalance>();
  const currencyTotals = new Map<string, number>();

  for (const member of members) {
    memberMap.set(member.userId, {
      memberId: member.userId,
      displayName: member.displayName ?? null,
      role: member.role,
      paid: 0,
      owed: 0,
      balance: 0,
    });
  }

  for (const expense of expenses) {
    if (!memberMap.has(expense.paidById)) {
      throw new Error(`Expense payer ${expense.paidById} is not part of this group`);
    }

    const paidEntry = memberMap.get(expense.paidById)!;
    paidEntry.paid += expense.amount;

    const existingCurrency = currencyTotals.get(expense.currency) ?? 0;
    currencyTotals.set(expense.currency, existingCurrency + expense.amount);

    for (const split of expense.splits) {
      if (!memberMap.has(split.memberId)) {
        throw new Error(`Expense split member ${split.memberId} is not part of this group`);
      }
      const splitEntry = memberMap.get(split.memberId)!;
      splitEntry.owed += split.amount;
    }
  }

  for (const entry of memberMap.values()) {
    entry.paid = roundCurrency(entry.paid);
    entry.owed = roundCurrency(entry.owed);
    entry.balance = roundCurrency(entry.paid - entry.owed);
  }

  const lastExpenseAt =
    expenses.length > 0
      ? new Date(Math.max(...expenses.map((expense) => expense.incurredOn.getTime()))).toISOString()
      : null;

  const summary: BalanceSummary = {
    expensesCount: expenses.length,
    amountByCurrency: Object.fromEntries(
      Array.from(currencyTotals.entries()).map(([currency, total]) => [currency, roundCurrency(total)]),
    ),
    lastExpenseAt,
  };

  return {
    members: Array.from(memberMap.values()),
    summary,
  };
}
