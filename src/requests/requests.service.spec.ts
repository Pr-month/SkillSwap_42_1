import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Skill } from '../skills/entities/skill.entity';
import { SkillsService } from '../skills/skills.service';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { Request } from './entities/request.entity';
import { RequestStatus } from './enums/request-status.enum';
import { RequestsService } from './requests.service';

function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    about: null,
    birthDate: null,
    gender: null,
    avatar: null,
    cityId: null,
    role: UserRole.USER,
    refreshToken: null,
    registrationDate: new Date('2026-01-01'),
    skills: [],
    sentRequests: [],
    receivedRequests: [],
    wantToLearn: [],
    favoriteSkills: [],
    ...overrides,
  } as User;
}

function buildSkill(overrides: Partial<Skill> = {}): Skill {
  return {
    id: 1,
    title: 'Skill',
    description: 'Skill description',
    images: [],
    category: null,
    owner: buildUser(),
    favoritedBy: [],
    offeredInRequests: [],
    requestedInRequests: [],
    ...overrides,
  } as unknown as Skill;
}

function buildRequest(overrides: Partial<Request> = {}): Request {
  const sender = buildUser({ id: 1 });
  const receiver = buildUser({ id: 2 });

  return {
    id: 1,
    createdAt: new Date('2026-01-01'),
    sender,
    receiver,
    status: RequestStatus.PENDING,
    offeredSkill: buildSkill({ id: 10, owner: sender }),
    requestedSkill: buildSkill({ id: 20, owner: receiver }),
    isRead: false,
    ...overrides,
  } as Request;
}

function createRequestsRepositoryMock() {
  return {
    create: jest.fn((dto: Partial<Request>) => buildRequest(dto)),
    save: jest.fn<Promise<Request>, [Request]>((request) =>
      Promise.resolve(request),
    ),
    find: jest.fn<Promise<Request[]>, [unknown]>(),
    findOne: jest.fn<Promise<Request | null>, [unknown]>(),
    update: jest
      .fn<Promise<void>, [number, Partial<Request>]>()
      .mockResolvedValue(undefined),
    delete: jest.fn<Promise<void>, [number]>().mockResolvedValue(undefined),
  };
}

function createSkillsServiceMock() {
  return {
    findOne: jest.fn<Promise<Skill>, [number]>(),
  };
}

