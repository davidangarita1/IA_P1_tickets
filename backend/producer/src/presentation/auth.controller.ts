import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  LoginUseCase,
  LoginResult,
  UsuarioResponse,
} from '../application/use-cases/login.use-case';
import { SignupUseCase, SignupResult } from '../application/use-cases/signup.use-case';
import { GetAllTurnosUseCase } from '../application/use-cases/get-all-turnos.use-case';
import { TurnoEventPayload } from '../domain/entities/turno.entity';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { AuthGuard } from './auth.guard';
import { Request } from 'express';

interface BackendAuthResponse {
  success: boolean;
  message: string;
  token?: string;
  usuario?: UsuarioResponse;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly signupUseCase: SignupUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly getAllTurnosUseCase: GetAllTurnosUseCase,
  ) {}

  @Post('signUp')
  @ApiOperation({ summary: 'Registrar usuario interno' })
  @ApiBody({ type: SignupDto })
  @ApiResponse({ status: 201, description: 'Usuario registrado' })
  async signUp(@Body() dto: SignupDto): Promise<BackendAuthResponse> {
    try {
      const result: SignupResult = await this.signupUseCase.execute(dto);
      return {
        success: true,
        message: 'Registro exitoso',
        token: result.token,
        usuario: result.usuario,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error en registro',
      };
    }
  }

  @Post('signIn')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 201, description: 'Sesión iniciada' })
  async signIn(@Body() dto: LoginDto): Promise<BackendAuthResponse> {
    try {
      const result: LoginResult = await this.loginUseCase.execute(dto);
      return {
        success: true,
        message: 'Login exitoso',
        token: result.token,
        usuario: result.usuario,
      };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Error en login' };
    }
  }

  @Post('signOut')
  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiResponse({ status: 201, description: 'Sesión cerrada' })
  async signOut(): Promise<{ success: boolean; message: string }> {
    return { success: true, message: 'Sesión cerrada' };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener usuario actual' })
  @ApiResponse({ status: 200, description: 'Usuario actual' })
  async me(@Req() req: Request): Promise<UsuarioResponse> {
    const authUser = req['authUser'] as Record<string, unknown>;
    return {
      id: authUser.sub as string,
      email: authUser.email as string,
      nombre: authUser.nombre as string,
      rol: authUser.rol as string,
    };
  }

  @Get('dashboard-history')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar historial de turnos del dashboard' })
  @ApiResponse({ status: 200, description: 'Historial del dashboard' })
  async getDashboardHistory(): Promise<TurnoEventPayload[]> {
    return this.getAllTurnosUseCase.execute();
  }
}
