import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Skill } from '../../skills/entities/skill.entity';
import { User } from '../../users/entities/user.entity';
import { RequestStatus } from '../enums/request-status.enum';

@Entity({ name: 'requests' })
export class Request {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.sentRequests, { nullable: false })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => User, (user) => user.receivedRequests, { nullable: false })
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status: RequestStatus;

  @ManyToOne(() => Skill, (skill) => skill.offeredInRequests, { nullable: false })
  @JoinColumn({ name: 'offered_skill_id' })
  offeredSkill: Skill;

  @ManyToOne(() => Skill, (skill) => skill.requestedInRequests, {
    nullable: false,
  })
  @JoinColumn({ name: 'requested_skill_id' })
  requestedSkill: Skill;

  @Column({ type: 'boolean', default: false, name: 'is_read' })
  isRead: boolean;
}
