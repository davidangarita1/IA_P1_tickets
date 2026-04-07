import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Request } from 'express';

const ALLOWED_ROLES = ['empleado', 'administrador'];

@Injectable()
export class DoctorRoleGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        const authUser = request['authUser'] as Record<string, unknown> | undefined;
        const rol = (authUser?.rol as string | undefined)?.toLowerCase();

        if (!rol || !ALLOWED_ROLES.includes(rol)) {
            throw new ForbiddenException('Acceso denegado: se requiere rol Empleado o Administrador');
        }

        return true;
    }
}
