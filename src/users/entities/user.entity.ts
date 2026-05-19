import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'text', nullable: true })
  about: string | null;

  @Column({ type: 'date', nullable: true, name: 'birth_date' })
  birthDate: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  gender: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar: string | null;

  @Column({ type: 'int', nullable: true, name: 'city_id' })
  cityId: number | null;

  @Column({ type: 'int', default: 1, name: 'role_id' })
  roleId: number;

  @Exclude()
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    name: 'refresh_token',
  })
  refreshToken: string | null;

  @CreateDateColumn({ name: 'registration_date' })
  registrationDate: Date;
}
