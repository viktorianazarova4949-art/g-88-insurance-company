import { Role } from './enums/role.enum.js';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';


@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;
  @Column({ name: 'email', nullable: false, unique: true })
  email: string;
  @Column({ name: 'email', nullable: false })
  password: string;
  @Column({ name: 'email', nullable: false, unique: false })
  name: string;

  @Column({ name: 'role', nullable: false, type: 'enum', enum: Role })
  role: Role;

  @Column({ name: 'email', nullable: false, unique: false })
  active: boolean;
}
