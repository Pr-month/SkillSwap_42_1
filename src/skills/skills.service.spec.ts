import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { Skill } from './entities/skill.entity';
import { Category } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';
import { FilesService } from '../files/files.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

const mockSkillRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findOneOrFail: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
  })),
  merge: jest.fn(),
});

const mockCategoryRepository = () => ({
  findOneByOrFail: jest.fn(),
});

const mockUserRepository = () => ({
  findOneByOrFail: jest.fn(),
  findOneOrFail: jest.fn(),
  save: jest.fn(),
});

describe('SkillsService', () => {
  let service: SkillsService;
  let skillRepo: any;
  let categoryRepo: any;
  let userRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsService,
        { provide: getRepositoryToken(Skill), useFactory: mockSkillRepository },
        {
          provide: getRepositoryToken(Category),
          useFactory: mockCategoryRepository,
        },
        { provide: getRepositoryToken(User), useFactory: mockUserRepository },
        { provide: FilesService, useValue: { deleteFile: jest.fn() } },
      ],
    }).compile();

    service = module.get<SkillsService>(SkillsService);
    skillRepo = module.get(getRepositoryToken(Skill));
    categoryRepo = module.get(getRepositoryToken(Category));
    userRepo = module.get(getRepositoryToken(User));
  });

  describe('create', () => {
    const dto: CreateSkillDto = {
      title: 'Test Skill',
      description: 'Test Description',
      categoryId: 1,
    };

    it('должен создать новый навык', async () => {
      const category = { id: 1 };
      const owner = { id: 1 };
      const createdSkill = { id: 1, ...dto, category, owner };

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
      const skill = { id: 1, title: 'Test' };
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
      const skill = { id: 1, owner: { id: 1 }, images: [] };
      skillRepo.findOneOrFail.mockResolvedValue(skill);
      skillRepo.merge.mockReturnValue({ ...skill, ...updateDto });
      skillRepo.save.mockResolvedValue({ ...skill, ...updateDto });

      const result = await service.update(1, 1, updateDto);

      expect(result.title).toBe('New Title');
    });

    it('должен выбросить ForbiddenException если пользователь не владелец', async () => {
      const skill = { id: 1, owner: { id: 2 } };
      skillRepo.findOneOrFail.mockResolvedValue(skill);

      await expect(service.update(1, 1, updateDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('должен удалить навык если пользователь владелец', async () => {
      const skill = { id: 1, owner: { id: 1 }, images: [] };
      skillRepo.findOneOrFail.mockResolvedValue(skill);
      skillRepo.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1, 1);
      expect(skillRepo.delete).toHaveBeenCalledWith(1);
    });

    it('должен выбросить ForbiddenException если пользователь не владелец', async () => {
      const skill = { id: 1, owner: { id: 2 } };
      skillRepo.findOneOrFail.mockResolvedValue(skill);

      await expect(service.remove(1, 1)).rejects.toThrow(ForbiddenException);
    });
  });
});
