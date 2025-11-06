import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Group } from '../groups/group.entity';
import { User } from '../users/user.entity';

export interface ExpenseSplit {
  memberId: number;
  amount: number;
}

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Group, (group) => group.expenses, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'group_id' })
  group?: Group | null;

  @Column({ length: 120 })
  title: string = '';

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ length: 40 })
  category: string = 'other';

  @Column({ length: 20, default: 'group' })
  expenseType: 'personal' | 'group' = 'group';

  @Column({ length: 8 })
  currency: string = 'USD';

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string | number) => Number(value),
    },
  })
  amount: number = 0;

  @Column({ type: 'simple-json' })
  splits: ExpenseSplit[] = [];

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'paid_by_id' })
  paidBy!: User;

  @Column({ type: 'datetime' })
  incurredOn: Date = new Date();

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date = new Date();

  @Column({ type: 'simple-json', nullable: true })
  attachments?: Array<{
    id: string;
    title: string;
    url?: string;
  }>;
}
