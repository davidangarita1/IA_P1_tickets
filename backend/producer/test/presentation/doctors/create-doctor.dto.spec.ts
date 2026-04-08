import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateDoctorDto } from '../../../src/doctors/presentation/dtos/create-doctor.dto';

describe('CreateDoctorDto (Presentation - DTO)', () => {
  function toDto(plain: Record<string, unknown>): CreateDoctorDto {
    return plainToInstance(CreateDoctorDto, plain);
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

  it('passes validation with only required fields (name + documentId)', async () => {
    const dto = toDto({
      name: 'Ana Reyes',
      documentId: '9876543',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('passes validation with name of exactly 3 characters', async () => {
    const dto = toDto({
      name: 'Ana',
      documentId: '1234567',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('passes validation with documentId of exactly 7 digits', async () => {
    const dto = toDto({
      name: 'Juan García',
      documentId: '1234567',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('passes validation with documentId of exactly 10 digits', async () => {
    const dto = toDto({
      name: 'Juan García',
      documentId: '1234567890',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('allows null office', async () => {
    const dto = toDto({
      name: 'Juan García',
      documentId: '12345678',
      office: null,
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('allows null shift', async () => {
    const dto = toDto({
      name: 'Juan García',
      documentId: '12345678',
      shift: null,
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('accepts shift 14:00-22:00', async () => {
    const dto = toDto({
      name: 'Juan García',
      documentId: '12345678',
      office: '1',
      shift: '14:00-22:00',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('accepts all valid office values from 1 to 10', async () => {
    for (const office of ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']) {
      const dto = toDto({
        name: 'Juan García',
        documentId: '12345678',
        office,
        shift: '06:00-14:00',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    }
  });

  it('rejects empty name', async () => {
    const dto = toDto({
      name: '',
      documentId: '12345678',
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
  });

  it('rejects missing name', async () => {
    const dto = toDto({
      documentId: '12345678',
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const nameError = errors.find((e) => e.property === 'name');
    expect(nameError).toBeDefined();
  });

  it('rejects name shorter than 3 characters', async () => {
    const dto = toDto({
      name: 'AB',
      documentId: '12345678',
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
  });

  it('rejects name longer than 100 characters', async () => {
    const dto = toDto({
      name: 'A'.repeat(101),
      documentId: '12345678',
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
  });

  it('rejects empty documentId', async () => {
    const dto = toDto({
      name: 'Juan García',
      documentId: '',
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'documentId')).toBe(true);
  });

  it('rejects missing documentId', async () => {
    const dto = toDto({
      name: 'Juan García',
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'documentId')).toBe(true);
  });

  it('rejects documentId with letters', async () => {
    const dto = toDto({
      name: 'Juan García',
      documentId: '1234abc',
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('documentId');
  });

  it('rejects documentId shorter than 7 digits', async () => {
    const dto = toDto({
      name: 'Juan García',
      documentId: '123456',
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('documentId');
  });

  it('rejects documentId longer than 10 digits', async () => {
    const dto = toDto({
      name: 'Juan García',
      documentId: '12345678901',
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('documentId');
  });

  it('rejects documentId with special characters', async () => {
    const dto = toDto({
      name: 'Juan García',
      documentId: '123-456-78',
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('documentId');
  });

  it('rejects invalid office value', async () => {
    const dto = toDto({
      name: 'Juan García',
      documentId: '12345678',
      office: '99',
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('office');
  });

  it('rejects office value of 0', async () => {
    const dto = toDto({
      name: 'Juan García',
      documentId: '12345678',
      office: '0',
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('office');
  });

  it('rejects invalid shift value', async () => {
    const dto = toDto({
      name: 'Juan García',
      documentId: '12345678',
      shift: '10:00-18:00',
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('shift');
  });

  it('rejects shift with incorrect format', async () => {
    const dto = toDto({
      name: 'Juan García',
      documentId: '12345678',
      shift: 'mañana',
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('shift');
  });
});
