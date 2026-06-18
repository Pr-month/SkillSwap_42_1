import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { Skill } from './entities/skill.entity';
import { Category } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { FilesService } from '../files/files.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

// Функция для создания объекта User (как в auth.service.spec.ts)
function buildUser(overrides: Partial<User> = {}): User {
  const defaults: User = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    passwordHash: 'hashed',
    about: null,
    birthDate: null,
    gender: null,
    avatar: null,
    cityId: null,
    role: UserRole.USER,
    refreshToken: null,
    registrationDate: new Date('2026-01-01'),
    skills: [],
    wantToLearn: [],
    favoriteSkills: [],
    sentRequests: [],
    receivedRequests: [],
  };
  return { ...defaults, ...overrides };
}

// Функция для создания объекта Skill
function buildSkill(overrides: Partial<Skill> = {}): Skill {
  const defaults: Skill = {
    id: 1,
    title: 'Default Skill',
    description: 'Default Description',
    images: [],
    category: { id: 1 } as Category,
    owner: buildUser(),
    favoritedBy: [],
    offeredInRequests: [],
    requestedInRequests: [],
  };
  return { ...defaults, ...overrides };
}

function createSkillRepositoryMock() {
  return {
    create: jest.fn<Skill, [Partial<Skill>]>((dto) => buildSkill(dto)),
    save: jest.fn<Promise<Skill>, [Skill]>((skill) => Promise.resolve(skill)),
    find: jest.fn<Promise<Skill[]>, [unknown?]>(),
    findOne: jest.fn<Promise<Skill | null>, [unknown]>(),
    findOneOrFail: jest.fn<Promise<Skill>, [unknown]>(),
    update: jest
      .fn<Promise<void>, [number, Partial<Skill>]>()
      .mockResolvedValue(undefined),
    delete: jest
      .fn<Promise<{ affected?: number | null }>, [number]>()
      .mockResolvedValue({ affected: 1 }),
    createQueryBuilder: jest.fn(() => ({
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest
        .fn<Promise<[Skill[], number]>, []>()
        .mockResolvedValue([[], 0]),
    })),
    merge: jest.fn<Skill, [Skill, Partial<Skill>]>((skill, dto) => ({
      ...skill,
      ...dto,
    })),
  };
}

function createCategoryRepositoryMock() {
  return {
    findOneByOrFail: jest.fn<Promise<Category>, [Partial<Category>]>(),
  };
}

function createUserRepositoryMock() {
  return {
    findOneByOrFail: jest.fn<Promise<User>, [Partial<User>]>(),
    findOneOrFail: jest.fn<Promise<User>, [unknown]>(),
    save: jest.fn<Promise<User>, [User]>((user) => Promise.resolve(user)),
  };
}

describe('SkillsService', () => {
  let service: SkillsService;
  let skillRepo: ReturnType<typeof createSkillRepositoryMock>;
  let categoryRepo: ReturnType<typeof createCategoryRepositoryMock>;
  let userRepo: ReturnType<typeof createUserRepositoryMock>;

  beforeEach(async () => {
    skillRepo = createSkillRepositoryMock();
    categoryRepo = createCategoryRepositoryMock();
    userRepo = createUserRepositoryMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsService,
        { provide: getRepositoryToken(Skill), useValue: skillRepo },
        { provide: getRepositoryToken(Category), useValue: categoryRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: FilesService, useValue: { deleteFile: jest.fn() } },
      ],
    }).compile();

    service = module.get<SkillsService>(SkillsService);
  });

  describe('create', () => {
    const dto: CreateSkillDto = {
      title: 'Test Skill',
      description: 'Test Description',
      categoryId: 1,
    };

    it('должен создать новый навык', async () => {
      const category = { id: 1 } as Category;
      const owner = buildUser({ id: 1 });
      const createdSkill = buildSkill({ id: 1, ...dto, category, owner });

      categoryRepo.findOneByOrFail.mockResolvedValue(category);
      userRepo.findOneByOrFail.mockResolvedValue(owner);
      skillRepo.create.mockReturnValue(createdSkill);
      skillRepo.save.mockResolvedValue(createdSkill);

      const result = await service.create(1, dto);

      expect(result).toEqual(createdSkill);
      expect(skillRepo.create).toHaveBeenCalled();
      expect(skillRepo.save).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('должен вернуть навык если он найден', async () => {
      const skill = buildSkill({ id: 1, title: 'Test' });
      skillRepo.findOne.mockResolvedValue(skill);

      const result = await service.findOne(1);
      expect(result).toEqual(skill);
    });

    it('должен выбросить NotFoundException если навык не найден', async () => {
      skillRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateSkillDto = { title: 'New Title' };

    it('должен обновить навык если пользователь владелец', async () => {
      const skill = buildSkill({
        id: 1,
        owner: buildUser({ id: 1 }),
        images: [],
      });
      skillRepo.findOneOrFail.mockResolvedValue(skill);
      skillRepo.merge.mockReturnValue({ ...skill, ...updateDto });
      skillRepo.save.mockResolvedValue({ ...skill, ...updateDto });

      const result = await service.update(1, 1, updateDto);

      expect(result.title).toBe('New Title');
    });

    it('должен выбросить ForbiddenException если пользователь не владелец', async () => {
      const skill = buildSkill({ id: 1, owner: buildUser({ id: 2 }) });
      skillRepo.findOneOrFail.mockResolvedValue(skill);

      await expect(service.update(1, 1, updateDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('должен удалить навык если пользователь владелец', async () => {
      const skill = buildSkill({
        id: 1,
        owner: buildUser({ id: 1 }),
        images: [],
      });
      skillRepo.findOneOrFail.mockResolvedValue(skill);
      skillRepo.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1, 1);
      expect(skillRepo.delete).toHaveBeenCalledWith(1);
    });

    it('должен выбросить ForbiddenException если пользователь не владелец', async () => {
      const skill = buildSkill({ id: 1, owner: buildUser({ id: 2 }) });
      skillRepo.findOneOrFail.mockResolvedValue(skill);

      await expect(service.remove(1, 1)).rejects.toThrow(ForbiddenException);
    });
  });
});
