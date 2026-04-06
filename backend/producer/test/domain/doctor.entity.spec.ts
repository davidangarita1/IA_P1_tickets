import { Doctor } from '../../src/doctors/domain/entities/doctor.entity';

describe('Doctor (Domain)', () => {
    it('creates a doctor with all fields', () => {
        const doctor = new Doctor({
            id: 'doc-1',
            nombre: 'Juan García',
            cedula: '12345678',
            consultorio: '2',
            franjaHoraria: '06:00-14:00',
            status: 'Activo',
            createdAt: new Date('2026-01-01'),
            updatedAt: new Date('2026-01-01'),
        });

        expect(doctor.id).toBe('doc-1');
        expect(doctor.nombre).toBe('Juan García');
        expect(doctor.cedula).toBe('12345678');
        expect(doctor.consultorio).toBe('2');
        expect(doctor.franjaHoraria).toBe('06:00-14:00');
        expect(doctor.status).toBe('Activo');
        expect(doctor.createdAt).toEqual(new Date('2026-01-01'));
        expect(doctor.updatedAt).toEqual(new Date('2026-01-01'));
    });

    it('creates a doctor without consultorio and franjaHoraria', () => {
        const doctor = new Doctor({
            id: 'doc-2',
            nombre: 'Jose Martínez',
            cedula: '87654321',
            consultorio: null,
            franjaHoraria: null,
            status: 'Activo',
            createdAt: new Date('2026-01-01'),
            updatedAt: new Date('2026-01-01'),
        });

        expect(doctor.consultorio).toBeNull();
        expect(doctor.franjaHoraria).toBeNull();
    });

    it('creates an inactive doctor', () => {
        const doctor = new Doctor({
            id: 'doc-3',
            nombre: 'Pedro López',
            cedula: '11223344',
            consultorio: null,
            franjaHoraria: null,
            status: 'Inactivo',
            createdAt: new Date('2026-01-01'),
            updatedAt: new Date('2026-01-01'),
        });

        expect(doctor.status).toBe('Inactivo');
    });
});
