import { IsEmail, IsString, MinLength } from 'class-validator';

// DTO mínimo para solicitudes de registro de usuario.
export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(4)
  password: string;
}