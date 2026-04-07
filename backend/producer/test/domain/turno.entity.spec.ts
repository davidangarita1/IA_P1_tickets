import { Turno } from '../../src/domain/entities/turno.entity';

describe('Turno (Domain)', () => {
  it('incluye finAtencionAt en payload cuando existe', () => {
    const turno = new Turno({
      id: 't1',
      nombre: 'Paciente 1',
      cedula: 123,
      consultorio: '2',
      estado: 'atendido',
      priority: 'alta',
      timestamp: 100,
      finAtencionAt: 200,
    });

    const payload = turno.toEventPayload();

    expect(payload).toEqual({
      id: 't1',
      nombre: 'Paciente 1',
      cedula: 123,
      consultorio: '2',
      estado: 'atendido',
      priority: 'alta',
      timestamp: 100,
      finAtencionAt: 200,
    });
  });

  it('omite finAtencionAt en payload cuando es null', () => {
    const turno = new Turno({
      id: 't2',
      nombre: 'Paciente 2',
      cedula: 456,
      consultorio: null,
      estado: 'espera',
      priority: 'media',
      timestamp: 101,
      finAtencionAt: null,
    });

    const payload = turno.toEventPayload();

    expect(payload).toEqual({
      id: 't2',
      nombre: 'Paciente 2',
      cedula: 456,
      consultorio: null,
      estado: 'espera',
      priority: 'media',
      timestamp: 101,
    });
    expect(payload).not.toHaveProperty('finAtencionAt');
  });
});
