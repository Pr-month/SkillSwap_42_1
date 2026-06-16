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

const mockUserRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useFactory: mockUserRepository },
        { provide: appConfiguration.KEY, useValue: { hashSalt: 10 } },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepo = module.get(getRepositoryToken(User));
  });

  describe('findMe', () => {
    it('должен вернуть пользователя если он найден', async () => {
      const user = { id: 1, name: 'Test' };
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
      const user = { id: 1, name: 'Old Name' };
      userRepo.findOne.mockResolvedValue(user);
      userRepo.update.mockResolvedValue({ affected: 1 });
      userRepo.findOne
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce({ ...user, ...updateDto });

      const result = await service.update(1, updateDto);
      expect(result.name).toBe('New Name');
    });

    it('должен выбросить NotFoundException если пользователь не найден', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('должен выбросить ConflictException если email уже занят другим пользователем', async () => {
      const user = { id: 1 };
      const existingUser = { id: 2, email: 'test@example.com' };
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
      const user = { id: 1, passwordHash: 'hashed' };
      userRepo.findOne.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('newHashed' as never);

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
      const user = { id: 1, passwordHash: 'hashed' };
      userRepo.findOne.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        service.updatePassword(1, 'wrong', newPassword),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
