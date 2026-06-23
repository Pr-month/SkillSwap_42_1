import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../../users/enums/user-role.enum';
import { JwtPayload } from '../auth.types';

function createMockContext(user: JwtPayload | null): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: () => jest.fn(),
    getClass: () => jest.fn(),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let reflector: Reflector;
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  describe('когда роли не требуются', () => {
    it('должен вернуть true когда роли не требуются', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      const context = createMockContext({
        sub: 1,
        email: 'test@example.com',
        role: UserRole.USER,
      });
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('должен вернуть true когда массив требуемых ролей пуст', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);

      const context = createMockContext({
        sub: 1,
        email: 'test@example.com',
        role: UserRole.USER,
      });
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  describe('когда роли требуются', () => {
    it('должен вернуть true когда у пользователя есть требуемая роль', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.ADMIN]);

      const context = createMockContext({
        sub: 1,
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      });
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('должен вернуть false когда у пользователя нет требуемой роли', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.ADMIN]);

      const context = createMockContext({
        sub: 1,
        email: 'user@example.com',
        role: UserRole.USER,
      });
      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('должен вернуть true когда у пользователя есть одна из нескольких требуемых ролей', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.ADMIN, UserRole.USER]);

      const context = createMockContext({
        sub: 1,
        email: 'user@example.com',
        role: UserRole.USER,
      });
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });
  });
});
