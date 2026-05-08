import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  /** Хеширует пароль с помощью bcrypt.
   * 
   * @param plainPassword - Пароль, введенный пользователем.
   * @returns Хеш пароля.
   */
  async hashPassword(plainPassword: string): Promise<string> {
    const rounds = this.configService.get<number>('app.hashSalt') ?? 10;
    return bcrypt.hash(plainPassword, rounds);
  }

  create(createAuthDto: CreateAuthDto) {
    return {
      message: 'This action adds a new auth',
      received: createAuthDto,
    };
  }

  findAll() {
    return this.usersRepository.find();
  }

  findOne(id: number) {
    return this.usersRepository.findOne({ where: { id } });
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return {
      message: `This action updates a #${id} auth`,
      received: updateAuthDto,
    };
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
