import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '../../src/presentation/auth.guard';
import { IAccessTokenVerifier } from '../../src/application/ports/IAccessTokenVerifier';

describe('AuthGuard (Presentation)', () => {
  let tokenVerifier: jest.Mocked<IAccessTokenVerifier>;
  let guard: AuthGuard;

  beforeEach(() => {
    tokenVerifier = { verifyToken: jest.fn() };
    guard = new AuthGuard(tokenVerifier);
  });

  it('throws when bearer token is missing', () => {
    const request = { headers: {} };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as ExecutionContext;

    const act = () => guard.canActivate(context);

    expect(act).toThrow(UnauthorizedException);
  });

  it('throws when token is invalid', () => {
    tokenVerifier.verifyToken.mockReturnValue(null);
    const request = { headers: { authorization: 'Bearer wrong-token' } };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as ExecutionContext;

    const act = () => guard.canActivate(context);

    expect(act).toThrow(UnauthorizedException);
    expect(tokenVerifier.verifyToken).toHaveBeenCalledWith('wrong-token');
  });

  it('accepts request when token is valid', () => {
    tokenVerifier.verifyToken.mockReturnValue({ sub: '1', email: 'admin@eps.com' });
    const request: { headers: { authorization: string }; authUser?: Record<string, unknown> } = {
      headers: { authorization: 'Bearer valid-token' },
    };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as ExecutionContext;

    const result = guard.canActivate(context);

    expect(result).toBe(true);
    expect(request.authUser).toEqual({ sub: '1', email: 'admin@eps.com' });
  });
});
