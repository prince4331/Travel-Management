import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { Group } from './group.entity';
import { GroupMember, GroupMemberRole } from './group-member.entity';
import { GroupInvite } from './group-invite.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { CreateInviteDto } from './dto/create-invite.dto';
import { CreateGroupMemberDto } from './dto/create-group-member.dto';
import { User } from '../users/user.entity';
import { Role } from '../auth/role.entity';
import { Expense } from '../expenses/expense.entity';

export interface GroupResponse {
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
  tourType: 'friendly' | 'paid';
  showFinancialDetailsToMembers: boolean;
  createdAt: string;
  updatedAt: string;
  financeSummary: {
    totalExpenses: number;
    totalMembers: number;
    outstandingBalance: number;
  };
  members: Array<{
    id: number;
    role: GroupMemberRole;
    status: string;
    displayName?: string | null;
    joinedAt: string;
    user: {
      id: number;
      email: string;
      phone: string;
      photoUrl?: string | null;
      bloodGroup?: string | null;
      emergencyContact?: string | null;
    };
  }>;
  invites: Array<{
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
  }>;
  expenses: Array<{
    id: number;
    title: string;
    description?: string | null;
    category: string;
    currency: string;
    amount: number;
    splits: Expense['splits'];
    paidBy: {
      id: number;
      email: string;
    };
    incurredOn: string;
    createdAt: string;
  }>;
  documents: Array<{
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
  }>;
  itinerary: any[];
  emergencyContacts: any[];
  offlinePackages: any[];
}

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group) private readonly groupRepo: Repository<Group>,
    @InjectRepository(GroupMember) private readonly memberRepo: Repository<GroupMember>,
    @InjectRepository(GroupInvite) private readonly inviteRepo: Repository<GroupInvite>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async listGroupsForUser(userId: number): Promise<GroupResponse[]> {
    const user = await this.userRepo.findOne({ where: { id: userId }, relations: ['role'] });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role?.name === 'super_admin') {
      const groups = await this.groupRepo.find({
        relations: [
          'members',
          'members.user',
          'invites',
          'invites.createdBy',
          'expenses',
          'expenses.paidBy',
          'documents',
          'documents.createdBy',
        ],
        order: { createdAt: 'DESC' },
      });
      return groups.map((group) => this.buildGroupResponse(group));
    }

    const memberships = await this.memberRepo.find({
      where: { user: { id: userId } },
      relations: ['group'],
    });

    if (memberships.length === 0) {
      return [];
    }

    const uniqueGroupIds = Array.from(new Set(memberships.map((membership) => membership.group.id)));
    const results: GroupResponse[] = [];

    for (const groupId of uniqueGroupIds) {
      const group = await this.loadGroup(groupId);
      await this.ensureAccess(group, userId, true);
      results.push(this.buildGroupResponse(group));
    }

    return results;
  }

  async createGroup(dto: CreateGroupDto, creatorId: number): Promise<GroupResponse> {
    if (new Date(dto.endDate) < new Date(dto.startDate)) {
      throw new BadRequestException('End date must be after start date');
    }

    const creator = await this.userRepo.findOne({ where: { id: creatorId }, relations: ['role'] });
    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    const inviteCode = await this.generateUniqueInviteCode();
    const group = this.groupRepo.create({
      title: dto.title,
      description: dto.description,
      destination: dto.destination,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      isPublic: dto.isPublic,
      coverImage: dto.coverImage ?? null,
      inviteCode,
      guides: dto.guides ?? [],
      tags: dto.tags ?? [],
      tourType: dto.tourType ?? 'friendly',
      showFinancialDetailsToMembers: dto.showFinancialDetailsToMembers ?? true,
    });
    await this.groupRepo.save(group);
    
    console.log('=== GROUP CREATED ===');
    console.log('Group ID after save:', group.id);
    console.log('Group object:', { id: group.id, title: group.title, inviteCode: group.inviteCode });

    await this.memberRepo.save(
      this.memberRepo.create({
        group,
        user: creator,
        role: 'admin',
        status: 'active',
        displayName: dto.members?.find((member) => member.userId === creatorId)?.displayName ?? null,
      }),
    );

    if (dto.members?.length) {
      await this.addInitialMembers(group, dto.members.filter((member) => member.userId !== creatorId));
    }

    const hydrated = await this.loadGroup(group.id);
    console.log('Hydrated group ID:', hydrated.id);
    const response = this.buildGroupResponse(hydrated);
    console.log('Response group ID:', response.id);
    return response;
  }

  async getGroupById(groupId: number, requesterId: number): Promise<GroupResponse> {
    const group = await this.loadGroup(groupId);
    await this.ensureAccess(group, requesterId, false);
    return this.buildGroupResponse(group);
  }

  async updateGroup(groupId: number, dto: UpdateGroupDto, requesterId: number): Promise<GroupResponse> {
    const group = await this.loadGroup(groupId);
    const requesterMember = group.members.find((member) => member.user.id === requesterId);
    
    const user = await this.userRepo.findOne({ where: { id: requesterId }, relations: ['role'] });
    const isSuperAdmin = user?.role?.name === 'super_admin';

    if (!requesterMember || (!['admin', 'co-admin'].includes(requesterMember.role) && !isSuperAdmin)) {
      throw new BadRequestException('Only admins can update this group');
    }

    if (dto.title !== undefined) group.title = dto.title;
    if (dto.description !== undefined) group.description = dto.description;
    if (dto.destination !== undefined) group.destination = dto.destination;
    if (dto.startDate !== undefined) group.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) group.endDate = new Date(dto.endDate);
    if (dto.isPublic !== undefined) group.isPublic = dto.isPublic;
    if (dto.coverImage !== undefined) group.coverImage = dto.coverImage;
    if (dto.guides !== undefined) group.guides = dto.guides;
    if (dto.tags !== undefined) group.tags = dto.tags;
    if (dto.tourType !== undefined) group.tourType = dto.tourType;
    if (dto.showFinancialDetailsToMembers !== undefined) group.showFinancialDetailsToMembers = dto.showFinancialDetailsToMembers;

    if (group.endDate < group.startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    await this.groupRepo.save(group);
    const updated = await this.loadGroup(groupId);
    return this.buildGroupResponse(updated);
  }

  async deleteGroup(groupId: number, requesterId: number): Promise<void> {
    const group = await this.loadGroup(groupId);
    const requesterMember = group.members.find((member) => member.user.id === requesterId);
    
    const user = await this.userRepo.findOne({ where: { id: requesterId }, relations: ['role'] });
    const isSuperAdmin = user?.role?.name === 'super_admin';

    if (!requesterMember || (requesterMember.role !== 'admin' && !isSuperAdmin)) {
      throw new BadRequestException('Only group admins can delete this group');
    }

    await this.groupRepo.remove(group);
  }

  async removeMember(groupId: number, memberId: number, requesterId: number): Promise<void> {
    const group = await this.loadGroup(groupId);
    const requesterMember = group.members.find((member) => member.user.id === requesterId);
    
    const user = await this.userRepo.findOne({ where: { id: requesterId }, relations: ['role'] });
    const isSuperAdmin = user?.role?.name === 'super_admin';

    if (!requesterMember || (!['admin', 'co-admin'].includes(requesterMember.role) && !isSuperAdmin)) {
      throw new BadRequestException('Only admins can remove members');
    }

    const memberToRemove = await this.memberRepo.findOne({
      where: { group: { id: groupId }, user: { id: memberId } },
    });

    if (!memberToRemove) {
      throw new NotFoundException('Member not found in this group');
    }

    // Prevent removing the last admin
    if (memberToRemove.role === 'admin') {
      const adminCount = group.members.filter((m) => m.role === 'admin').length;
      if (adminCount <= 1) {
        throw new BadRequestException('Cannot remove the last admin from the group');
      }
    }

    await this.memberRepo.remove(memberToRemove);
    
    // AUTO-RECALCULATE: Update all existing expense splits after member removal
    await this.recalculateExpenseSplits(groupId);
  }

  async updateMemberRole(groupId: number, memberId: number, newRole: string, requesterId: number): Promise<void> {
    const group = await this.loadGroup(groupId);
    const requesterMember = group.members.find((member) => member.user.id === requesterId);
    
    const user = await this.userRepo.findOne({ where: { id: requesterId }, relations: ['role'] });
    const isSuperAdmin = user?.role?.name === 'super_admin';

    if (!requesterMember || (requesterMember.role !== 'admin' && !isSuperAdmin)) {
      throw new BadRequestException('Only admins can change member roles');
    }

    if (!['admin', 'co-admin', 'member'].includes(newRole)) {
      throw new BadRequestException('Invalid role');
    }

    const memberToUpdate = await this.memberRepo.findOne({
      where: { group: { id: groupId }, user: { id: memberId } },
    });

    if (!memberToUpdate) {
      throw new NotFoundException('Member not found in this group');
    }

    // Prevent removing the last admin
    if (memberToUpdate.role === 'admin' && newRole !== 'admin') {
      const adminCount = group.members.filter((m) => m.role === 'admin').length;
      if (adminCount <= 1) {
        throw new BadRequestException('Cannot change the role of the last admin');
      }
    }

    memberToUpdate.role = newRole as GroupMemberRole;
    await this.memberRepo.save(memberToUpdate);
  }

  async listMembers(groupId: number, requesterId: number) {
    const group = await this.loadGroup(groupId);
    await this.ensureAccess(group, requesterId, true);
    return group.members.map((member) => ({
      id: member.user.id,
      role: member.role,
      status: member.status,
      displayName: member.displayName,
      joinedAt: member.joinedAt.toISOString(),
      user: {
        id: member.user.id,
        email: member.user.email,
        phone: member.user.phone,
        photoUrl: member.user.photoUrl ?? null,
        bloodGroup: member.user.bloodGroup ?? null,
        emergencyContact: member.user.emergencyContact ?? null,
      },
    }));
  }

  async createInvite(groupId: number, dto: CreateInviteDto, requesterId: number) {
    const group = await this.loadGroup(groupId);
    const requesterMember = group.members.find((member) => member.user.id === requesterId);
    if (!requesterMember || !['admin', 'co-admin'].includes(requesterMember.role)) {
      throw new BadRequestException('Only admins can create invite links');
    }

    const code = await this.generateUniqueInviteCode();
    const invite = this.inviteRepo.create({
      group,
      code,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      usageLimit: dto.usageLimit ?? null,
      createdBy: requesterMember.user,
    });
    await this.inviteRepo.save(invite);

    return {
      id: invite.id,
      code: invite.code,
      expiresAt: invite.expiresAt?.toISOString() ?? null,
      usageLimit: invite.usageLimit ?? null,
      usedCount: invite.usedCount,
      createdAt: invite.createdAt.toISOString(),
      createdBy: {
        id: requesterMember.user.id,
        email: requesterMember.user.email,
      },
    };
  }

  async addMemberDirectly(groupId: number, dto: CreateGroupMemberDto, requesterId: number) {
    const group = await this.loadGroup(groupId);
    const requesterMember = group.members.find((member) => member.user.id === requesterId);
    
    const user = await this.userRepo.findOne({ where: { id: requesterId }, relations: ['role'] });
    const isSuperAdmin = user?.role?.name === 'super_admin';

    // Allow group admins, co-admins, or super admins to add members
    if (!requesterMember) {
      throw new BadRequestException('You must be a member of this group to add others');
    }
    
    if (!['admin', 'co-admin'].includes(requesterMember.role) && !isSuperAdmin) {
      throw new BadRequestException('Only group admins can add members');
    }

    let userToAdd: User | null = null;

    // Try to find existing user by ID, email, or phone
    if (dto.userId) {
      userToAdd = await this.userRepo.findOne({ where: { id: dto.userId } });
    } else if (dto.email) {
      userToAdd = await this.userRepo.findOne({ where: { email: dto.email } });
    } else if (dto.phone) {
      userToAdd = await this.userRepo.findOne({ where: { phone: dto.phone } });
    }

    // If user doesn't exist, create a new one
    if (!userToAdd) {
      if (!dto.email && !dto.phone) {
        throw new BadRequestException('Either userId, email, or phone is required to add a member');
      }

      // Get or create the default 'member' role
      let defaultRole = await this.userRepo.manager.findOne(Role, { 
        where: { name: 'member' } 
      });

      if (!defaultRole) {
        // Auto-create the role if it doesn't exist
        defaultRole = this.userRepo.manager.create(Role, { name: 'member' });
        await this.userRepo.manager.save(defaultRole);
      }

      // Create new user
      const defaultPassword = dto.password || Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      userToAdd = this.userRepo.create({
        email: dto.email || `user_${Date.now()}@temp.com`,
        phone: dto.phone || `+${Date.now()}`,
        password: hashedPassword,
        role: defaultRole,
      });

      await this.userRepo.save(userToAdd);
    }

    // Check if user is already a member
    const existingMember = await this.memberRepo.findOne({
      where: { group: { id: groupId }, user: { id: userToAdd.id } },
    });

    if (existingMember) {
      throw new BadRequestException('User is already a member of this group');
    }

    // Add user to group
    const member = this.memberRepo.create({
      group,
      user: userToAdd,
      role: dto.role ?? 'member',
      status: 'active',
      displayName: dto.displayName ?? null,
    });

    await this.memberRepo.save(member);

    // AUTO-RECALCULATE: Update all existing expense splits to include new member
    await this.recalculateExpenseSplits(groupId);

    return {
      id: member.id,
      role: member.role,
      status: member.status,
      displayName: member.displayName,
      joinedAt: member.joinedAt.toISOString(),
      user: {
        id: userToAdd.id,
        email: userToAdd.email,
        phone: userToAdd.phone,
        photoUrl: userToAdd.photoUrl,
        bloodGroup: userToAdd.bloodGroup,
        emergencyContact: userToAdd.emergencyContact,
      },
    };
  }

  private async addInitialMembers(group: Group, members: CreateGroupMemberDto[]) {
    for (const input of members) {
      const user = await this.userRepo.findOne({ where: { id: input.userId } });
      if (!user) {
        throw new NotFoundException(`User ${input.userId} not found`);
      }

      const exists = await this.memberRepo.findOne({
        where: { group: { id: group.id }, user: { id: user.id } },
      });
      if (exists) continue;

      const member = this.memberRepo.create({
        group,
        user,
        role: input.role ?? 'member',
        status: 'invited',
        displayName: input.displayName ?? null,
      });
      await this.memberRepo.save(member);
    }
  }

  private async loadGroup(groupId: number): Promise<Group> {
    const group = await this.groupRepo.findOne({
      where: { id: groupId },
      relations: [
        'members',
        'members.user',
        'invites',
        'invites.createdBy',
        'expenses',
        'expenses.paidBy',
        'documents',
        'documents.createdBy',
      ],
    });
    if (!group) {
      throw new NotFoundException('Group not found');
    }
    return group;
  }

  private buildGroupResponse(group: Group): GroupResponse {
    const totalExpenses = group.expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

    return {
      id: group.id,
      title: group.title,
      description: group.description ?? null,
      destination: group.destination,
      startDate: group.startDate.toISOString(),
      endDate: group.endDate.toISOString(),
      isPublic: group.isPublic,
      inviteCode: group.inviteCode,
      coverImage: group.coverImage ?? null,
      guides: group.guides ?? [],
      tags: group.tags ?? [],
      tourType: group.tourType ?? 'friendly',
      showFinancialDetailsToMembers: group.showFinancialDetailsToMembers ?? true,
      createdAt: group.createdAt.toISOString(),
      updatedAt: group.updatedAt.toISOString(),
      financeSummary: {
        totalExpenses,
        totalMembers: group.members.length,
        outstandingBalance: 0,
      },
      members: group.members.map((member) => ({
        id: member.user.id,
        role: member.role,
        status: member.status,
        displayName: member.displayName ?? null,
        joinedAt: member.joinedAt.toISOString(),
        user: {
          id: member.user.id,
          email: member.user.email,
          phone: member.user.phone,
          photoUrl: member.user.photoUrl ?? null,
          bloodGroup: member.user.bloodGroup ?? null,
          emergencyContact: member.user.emergencyContact ?? null,
        },
      })),
      invites: group.invites.map((invite) => ({
        id: invite.id,
        code: invite.code,
        expiresAt: invite.expiresAt?.toISOString() ?? null,
        usageLimit: invite.usageLimit ?? null,
        usedCount: invite.usedCount,
        createdAt: invite.createdAt.toISOString(),
        createdBy: {
          id: invite.createdBy.id,
          email: invite.createdBy.email,
        },
      })),
      expenses: group.expenses.map((expense) => ({
        id: expense.id,
        title: expense.title,
        description: expense.description ?? null,
        category: expense.category,
        currency: expense.currency,
        amount: Number(expense.amount),
        splits: expense.splits,
        paidBy: {
          id: expense.paidBy.id,
          email: expense.paidBy.email,
        },
        incurredOn: expense.incurredOn.toISOString(),
        createdAt: expense.createdAt.toISOString(),
      })),
      documents: (group.documents ?? []).map((document) => ({
        id: document.id,
        title: document.title,
        description: document.description ?? null,
        fileType: document.fileType,
        fileSize: document.fileSize,
        storageKey: document.storageKey,
        ownerType: document.ownerType,
        ownerId: document.ownerId,
        expiresAt: document.expiresAt?.toISOString() ?? null,
        isEncrypted: document.isEncrypted,
        createdAt: document.createdAt.toISOString(),
        createdBy: {
          id: document.createdBy.id,
          email: document.createdBy.email,
        },
      })),
      itinerary: [],
      emergencyContacts: [],
      offlinePackages: [],
    };
  }

  private async generateUniqueInviteCode(): Promise<string> {
    const candidate = randomBytes(4).toString('hex').toUpperCase();
    const existingGroup = await this.groupRepo.findOne({ where: { inviteCode: candidate } });
    const existingInvite = await this.inviteRepo.findOne({ where: { code: candidate } });
    if (existingGroup || existingInvite) {
      return this.generateUniqueInviteCode();
    }
    return candidate;
  }

  private async ensureAccess(group: Group, requesterId: number, requireMembership: boolean) {
    const user = await this.userRepo.findOne({ where: { id: requesterId }, relations: ['role'] });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMember = group.members.some((member) => member.user.id === requesterId);
    const isSuperAdmin = user.role?.name === 'super_admin';

    if (requireMembership) {
      if (!isMember && !isSuperAdmin) {
        throw new BadRequestException('You must be a group member to view this resource');
      }
    } else if (!group.isPublic && !isMember && !isSuperAdmin) {
      throw new BadRequestException('Access denied');
    }
  }

  /**
   * Automatically recalculate expense splits when members are added/removed
   * This ensures all expenses are always split equally among current members
   */
  private async recalculateExpenseSplits(groupId: number): Promise<void> {
    // Get all current active members
    const members = await this.memberRepo.find({
      where: { group: { id: groupId }, status: 'active' },
      relations: ['user'],
    });

    if (members.length === 0) {
      return; // No members, nothing to split
    }

    // Get all expenses for this group
    const expenses = await this.groupRepo.manager.find(Expense, {
      where: { group: { id: groupId } },
    });

    // Recalculate splits for each expense
    for (const expense of expenses) {
      const memberCount = members.length;
      const amount = Number(expense.amount);
      
      // Calculate equal split with rounding
      const splitAmount = Math.floor((amount / memberCount) * 100) / 100;
      
      // Create new splits array
      const newSplits = members.map((member, index) => {
        const isLast = index === memberCount - 1;
        const memberAmount = isLast
          ? Number((amount - (splitAmount * (memberCount - 1))).toFixed(2)) // Last member gets remainder
          : Number(splitAmount);
        
        return {
          memberId: member.user.id,
          amount: memberAmount,
        };
      });

      // Update expense splits
      expense.splits = newSplits;
      await this.groupRepo.manager.save(Expense, expense);
    }
  }
}
