import { ForbiddenException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { DoctorRoleGuard } from '@/presentation/doctor-role.guard';

describe('DoctorRoleGuard', () => {
  let guard: DoctorRoleGuard;

  beforeEach(() => {
    guard = new DoctorRoleGuard();
  });

  function makeContext(rol: string | undefined): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          authUser: rol !== undefined ? { rol } : undefined,
        }),
      }),
    } as unknown as ExecutionContext;
  }

  it('allows access for role empleado', () => {
    expect(guard.canActivate(makeContext('empleado'))).toBe(true);
  });

  it('allows access for role administrador', () => {
    expect(guard.canActivate(makeContext('administrador'))).toBe(true);
  });

  it('allows access for mixed case role Empleado', () => {
    expect(guard.canActivate(makeContext('Empleado'))).toBe(true);
  });

  it('allows access for mixed case role Administrador', () => {
    expect(guard.canActivate(makeContext('Administrador'))).toBe(true);
  });

  it('throws ForbiddenException for unknown role', () => {
    expect(() => guard.canActivate(makeContext('paciente'))).toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when authUser is undefined', () => {
    expect(() => guard.canActivate(makeContext(undefined))).toThrow(ForbiddenException);
  });

  it('throws ForbiddenException for empty role string', () => {
    expect(() => guard.canActivate(makeContext(''))).toThrow(ForbiddenException);
  });
});
