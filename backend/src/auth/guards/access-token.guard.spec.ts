import { AccessTokenGuard } from './access-token.guard';

describe('AccessTokenGuard', () => {
  it('should be defined', () => {
    const guard = new AccessTokenGuard();

    expect(guard).toBeDefined();
    expect(guard).toBeInstanceOf(AccessTokenGuard);
    expect(typeof guard.canActivate).toBe('function');
  });
});
