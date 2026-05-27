import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { Request } from './entities/request.entity';
import { SkillsService } from '../skills/skills.service';
import { RequestStatus } from './enums/request-status.enum';

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

  async findAll() {
    return this.requestsRepository.find();
  }

  async findOne(id: number) {
    const request = await this.requestsRepository.findOne({ where: { id } });
    if (!request) {
      throw new NotFoundException('Request not found');
    }
    return request;
  }

  async update(id: number, updateRequestDto: UpdateRequestDto) {
    await this.requestsRepository.update(id, updateRequestDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.requestsRepository.delete(id);
  }
}
