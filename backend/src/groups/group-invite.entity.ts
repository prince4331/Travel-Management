import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Group } from './group.entity';
import { User } from '../users/user.entity';

@Entity('group_invites')
@Unique(['code'])
export class GroupInvite {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Group, (group) => group.invites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group!: Group;

  @Column({ length: 16 })
  code: string = '';

  @Column({ type: 'datetime', nullable: true })
  expiresAt?: Date | null;

  @Column({ type: 'integer', nullable: true })
  usageLimit?: number | null;

  @Column({ type: 'integer', default: 0 })
  usedCount: number = 0;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'createdById' })
  createdBy!: User;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date = new Date();
}
