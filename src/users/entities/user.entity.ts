import { Exclude, Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { Skill } from '../../skills/entities/skill.entity';
import { UserRole } from '../enums/user-role.enum';

export const UserSerializeGroup = {
  Public: 'user.public',
  Me: 'user.me',
} as const;

@Entity({ name: 'users' })
export class User {
  @Expose({ groups: [UserSerializeGroup.Public, UserSerializeGroup.Me] })
  @PrimaryGeneratedColumn()
  id: number;

  @Expose({ groups: [UserSerializeGroup.Public, UserSerializeGroup.Me] })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Expose({ groups: [UserSerializeGroup.Me] })
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash: string;

  @Expose({ groups: [UserSerializeGroup.Public, UserSerializeGroup.Me] })
  @Column({ type: 'text', nullable: true })
  about: string | null;

  @Expose({ groups: [UserSerializeGroup.Public, UserSerializeGroup.Me] })
  @Column({ type: 'date', nullable: true, name: 'birth_date' })
  birthDate: string | null;

  @Expose({ groups: [UserSerializeGroup.Public, UserSerializeGroup.Me] })
  @Column({ type: 'varchar', length: 20, nullable: true })
  gender: string | null;

  @Expose({ groups: [UserSerializeGroup.Public, UserSerializeGroup.Me] })
  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar: string | null;

  @Expose({ groups: [UserSerializeGroup.Public, UserSerializeGroup.Me] })
  @Column({ type: 'int', nullable: true, name: 'city_id' })
  cityId: number | null;

  @Expose({ groups: [UserSerializeGroup.Me] })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Exclude()
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    name: 'refresh_token',
  })
  refreshToken: string | null;

  @Expose({ groups: [UserSerializeGroup.Me] })
  @CreateDateColumn({ name: 'registration_date' })
  registrationDate: Date;

  @Exclude()
  @OneToMany(() => Skill, (skill) => skill.owner)
  skills: Skill[];

  @Exclude()
  @ManyToMany(() => Category, (category) => category.usersWantToLearn)
  @JoinTable({
    name: 'user_want_to_learn',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  wantToLearn: Category[];

  @Exclude()
  @ManyToMany(() => Skill, (skill) => skill.favoritedBy)
  @JoinTable({
    name: 'user_favorite_skills',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'skill_id', referencedColumnName: 'id' },
  })
  favoriteSkills: Skill[];
}
