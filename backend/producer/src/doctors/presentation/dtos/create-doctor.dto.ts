import { IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FranjaHoraria } from '../../domain/entities/doctor.entity';

export class CreateDoctorDto {
    @ApiProperty({ description: 'Nombre completo del médico', example: 'Juan García' })
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    nombre: string;

    @ApiProperty({ description: 'Cédula del médico (7-10 dígitos)', example: '12345678' })
    @IsNotEmpty()
    @IsString()
    @Matches(/^\d{7,10}$/, { message: 'La cédula debe tener entre 7 y 10 números' })
    cedula: string;

    @ApiPropertyOptional({ description: 'Número de consultorio (1-10)', example: '2' })
    @IsOptional()
    @IsString()
    @IsIn(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'])
    consultorio?: string | null;

    @ApiPropertyOptional({
        description: 'Franja horaria asignada',
        example: '06:00-14:00',
        enum: ['06:00-14:00', '14:00-22:00'],
    })
    @IsOptional()
    @IsString()
    @IsIn(['06:00-14:00', '14:00-22:00'])
    franjaHoraria?: FranjaHoraria | null;
}
