import { IsEmail, IsString, MinLength } from 'class-validator';

// DTO mínimo para solicitudes de inicio de sesión.
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(4)
  password: string;
}