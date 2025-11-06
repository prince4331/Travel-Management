import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from '../auth/role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ unique: true })
  email: string = '';

  @Column({ unique: true })
  phone: string = '';

  @Column()
  password: string = '';

  @Column({ nullable: true })
  photoUrl: string = '';

  @Column({ nullable: true })
  bloodGroup: string = '';

  @Column({ nullable: true })
  emergencyContact: string = '';

  @ManyToOne(() => Role, role => role.users)
  @JoinColumn({ name: 'role_id' })
  role!: Role;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date = new Date();
}
