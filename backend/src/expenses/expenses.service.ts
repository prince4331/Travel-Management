import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Expense } from './expense.entity';
import { Group } from '../groups/group.entity';
import { GroupMember } from '../groups/group-member.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { CreatePersonalExpenseDto } from './dto/create-personal-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { User } from '../users/user.entity';
import { calculateGroupBalance } from './finance.util';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense) private readonly expenseRepo: Repository<Expense>,
    @InjectRepository(Group) private readonly groupRepo: Repository<Group>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async addExpense(groupId: number, dto: CreateExpenseDto, requesterId: number) {
    const group = await this.groupRepo.findOne({
      where: { id: groupId },
      relations: ['members', 'members.user'],
    });
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const requesterMember = group.members.find((member) => member.user.id === requesterId);
    if (!requesterMember) {
      throw new BadRequestException('You must be part of this group to add expenses');
    }

    const payerMember = group.members.find((member) => member.user.id === dto.paidById);
    if (!payerMember) {
      throw new BadRequestException('Paid by user must belong to the group');
    }

    const memberLookup = new Map<number, GroupMember>();
    for (const member of group.members) {
      memberLookup.set(member.user.id, member);
    }

    for (const split of dto.splits) {
      if (!memberLookup.has(split.memberId)) {
        throw new BadRequestException(`Member ${split.memberId} is not part of this group`);
      }
    }

    const totalSplit = dto.splits.reduce((sum, split) => sum + split.amount, 0);
    if (Math.abs(totalSplit - dto.amount) > 0.01) {
      throw new BadRequestException('Expense splits must total the full amount');
    }

    const paidByUser = await this.userRepo.findOne({ where: { id: payerMember.user.id } });
    if (!paidByUser) {
      throw new NotFoundException('Paid by user not found');
    }

    const expense = this.expenseRepo.create({
      group,
      title: dto.title,
      description: dto.description ?? null,
      category: dto.category,
      expenseType: dto.expenseType ?? 'group',
      currency: dto.currency,
      amount: dto.amount,
      splits: dto.splits,
      paidBy: paidByUser,
      incurredOn: new Date(dto.incurredOn),
    });

    await this.expenseRepo.save(expense);

    return {
      id: expense.id,
      title: expense.title,
      description: expense.description ?? null,
      category: expense.category,
      expenseType: expense.expenseType,
      currency: expense.currency,
      amount: Number(expense.amount),
      splits: expense.splits,
      paidBy: {
        id: expense.paidBy.id,
        email: expense.paidBy.email,
      },
      incurredOn: expense.incurredOn.toISOString(),
      createdAt: expense.createdAt.toISOString(),
    };
  }

  async getGroupBalance(groupId: number, requesterId: number) {
    const group = await this.groupRepo.findOne({
      where: { id: groupId },
      relations: ['members', 'members.user'],
    });
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const requesterMember = group.members.find((m) => m.user.id === requesterId);
    if (!requesterMember) {
      throw new BadRequestException('You must be a member of this group');
    }

    const expenses = await this.expenseRepo.find({
      where: { group: { id: groupId } },
      relations: ['paidBy'],
    });

    const memberInputs = group.members.map((member) => ({
      userId: member.user.id,
      displayName: member.displayName ?? member.user.email,
      role: member.role,
    }));

    const expenseInputs = expenses.map((expense) => ({
      amount: Number(expense.amount),
      currency: expense.currency,
      paidById: expense.paidBy.id,
      splits: expense.splits,
      incurredOn: expense.incurredOn,
    }));

    const balance = calculateGroupBalance(memberInputs, expenseInputs);

    // Check if user can see full financial details
    const isAdmin = requesterMember.role === 'admin' || requesterMember.role === 'co-admin';
    const canSeeFull = group.showFinancialDetailsToMembers || isAdmin;

    // In paid tours, non-admins see NO financial data at all
    if (!canSeeFull) {
      return {
        groupId,
        canSeeFull: false,
        tourType: group.tourType,
        members: [],
        totals: {
          expensesCount: 0,
          amountByCurrency: {},
          lastExpenseAt: null,
        },
      };
    }

    // Admins or friendly tour members see all financial data
    return {
      groupId,
      canSeeFull: true,
      tourType: group.tourType,
      members: balance.members.map((member) => ({
        memberId: member.memberId,
        displayName: member.displayName ?? null,
        role: member.role,
        paid: member.paid,
        owed: member.owed,
        balance: member.balance,
      })),
      totals: {
        expensesCount: balance.summary.expensesCount,
        amountByCurrency: balance.summary.amountByCurrency,
        lastExpenseAt: balance.summary.lastExpenseAt,
      },
    };
  }

  async listGroupExpenses(groupId: number, requesterId: number) {
    const group = await this.groupRepo.findOne({
      where: { id: groupId },
      relations: ['members', 'members.user'],
    });
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const requester = await this.userRepo.findOne({ where: { id: requesterId }, relations: ['role'] });
    if (!requester) {
      throw new NotFoundException('User not found');
    }

    const isMember = group.members.some((member) => member.user.id === requesterId);
    const isSuperAdmin = requester.role?.name === 'super_admin';
    if (!isMember && !isSuperAdmin) {
      throw new BadRequestException('You must be a group member to view expenses');
    }

    // Check if user can see financial details
    const requesterMember = group.members.find((m) => m.user.id === requesterId);
    const isAdmin = requesterMember?.role === 'admin' || requesterMember?.role === 'co-admin';
    const canSeeFull = group.showFinancialDetailsToMembers || isAdmin || isSuperAdmin;

    // In paid tours, non-admins see NO expense data
    if (!canSeeFull) {
      return [];
    }

    const expenses = await this.expenseRepo.find({
      where: { group: { id: groupId } },
      relations: ['paidBy'],
      order: { incurredOn: 'DESC' },
    });

    return expenses.map((expense) => ({
      id: expense.id,
      title: expense.title,
      description: expense.description ?? null,
      category: expense.category,
      expenseType: expense.expenseType,
      currency: expense.currency,
      amount: Number(expense.amount),
      splits: expense.splits,
      paidBy: {
        id: expense.paidBy.id,
        email: expense.paidBy.email,
      },
      incurredOn: expense.incurredOn.toISOString(),
      createdAt: expense.createdAt.toISOString(),
    }));
  }

  async updateExpense(groupId: number, expenseId: number, dto: UpdateExpenseDto, requesterId: number) {
    const expense = await this.expenseRepo.findOne({
      where: { id: expenseId, group: { id: groupId } },
      relations: ['group', 'group.members', 'group.members.user', 'paidBy'],
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    const requesterMember = expense.group.members.find((member) => member.user.id === requesterId);
    const requester = await this.userRepo.findOne({ where: { id: requesterId }, relations: ['role'] });
    const isSuperAdmin = requester?.role?.name === 'super_admin';

    if (!requesterMember || (!['admin', 'co-admin'].includes(requesterMember.role) && !isSuperAdmin)) {
      throw new BadRequestException('Only admins can update expenses');
    }

    if (dto.title !== undefined) expense.title = dto.title;
    if (dto.description !== undefined) expense.description = dto.description;
    if (dto.category !== undefined) expense.category = dto.category;
    if (dto.expenseType !== undefined) expense.expenseType = dto.expenseType;
    if (dto.currency !== undefined) expense.currency = dto.currency;
    if (dto.amount !== undefined) expense.amount = dto.amount;
    if (dto.incurredOn !== undefined) expense.incurredOn = new Date(dto.incurredOn);

    if (dto.paidById !== undefined) {
      const payerMember = expense.group.members.find((member) => member.user.id === dto.paidById);
      if (!payerMember) {
        throw new BadRequestException('Paid by user must belong to the group');
      }
      const paidByUser = await this.userRepo.findOne({ where: { id: dto.paidById } });
      if (!paidByUser) {
        throw new NotFoundException('Paid by user not found');
      }
      expense.paidBy = paidByUser;
    }

    if (dto.splits !== undefined) {
      const memberLookup = new Map<number, GroupMember>();
      for (const member of expense.group.members) {
        memberLookup.set(member.user.id, member);
      }

      for (const split of dto.splits) {
        if (!memberLookup.has(split.memberId)) {
          throw new BadRequestException(`Member ${split.memberId} is not part of this group`);
        }
      }

      const totalSplit = dto.splits.reduce((sum, split) => sum + split.amount, 0);
      const amount = dto.amount !== undefined ? dto.amount : Number(expense.amount);
      if (Math.abs(totalSplit - amount) > 0.01) {
        throw new BadRequestException('Expense splits must total the full amount');
      }

      expense.splits = dto.splits;
    }

    await this.expenseRepo.save(expense);

    return {
      id: expense.id,
      title: expense.title,
      description: expense.description ?? null,
      category: expense.category,
      expenseType: expense.expenseType,
      currency: expense.currency,
      amount: Number(expense.amount),
      splits: expense.splits,
      paidBy: {
        id: expense.paidBy.id,
        email: expense.paidBy.email,
      },
      incurredOn: expense.incurredOn.toISOString(),
      createdAt: expense.createdAt.toISOString(),
    };
  }

  async deleteExpense(groupId: number, expenseId: number, requesterId: number): Promise<void> {
    const expense = await this.expenseRepo.findOne({
      where: { id: expenseId, group: { id: groupId } },
      relations: ['group', 'group.members', 'group.members.user'],
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    const requesterMember = expense.group.members.find((member) => member.user.id === requesterId);
    const requester = await this.userRepo.findOne({ where: { id: requesterId }, relations: ['role'] });
    const isSuperAdmin = requester?.role?.name === 'super_admin';

    if (!requesterMember || (!['admin', 'co-admin'].includes(requesterMember.role) && !isSuperAdmin)) {
      throw new BadRequestException('Only admins can delete expenses');
    }

    await this.expenseRepo.remove(expense);
  }

  // Personal Expenses (not linked to any group)
  async createPersonalExpense(userId: number, dto: CreatePersonalExpenseDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const expense = new Expense();
    expense.title = dto.title;
    expense.description = dto.description;
    expense.category = dto.category;
    expense.currency = dto.currency;
    expense.amount = dto.amount;
    expense.expenseType = 'personal';
    expense.incurredOn = new Date(dto.incurredOn);
    expense.paidBy = user;
    expense.splits = [{ memberId: userId, amount: dto.amount }];
    expense.group = null;

    await this.expenseRepo.save(expense);

    return {
      id: expense.id,
      title: expense.title,
      description: expense.description ?? null,
      category: expense.category,
      currency: expense.currency,
      amount: Number(expense.amount),
      incurredOn: expense.incurredOn.toISOString(),
      createdAt: expense.createdAt.toISOString(),
    };
  }

  async getUserPersonalExpenses(userId: number) {
    const expenses = await this.expenseRepo.find({
      where: {
        paidBy: { id: userId },
        group: IsNull(), // Only personal expenses (not group expenses)
      },
      order: { incurredOn: 'DESC' },
    });

    return expenses.map((expense) => ({
      id: expense.id,
      title: expense.title,
      description: expense.description ?? null,
      category: expense.category,
      currency: expense.currency,
      amount: Number(expense.amount),
      incurredOn: expense.incurredOn.toISOString(),
      createdAt: expense.createdAt.toISOString(),
    }));
  }

  async deletePersonalExpense(userId: number, expenseId: number): Promise<void> {
    const expense = await this.expenseRepo.findOne({
      where: { id: expenseId, paidBy: { id: userId }, group: IsNull() },
    });

    if (!expense) {
      throw new NotFoundException('Personal expense not found');
    }

    await this.expenseRepo.remove(expense);
  }
}
