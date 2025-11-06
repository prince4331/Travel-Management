import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Group } from '../groups/group.entity';

export type DocumentOwnerType = 'group' | 'user' | 'trip';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 20 })
  ownerType: DocumentOwnerType = 'group';

  @Column({ length: 64 })
  ownerId: string = '';

  @Column({ length: 150 })
  title: string = '';

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ length: 60 })
  fileType: string = '';

  @Column({ type: 'integer' })
  fileSize: number = 0;

  @Column({ length: 200 })
  storageKey: string = '';

  @Column({ type: 'datetime', nullable: true })
  expiresAt?: Date | null;

  @Column({ default: false })
  isEncrypted: boolean = false;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, any> | null;

  @ManyToOne(() => Group, (group) => group.documents, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group?: Group | null;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'createdById' })
  createdBy!: User;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date = new Date();
}