describe('RequestsService', () => {
  let service: RequestsService;
  let repoMock: ReturnType<typeof createRequestsRepositoryMock>;
  let skillsServiceMock: ReturnType<typeof createSkillsServiceMock>;

  beforeEach(async () => {
    repoMock = createRequestsRepositoryMock();
    skillsServiceMock = createSkillsServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsService,
        { provide: getRepositoryToken(Request), useValue: repoMock },
        { provide: SkillsService, useValue: skillsServiceMock },
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create pending request when sender offers own skill', async () => {
      const sender = buildUser({ id: 1 });
      const receiver = buildUser({ id: 2 });
      const offeredSkill = buildSkill({ id: 10, owner: sender });
      const requestedSkill = buildSkill({ id: 20, owner: receiver });

      skillsServiceMock.findOne
        .mockResolvedValueOnce(offeredSkill)
        .mockResolvedValueOnce(requestedSkill);

      const result = await service.create(
        { offeredSkillId: 10, requestedSkillId: 20 },
        sender.id,
      );

      expect(skillsServiceMock.findOne).toHaveBeenNthCalledWith(1, 10);
      expect(skillsServiceMock.findOne).toHaveBeenNthCalledWith(2, 20);

      expect(repoMock.create).toHaveBeenCalledWith({
        sender: { id: sender.id },
        receiver: { id: receiver.id },
        offeredSkill,
        requestedSkill,
        status: RequestStatus.PENDING,
      });

      expect(repoMock.save).toHaveBeenCalledTimes(1);
      expect(result.status).toBe(RequestStatus.PENDING);
      expect(result.offeredSkill).toBe(offeredSkill);
      expect(result.requestedSkill).toBe(requestedSkill);
    });

    it('should throw ForbiddenException when sender offers another user skill', async () => {
      const senderId = 1;
      const anotherUser = buildUser({ id: 99 });
      const offeredSkill = buildSkill({ id: 10, owner: anotherUser });

      skillsServiceMock.findOne.mockResolvedValue(offeredSkill);

      await expect(
        service.create({ offeredSkillId: 10, requestedSkillId: 20 }, senderId),
      ).rejects.toThrow(ForbiddenException);

      expect(skillsServiceMock.findOne).toHaveBeenCalledTimes(1);
      expect(repoMock.create).not.toHaveBeenCalled();
      expect(repoMock.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when sender requests own skill', async () => {
      const sender = buildUser({ id: 1 });
      const offeredSkill = buildSkill({ id: 10, owner: sender });
      const requestedSkill = buildSkill({ id: 20, owner: sender });

      skillsServiceMock.findOne
        .mockResolvedValueOnce(offeredSkill)
        .mockResolvedValueOnce(requestedSkill);

      await expect(
        service.create(
          { offeredSkillId: offeredSkill.id, requestedSkillId: requestedSkill.id },
          sender.id,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(repoMock.create).not.toHaveBeenCalled();
      expect(repoMock.save).not.toHaveBeenCalled();
    });
  });

  describe('findIncoming', () => {
    it('should return incoming requests ordered by creation date descending', async () => {
      const requests = [buildRequest({ id: 1 }), buildRequest({ id: 2 })];
      repoMock.find.mockResolvedValue(requests);

      const result = await service.findIncoming(5);

      expect(repoMock.find).toHaveBeenCalledWith({
        where: {
          receiver: {
            id: 5,
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
      expect(result).toBe(requests);
    });
  });

  describe('findOutgoing', () => {
    it('should return outgoing requests ordered by creation date descending', async () => {
      const requests = [buildRequest({ id: 1 }), buildRequest({ id: 2 })];
      repoMock.find.mockResolvedValue(requests);

      const result = await service.findOutgoing(7);

      expect(repoMock.find).toHaveBeenCalledWith({
        where: {
          sender: {
            id: 7,
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
      expect(result).toBe(requests);
    });
  });

  describe('findOne', () => {
    it('should return request by id', async () => {
      const request = buildRequest({ id: 15 });
      repoMock.findOne.mockResolvedValue(request);

      await expect(service.findOne(15)).resolves.toBe(request);

      expect(repoMock.findOne).toHaveBeenCalledWith({
        where: { id: 15 },
        relations: ['sender', 'receiver', 'offeredSkill', 'requestedSkill'],
      });
    });

    it('should throw NotFoundException when request does not exist', async () => {
      repoMock.findOne.mockResolvedValue(null);

      await expect(service.findOne(404)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update status when current user is request receiver', async () => {
      const receiver = buildUser({ id: 2 });
      const request = buildRequest({ id: 10, receiver });
      const updatedRequest = buildRequest({
        id: 10,
        receiver,
        status: RequestStatus.ACCEPTED,
      });

      repoMock.findOne
        .mockResolvedValueOnce(request)
        .mockResolvedValueOnce(updatedRequest);

      const result = await service.updateStatus(
        request.id,
        receiver.id,
        RequestStatus.ACCEPTED,
      );

      expect(repoMock.update).toHaveBeenCalledWith(request.id, {
        status: RequestStatus.ACCEPTED,
      });
      expect(result).toBe(updatedRequest);
    });

    it('should throw ForbiddenException when current user is not request receiver', async () => {
      const request = buildRequest({
        id: 10,
        receiver: buildUser({ id: 2 }),
      });

      repoMock.findOne.mockResolvedValue(request);

      await expect(
        service.updateStatus(request.id, 99, RequestStatus.ACCEPTED),
      ).rejects.toThrow(ForbiddenException);

      expect(repoMock.update).not.toHaveBeenCalled();
    });
  });

  describe('removeRequest', () => {
    it('should delete request when current user is sender', async () => {
      const sender = buildUser({ id: 1, role: UserRole.USER });
      const request = buildRequest({ id: 10, sender });

      repoMock.findOne.mockResolvedValue(request);

      await expect(
        service.removeRequest(request.id, sender.id, sender.role),
      ).resolves.toBeUndefined();

      expect(repoMock.delete).toHaveBeenCalledWith(request.id);
    });

    it('should delete request when current user is admin', async () => {
      const request = buildRequest({
        id: 10,
        sender: buildUser({ id: 1, role: UserRole.USER }),
      });

      repoMock.findOne.mockResolvedValue(request);

      await expect(
        service.removeRequest(request.id, 99, UserRole.ADMIN),
      ).resolves.toBeUndefined();

      expect(repoMock.delete).toHaveBeenCalledWith(request.id);
    });

    it('should throw ForbiddenException when current user is not sender or admin', async () => {
      const request = buildRequest({
        id: 10,
        sender: buildUser({ id: 1, role: UserRole.USER }),
      });

      repoMock.findOne.mockResolvedValue(request);

      await expect(
        service.removeRequest(request.id, 99, UserRole.USER),
      ).rejects.toThrow(ForbiddenException);

      expect(repoMock.delete).not.toHaveBeenCalled();
    });
  });
});