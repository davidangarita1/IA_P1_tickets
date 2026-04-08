import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateDoctorDto } from '../../../src/presentation/dto/update-doctor.dto';

describe('UpdateDoctorDto (Presentation - DTO)', () => {
  function toDto(plain: Record<string, unknown>): UpdateDoctorDto {
    return plainToInstance(UpdateDoctorDto, plain);
  }

  it('passes validation with all valid fields', async () => {
    const dto = toDto({
      name: 'Juan García',
      documentId: '12345678',
      office: '2',
      shift: '06:00-14:00',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('passes validation with no fields (all optional)', async () => {
    const dto = toDto({});

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('allows null office (ValidateIf skips validation)', async () => {
    const dto = toDto({ office: null });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('allows null shift (ValidateIf skips validation)', async () => {
    const dto = toDto({ shift: null });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects invalid office value', async () => {
    const dto = toDto({ office: '99' });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('office');
  });

  it('rejects invalid shift value', async () => {
    const dto = toDto({ shift: '10:00-18:00' });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('shift');
  });

  it('rejects name shorter than 3 characters', async () => {
    const dto = toDto({ name: 'AB' });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
  });

  it('rejects documentId with letters', async () => {
    const dto = toDto({ documentId: '1234abc' });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('documentId');
  });
});
