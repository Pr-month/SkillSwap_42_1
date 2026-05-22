import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { instanceToPlain } from 'class-transformer';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserSerializeGroup } from './entities/user.entity';

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
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return serializeUser(user, [
      UserSerializeGroup.Public,
      UserSerializeGroup.Me,
    ]);
  }

  async findAll() {
    const users = await this.usersRepository.find();
    return users.map((user) =>
      serializeUser(user, [UserSerializeGroup.Public]),
    );
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
