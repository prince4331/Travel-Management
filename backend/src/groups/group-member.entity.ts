import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { Group } from './group.entity';
import { User } from '../users/user.entity';

export type GroupMemberRole = 'admin' | 'co-admin' | 'member';
export type GroupMemberStatus = 'active' | 'pending' | 'invited' | 'left';

@Entity('group_members')
export class GroupMember {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Group, (group) => group.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group!: Group;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ length: 50, default: 'member' })
  role: GroupMemberRole = 'member';

  @Column({ length: 20, default: 'pending' })
  status: GroupMemberStatus = 'pending';

  @Column('varchar', { nullable: true, length: 120 })
  displayName: string | null = null;

  @Column({ type: 'simple-json', nullable: true })
  emergencyContact?: {
    name: string;
    phone: string;
    email?: string;
    notes?: string;
  };

  @CreateDateColumn({ type: 'datetime' })
  joinedAt: Date = new Date();
}
