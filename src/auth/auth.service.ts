import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { appConfiguration, TAppConfig } from '../config/app-configuration';

@Injectable()
export class AuthService {
  constructor(
    @Inject(appConfiguration.KEY)
    private readonly appConfig: TAppConfig,
  ) {}

  async hashPassword(plainPassword: string): Promise<string> {
    const rounds = this.appConfig.hashSalt;
    return bcrypt.hash(plainPassword, rounds);
  }
}
