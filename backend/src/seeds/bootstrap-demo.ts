import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source';
import { Role } from '../auth/role.entity';
import { User } from '../users/user.entity';
import { Group } from '../groups/group.entity';
import { GroupMember } from '../groups/group-member.entity';
import { GroupInvite } from '../groups/group-invite.entity';
import { Document } from '../documents/document.entity';
import { DocumentStorageService } from '../documents/document-storage.service';
import { Expense } from '../expenses/expense.entity';

async function seedDemoData() {
  await AppDataSource.initialize();

  const roleRepo = AppDataSource.getRepository(Role);
  const userRepo = AppDataSource.getRepository(User);
  const groupRepo = AppDataSource.getRepository(Group);
  const memberRepo = AppDataSource.getRepository(GroupMember);
  const inviteRepo = AppDataSource.getRepository(GroupInvite);
  const documentRepo = AppDataSource.getRepository(Document);
  const expenseRepo = AppDataSource.getRepository(Expense);

  const storage = new DocumentStorageService();

  let adminRole = await roleRepo.findOne({ where: { name: 'admin' } });
  if (!adminRole) {
    adminRole = roleRepo.create({ name: 'admin' });
    await roleRepo.save(adminRole);
  }

  let adminUser = await userRepo.findOne({ where: { email: 'demo.admin@travel.app' }, relations: ['role'] });
  if (!adminUser) {
    adminUser = userRepo.create({
      email: 'demo.admin@travel.app',
      phone: '+15555550100',
      password: await bcrypt.hash('Password123!', 10),
      role: adminRole,
      bloodGroup: 'O+',
      emergencyContact: 'HQ +15555550000',
    });
    await userRepo.save(adminUser);
  }

  let group = await groupRepo.findOne({ where: { inviteCode: 'DEMO2025' } });
  if (!group) {
    group = groupRepo.create({
      title: 'Global Responder Summit',
      description: 'Cross-agency coordination drill with offline-first packet relay.',
      destination: 'Reykjavík, Iceland',
      startDate: new Date(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4),
      isPublic: false,
      inviteCode: 'DEMO2025',
      guides: ['Emergency communications', 'Iceland winter travel'],
      tags: ['training', 'safety'],
    });
    await groupRepo.save(group);
  }

  const existingMember = await memberRepo.findOne({ where: { group: { id: group.id }, user: { id: adminUser.id } } });
  if (!existingMember) {
    const member = memberRepo.create({
      group,
      user: adminUser,
      role: 'admin',
      status: 'active',
      displayName: 'Command Lead',
    });
    await memberRepo.save(member);
  }

  const existingInvite = await inviteRepo.findOne({ where: { code: 'DEMO2025' } });
  if (!existingInvite) {
    const invite = inviteRepo.create({
      group,
      code: 'DEMO2025',
      createdBy: adminUser,
      usageLimit: 25,
    });
    await inviteRepo.save(invite);
  }

  const existingDocument = await documentRepo.findOne({ where: { title: 'Operations Checklist', group: { id: group.id } } });
  if (!existingDocument) {
    const storageKey = storage.generateStorageKey('group', group.id.toString(), 'operations-checklist.pdf');
    const document = documentRepo.create({
      ownerType: 'group',
      ownerId: group.id.toString(),
      title: 'Operations Checklist',
      description: 'Pre-mission verification steps for field teams.',
      fileType: 'pdf',
      fileSize: 256000,
      storageKey,
      isEncrypted: true,
      metadata: storage.buildMetadata({ seeded: true }),
      createdBy: adminUser,
      group,
    });
    await documentRepo.save(document);
  }

  const existingExpense = await expenseRepo.findOne({ where: { title: 'Satellite SMS Pack', group: { id: group.id } } });
  if (!existingExpense) {
    const expense = expenseRepo.create({
      group,
      title: 'Satellite SMS Pack',
      description: 'Prepaid SMS credits for mesh fallback notifications.',
      category: 'gear',
      currency: 'USD',
      amount: 480,
      splits: [{ memberId: adminUser.id, amount: 480 }],
      paidBy: adminUser,
      incurredOn: new Date(),
    });
    await expenseRepo.save(expense);
  }

  await AppDataSource.destroy();
  // eslint-disable-next-line no-console
  console.log('Demo data seeded successfully.');
}

seedDemoData().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to seed demo data', error);
  process.exit(1);
});
