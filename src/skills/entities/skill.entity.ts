import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { Request } from '../../requests/entities/request.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'skills' })
export class Skill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'jsonb', default: [] })
  images: string[];

  @ManyToOne(() => Category, (category) => category.skills, {
    nullable: false,
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => User, (user) => user.skills, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  owner: User;

  @ManyToMany(() => User, (user) => user.favoriteSkills)
  favoritedBy: User[];

  @OneToMany(() => Request, (request) => request.offeredSkill)
  offeredInRequests: Request[];

  @OneToMany(() => Request, (request) => request.requestedSkill)
  requestedInRequests: Request[];
}
