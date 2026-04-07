import { IsIn, IsOptional, IsString, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Shift } from '../../domain/entities/doctor.entity';

export class UpdateDoctorDto {
    @ApiPropertyOptional({ description: 'Full name of the doctor', example: 'Juan García' })
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    name?: string;

    @ApiPropertyOptional({ description: 'National ID of the doctor (7-10 digits)', example: '12345678' })
    @IsOptional()
    @IsString()
    @Matches(/^\d{7,10}$/, { message: 'La cédula debe tener entre 7 y 10 números' })
    documentId?: string;

    @ApiPropertyOptional({ description: 'Office number (1-10) or null to unassign', example: '2' })
    @IsOptional()
    @ValidateIf((o) => o.office !== null)
    @IsString()
    @IsIn(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'])
    office?: string | null;

    @ApiPropertyOptional({
        description: 'Assigned time shift, or null to unassign',
        example: '06:00-14:00',
        enum: ['06:00-14:00', '14:00-22:00'],
    })
    @IsOptional()
    @ValidateIf((o) => o.shift !== null)
    @IsString()
    @IsIn(['06:00-14:00', '14:00-22:00'])
    shift?: Shift | null;
}
