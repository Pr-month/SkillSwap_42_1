import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { appConfiguration } from '../config/app-configuration';
import { UpdateUserDto } from './dto/update-user.dto';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

const mockUserRepository = () => ({
  findOne: jest.fn<Promise<User | null>, [{ where: { id: number } }]>(),
  find: jest.fn<Promise<User[]>, [unknown?]>(),
  create: jest.fn<User, [Partial<User>]>((dto) => dto as User),
  save: jest.fn<Promise<User>, [User]>((user) => Promise.resolve(user)),
  update: jest
    .fn<Promise<void>, [number, Partial<User>]>()
    .mockResolvedValue(undefined),
  delete: jest
    .fn<Promise<{ affected?: number | null }>, [number]>()
    .mockResolvedValue({ affected: 1 }),
});

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: ReturnType<typeof mockUserRepository>;

  beforeEach(async () => {
    userRepo = mockUserRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: appConfiguration.KEY, useValue: { hashSalt: 10 } },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('findMe', () => {
    it('должен вернуть пользователя если он найден', async () => {
      const user = { id: 1, name: 'Test' } as User;
      userRepo.findOne.mockResolvedValue(user);

      const result = await service.findMe(1);
      expect(result).toEqual(user);
    });

    it('должен выбросить NotFoundException если пользователь не найден', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.findMe(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateUserDto = { name: 'New Name' };

    it('должен обновить пользователя', async () => {
      const user = { id: 1, name: 'Old Name' } as User;
      const updatedUser = { ...user, ...updateDto } as User;
      userRepo.findOne.mockResolvedValue(user);
      userRepo.update.mockResolvedValue(undefined);
      userRepo.findOne
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce(updatedUser);

      const result = await service.update(1, updateDto);
      expect(result).toBeDefined();
      expect(result?.name).toBe('New Name');
    });

    it('должен выбросить NotFoundException если пользователь не найден', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('должен выбросить ConflictException если email уже занят другим пользователем', async () => {
      const user = { id: 1 } as User;
      const existingUser = { id: 2, email: 'test@example.com' } as User;
      userRepo.findOne
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce(existingUser);

      await expect(
        service.update(1, { email: 'test@example.com' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updatePassword', () => {
    const oldPassword = 'oldPass123';
    const newPassword = 'newPass123';

    it('должен обновить пароль когда старый пароль верный', async () => {
      const user = { id: 1, passwordHash: 'hashed' } as User;
      userRepo.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashed');

      await service.updatePassword(1, oldPassword, newPassword);

      expect(userRepo.update).toHaveBeenCalledWith(1, {
        passwordHash: 'newHashed',
      });
    });

    it('должен выбросить NotFoundException если пользователь не найден', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(
        service.updatePassword(999, oldPassword, newPassword),
      ).rejects.toThrow(NotFoundException);
    });

    it('должен выбросить UnauthorizedException если старый пароль неверный', async () => {
      const user = { id: 1, passwordHash: 'hashed' } as User;
      userRepo.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.updatePassword(1, 'wrong', newPassword),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
