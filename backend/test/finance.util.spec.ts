
import { calculateGroupBalance, roundCurrency } from '../src/expenses/finance.util';

describe('finance.util', () => {
  const baseMembers = [
    { userId: 1, displayName: 'Alice', role: 'admin' },
    { userId: 2, displayName: 'Bob', role: 'member' },
    { userId: 3, displayName: 'Carol', role: 'member' },
  ];

  it('splits expenses across members and computes balances', () => {
    const expenses = [
      {
        amount: 120,
        currency: 'USD',
        paidById: 1,
        splits: [
          { memberId: 1, amount: 40 },
          { memberId: 2, amount: 40 },
          { memberId: 3, amount: 40 },
        ],
        incurredOn: new Date('2024-01-01T10:00:00Z'),
      },
      {
        amount: 60,
        currency: 'USD',
        paidById: 2,
        splits: [
          { memberId: 1, amount: 20 },
          { memberId: 2, amount: 20 },
          { memberId: 3, amount: 20 },
        ],
        incurredOn: new Date('2024-01-02T12:00:00Z'),
      },
    ];

    const result = calculateGroupBalance(baseMembers, expenses);

    expect(result.members).toEqual([
      { memberId: 1, displayName: 'Alice', role: 'admin', paid: 120, owed: 60, balance: 60 },
      { memberId: 2, displayName: 'Bob', role: 'member', paid: 60, owed: 60, balance: 0 },
      { memberId: 3, displayName: 'Carol', role: 'member', paid: 0, owed: 60, balance: -60 },
    ]);

    expect(result.summary.expensesCount).toBe(2);
    expect(result.summary.amountByCurrency).toEqual({ USD: 180 });
    expect(result.summary.lastExpenseAt).toBe('2024-01-02T12:00:00.000Z');
  });

  it('supports multi-currency tracking', () => {
    const expenses = [
      {
        amount: 100,
        currency: 'USD',
        paidById: 1,
        splits: [
          { memberId: 1, amount: 50 },
          { memberId: 2, amount: 30 },
          { memberId: 3, amount: 20 },
        ],
        incurredOn: new Date('2024-02-01T09:30:00Z'),
      },
      {
        amount: 8000,
        currency: 'BDT',
        paidById: 3,
        splits: [
          { memberId: 1, amount: 4000 },
          { memberId: 2, amount: 2000 },
          { memberId: 3, amount: 2000 },
        ],
        incurredOn: new Date('2024-02-02T15:00:00Z'),
      },
    ];

    const result = calculateGroupBalance(baseMembers, expenses);

    expect(result.summary.amountByCurrency).toEqual({ USD: 100, BDT: 8000 });
    expect(result.members.find((member) => member.memberId === 3)?.paid).toBe(8000);
  });

  it('roundCurrency keeps values at two decimal places', () => {
    expect(roundCurrency(10.005)).toBe(10.01);
    expect(roundCurrency(10.004)).toBe(10);
  });

  it('throws when an expense references a non-member', () => {
    const expenses = [
      {
        amount: 50,
        currency: 'USD',
        paidById: 1,
        splits: [
          { memberId: 99, amount: 50 },
        ],
        incurredOn: new Date(),
      },
    ];

    expect(() => calculateGroupBalance(baseMembers, expenses)).toThrow(/member 99/i);
  });
});
