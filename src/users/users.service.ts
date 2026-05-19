import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto, passwordHash: string) {
    const user = this.usersRepository.create({
      ...dto,
      passwordHash,
    } as Partial<User>);
    return this.usersRepository.save(user);
  }

  findByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findMe(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        about: true,
        birthDate: true,
        gender: true,
        avatar: true,
        cityId: true,
        roleId: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  findAll() {
    return this.usersRepository.find({
      select: {
        id: true,
        name: true,
        about: true,
        birthDate: true,
        gender: true,
        avatar: true,
        cityId: true,
      },
    });
  }

  findOne(id: number) {
    return this.usersRepository.findOne({ where: { id } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.usersRepository.update(id, updateUserDto as Partial<User>);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.usersRepository.delete(id);
  }
}
