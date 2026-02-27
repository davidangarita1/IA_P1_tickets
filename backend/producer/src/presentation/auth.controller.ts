import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { SignupUseCase } from '../application/use-cases/signup.use-case';
import { GetAllTurnosUseCase } from '../application/use-cases/get-all-turnos.use-case';
import { TurnoEventPayload } from '../domain/entities/turno.entity';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { AuthGuard } from './auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly signupUseCase: SignupUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly getAllTurnosUseCase: GetAllTurnosUseCase,
  ) {}

  // Registra usuarios internos que luego pueden acceder al dashboard privado.
  @Post('signup')
  @ApiOperation({ summary: 'Registrar usuario interno' })
  @ApiBody({ type: SignupDto })
  @ApiResponse({ status: 201, description: 'Usuario registrado' })
  async signup(@Body() dto: SignupDto): Promise<{ userId: string }> {
    const userId = await this.signupUseCase.execute(dto);
    return { userId };
  }

  // Autentica un usuario y retorna token para endpoints privados.
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 201, description: 'Token generado' })
  async login(@Body() dto: LoginDto): Promise<{ accessToken: string }> {
    const accessToken = await this.loginUseCase.execute(dto);
    return { accessToken };
  }

  // Endpoint privado para historial del dashboard, protegido por Bearer token.
  @Get('dashboard-history')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar historial de turnos del dashboard' })
  @ApiResponse({ status: 200, description: 'Historial del dashboard' })
  async getDashboardHistory(): Promise<TurnoEventPayload[]> {
    return this.getAllTurnosUseCase.execute();
  }
}