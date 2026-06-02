import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRequestDto } from './dto/create-request.dto';
import { Request } from './entities/request.entity';
import { SkillsService } from '../skills/skills.service';
import { RequestStatus } from './enums/request-status.enum';
import { UserRole } from '../users/enums/user-role.enum';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,
    private readonly skillsService: SkillsService,
  ) {}

  async create(createRequestDto: CreateRequestDto, senderId: number) {
    const { offeredSkillId, requestedSkillId } = createRequestDto;
    const offeredSkill = await this.skillsService.findOne(offeredSkillId);
    if (offeredSkill.owner.id !== senderId) {
      throw new ForbiddenException('You can only offer your own skills');
    }
    const requestedSkill = await this.skillsService.findOne(requestedSkillId);
    const receiverId = requestedSkill.owner.id;
    if (senderId === receiverId) {
      throw new BadRequestException(
        'You cannot request an exchange with yourself',
      );
    }
    const request = this.requestsRepository.create({
      sender: { id: senderId },
      receiver: { id: receiverId },
      offeredSkill,
      requestedSkill,
      status: RequestStatus.PENDING,
    });

    return this.requestsRepository.save(request);
  }

  async findIncoming(userId: number) {
    return this.requestsRepository.find({
      where: {
        receiver: {
          id: userId,
        },
      },
      relations: {
        sender: true,
        receiver: true,
        offeredSkill: true,
        requestedSkill: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOutgoing(userId: number) {
    return this.requestsRepository.find({
      where: {
        sender: {
          id: userId,
        },
      },
      relations: {
        sender: true,
        receiver: true,
        offeredSkill: true,
        requestedSkill: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const request = await this.requestsRepository.findOne({
      where: { id },
      relations: ['sender', 'receiver', 'offeredSkill', 'requestedSkill'],
    });
    if (!request) {
      throw new NotFoundException('Request not found');
    }
    return request;
  }

  async updateStatus(id: number, userId: number, status: RequestStatus) {
    const request = await this.findOne(id);

    if (request.receiver.id !== userId) {
      throw new ForbiddenException('You can only update incoming requests');
    }

    await this.requestsRepository.update(id, { status });
    return this.findOne(id);
  }

  async removeRequest(id: number, userId: number, userRole: UserRole) {
    const request = await this.findOne(id);

    const isAdmin = userRole === UserRole.ADMIN;
    const isSender = request.sender.id === userId;
    if (!isAdmin && !isSender) {
      throw new ForbiddenException(
        'You can only delete your own sent requests',
      );
    }

    await this.requestsRepository.delete(id);
  }
}
