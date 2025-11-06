import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as path from 'path';
import { User } from './users/user.entity';
import { Role } from './auth/role.entity';
import { Session } from './auth/session.entity';
import { Group } from './groups/group.entity';
import { GroupMember } from './groups/group-member.entity';
import { GroupInvite } from './groups/group-invite.entity';
import { Expense } from './expenses/expense.entity';
import { Document } from './documents/document.entity';

const databaseFile = process.env.DB_FILE || 'travel-management.sqlite';

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: databaseFile,
  entities: [User, Role, Session, Group, GroupMember, GroupInvite, Expense, Document],
  migrations: [__dirname + '/../migrations/*.ts'],
  synchronize: true,
  logging: false,
});
