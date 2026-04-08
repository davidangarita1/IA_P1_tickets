import { Doctor } from '../../src/domain/entities/doctor.entity';

describe('Doctor (Domain)', () => {
  it('creates a doctor with all fields', () => {
    const doctor = new Doctor({
      id: 'doc-1',
      name: 'Juan García',
      documentId: '12345678',
      office: '2',
      shift: '06:00-14:00',
      status: 'active',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    });

    expect(doctor._id).toBe('doc-1');
    expect(doctor.name).toBe('Juan García');
    expect(doctor.documentId).toBe('12345678');
    expect(doctor.office).toBe('2');
    expect(doctor.shift).toBe('06:00-14:00');
    expect(doctor.status).toBe('active');
    expect(doctor.createdAt).toEqual(new Date('2026-01-01'));
    expect(doctor.updatedAt).toEqual(new Date('2026-01-01'));
  });

  it('creates a doctor without office and shift', () => {
    const doctor = new Doctor({
      id: 'doc-2',
      name: 'Jose Martínez',
      documentId: '87654321',
      office: null,
      shift: null,
      status: 'active',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    });

    expect(doctor.office).toBeNull();
    expect(doctor.shift).toBeNull();
  });

  it('creates an inactive doctor', () => {
    const doctor = new Doctor({
      id: 'doc-3',
      name: 'Pedro López',
      documentId: '11223344',
      office: null,
      shift: null,
      status: 'inactive',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    });

    expect(doctor.status).toBe('inactive');
  });

  it('includes _id in JSON serialization (regression: CastError undefined)', () => {
    const doctor = new Doctor({
      id: 'doc-json',
      name: 'Test Serialization',
      documentId: '99999999',
      office: '1',
      shift: '06:00-14:00',
      status: 'active',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    });

    const serialized = JSON.parse(JSON.stringify(doctor));
    expect(serialized._id).toBe('doc-json');
    expect(serialized.id).toBeUndefined();
  });
});
