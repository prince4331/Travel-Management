import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GroupMember } from './group-member.entity';
import { GroupInvite } from './group-invite.entity';
import { Expense } from '../expenses/expense.entity';
import { Document } from '../documents/document.entity';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 150 })
  title: string = '';

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ length: 120 })
  destination: string = '';

  @Column({ type: 'datetime' })
  startDate: Date = new Date();

  @Column({ type: 'datetime' })
  endDate: Date = new Date();

  @Column({ default: false })
  isPublic: boolean = false;

  @Column({ unique: true, length: 16 })
  inviteCode: string = '';

  @Column({ type: 'text', nullable: true })
  coverImage?: string | null;

  @Column({ type: 'simple-json', nullable: true })
  guides?: string[];

  @Column({ type: 'simple-json', nullable: true })
  tags?: string[];

  @Column({ default: 'friendly' })
  tourType: 'friendly' | 'paid' = 'friendly';

  @Column({ default: true })
  showFinancialDetailsToMembers: boolean = true;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date = new Date();

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date = new Date();

  @OneToMany(() => GroupMember, (member) => member.group, { cascade: true })
  members!: GroupMember[];

  @OneToMany(() => GroupInvite, (invite) => invite.group, { cascade: true })
  invites!: GroupInvite[];

  @OneToMany(() => Expense, (expense) => expense.group, { cascade: true })
  expenses!: Expense[];

  @OneToMany(() => Document, (document) => document.group)
  documents!: Document[];
}
