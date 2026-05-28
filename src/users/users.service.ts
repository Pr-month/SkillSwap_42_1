import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Inject,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { instanceToPlain } from 'class-transformer';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserSerializeGroup } from './entities/user.entity';
import { appConfiguration, TAppConfig } from '../config/app-configuration';

export type PublicUser = Omit<User, 'passwordHash' | 'refreshToken'>;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @Inject(appConfiguration.KEY)
    private readonly appConfig: TAppConfig,
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
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findAll() {
    const users = await this.usersRepository.find();
    return users.map((user) =>
      instanceToPlain(user, { groups: [UserSerializeGroup.Public] }),
    );
  }

  findOne(id: number) {
    return this.usersRepository.findOne({ where: { id } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (updateUserDto.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email is already taken');
      }
    }

    await this.usersRepository.update(id, updateUserDto as Partial<User>);
    return this.findOne(id);
  }
  async updatePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isPasswordValid = await bcrypt.compare(
      oldPassword,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const saltRounds = this.appConfig.hashSalt;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    await this.usersRepository.update(userId, {
      passwordHash: newPasswordHash,
    });
  }

  async remove(id: number) {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }
}
