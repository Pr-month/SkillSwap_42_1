import { RefreshTokenGuard } from './refresh-token.guard';

describe('RefreshTokenGuard', () => {
  it('should be defined', () => {
    const guard = new RefreshTokenGuard();

    expect(guard).toBeDefined();
    expect(guard).toBeInstanceOf(RefreshTokenGuard);
    expect(typeof guard.canActivate).toBe('function');
  });
});
