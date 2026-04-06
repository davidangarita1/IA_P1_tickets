import { ConflictException } from '@nestjs/common';
import { CreateDoctorUseCase } from '../../src/doctors/application/use-cases/create-doctor.use-case';
import { IDoctorRepository } from '../../src/doctors/domain/ports/doctor.repository';
import { Doctor } from '../../src/doctors/domain/entities/doctor.entity';

describe('CreateDoctorUseCase (Application)', () => {
    const mockRepository: jest.Mocked<IDoctorRepository> = {
        create: jest.fn(),
        findAll: jest.fn(),
        findByCedula: jest.fn(),
        findByConsultorioAndFranja: jest.fn(),
        findAvailableShifts: jest.fn(),
    };

    let useCase: CreateDoctorUseCase;

    const makeDoctor = (): Doctor =>
        new Doctor({
            id: 'doc-1',
            nombre: 'Juan García',
            cedula: '12345678',
            consultorio: '2',
            franjaHoraria: '06:00-14:00',
            status: 'Activo',
            createdAt: new Date(),
            updatedAt: new Date(),
        });

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new CreateDoctorUseCase(mockRepository);
    });

    it('creates a doctor when no conflicts exist', async () => {
        mockRepository.findByCedula.mockResolvedValue(null);
        mockRepository.findByConsultorioAndFranja.mockResolvedValue(null);
        const created = makeDoctor();
        mockRepository.create.mockResolvedValue(created);

        const result = await useCase.execute({
            nombre: 'Juan García',
            cedula: '12345678',
            consultorio: '2',
            franjaHoraria: '06:00-14:00',
        });

        expect(result).toEqual(created);
        expect(mockRepository.findByCedula).toHaveBeenCalledWith('12345678');
        expect(mockRepository.findByConsultorioAndFranja).toHaveBeenCalledWith('2', '06:00-14:00');
        expect(mockRepository.create).toHaveBeenCalledTimes(1);
    });

    it('creates a doctor without consultorio and franja', async () => {
        mockRepository.findByCedula.mockResolvedValue(null);
        const created = new Doctor({
            id: 'doc-2',
            nombre: 'Juan García',
            cedula: '12345678',
            consultorio: null,
            franjaHoraria: null,
            status: 'Activo',
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        mockRepository.create.mockResolvedValue(created);

        const result = await useCase.execute({
            nombre: 'Juan García',
            cedula: '12345678',
            consultorio: null,
            franjaHoraria: null,
        });

        expect(result).toEqual(created);
        expect(mockRepository.findByConsultorioAndFranja).not.toHaveBeenCalled();
    });

    it('throws ConflictException when cedula already exists', async () => {
        mockRepository.findByCedula.mockResolvedValue(makeDoctor());

        await expect(
            useCase.execute({ nombre: 'Otro', cedula: '12345678' }),
        ).rejects.toThrow(ConflictException);

        expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('throws ConflictException when consultorio+franja combination is taken', async () => {
        mockRepository.findByCedula.mockResolvedValue(null);
        mockRepository.findByConsultorioAndFranja.mockResolvedValue(makeDoctor());

        await expect(
            useCase.execute({
                nombre: 'Otro',
                cedula: '99988877',
                consultorio: '2',
                franjaHoraria: '06:00-14:00',
            }),
        ).rejects.toThrow(ConflictException);

        expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('skips franja conflict check when only consultorio is provided without franja', async () => {
        mockRepository.findByCedula.mockResolvedValue(null);
        const created = new Doctor({
            id: 'doc-3',
            nombre: 'Ana Torres',
            cedula: '55566677',
            consultorio: '3',
            franjaHoraria: null,
            status: 'Activo',
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        mockRepository.create.mockResolvedValue(created);

        const result = await useCase.execute({
            nombre: 'Ana Torres',
            cedula: '55566677',
            consultorio: '3',
            franjaHoraria: null,
        });

        expect(result).toEqual(created);
        expect(mockRepository.findByConsultorioAndFranja).not.toHaveBeenCalled();
    });
});
