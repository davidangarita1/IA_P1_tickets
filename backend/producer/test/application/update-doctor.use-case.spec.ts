import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UpdateDoctorUseCase } from '../../src/doctors/application/use-cases/update-doctor.use-case';
import { IDoctorRepository } from '../../src/doctors/domain/ports/doctor.repository';
import { Doctor } from '../../src/doctors/domain/entities/doctor.entity';

describe('UpdateDoctorUseCase (Application)', () => {
    const mockRepository: jest.Mocked<IDoctorRepository> = {
        create: jest.fn(),
        findAll: jest.fn(),
        findById: jest.fn(),
        findByDocumentId: jest.fn(),
        findByOfficeAndShift: jest.fn(),
        findAvailableShifts: jest.fn(),
        update: jest.fn(),
    };

    let useCase: UpdateDoctorUseCase;

    const makeDoctor = (overrides: Partial<ConstructorParameters<typeof Doctor>[0]> = {}): Doctor =>
        new Doctor({
            id: 'doc-1',
            name: 'Juan García',
            documentId: '12345678',
            office: '2',
            shift: '06:00-14:00',
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
            ...overrides,
        });

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new UpdateDoctorUseCase(mockRepository);
    });

    it('updates name successfully', async () => {
        const existing = makeDoctor();
        const updated = makeDoctor({ name: 'Pedro López' });
        mockRepository.findById.mockResolvedValue(existing);
        mockRepository.update.mockResolvedValue(updated);

        const result = await useCase.execute('doc-1', { name: 'Pedro López' });

        expect(result.name).toBe('Pedro López');
        expect(mockRepository.findById).toHaveBeenCalledWith('doc-1');
        expect(mockRepository.update).toHaveBeenCalledWith('doc-1', { name: 'Pedro López' });
    });

    it('updates office and shift successfully', async () => {
        const existing = makeDoctor();
        const updated = makeDoctor({ office: '4', shift: '14:00-22:00' });
        mockRepository.findById.mockResolvedValue(existing);
        mockRepository.findByOfficeAndShift.mockResolvedValue(null);
        mockRepository.update.mockResolvedValue(updated);

        const result = await useCase.execute('doc-1', { office: '4', shift: '14:00-22:00' });

        expect(result.office).toBe('4');
        expect(result.shift).toBe('14:00-22:00');
        expect(mockRepository.findByOfficeAndShift).toHaveBeenCalledWith('4', '14:00-22:00');
    });

    it('throws NotFoundException when doctor does not exist', async () => {
        mockRepository.findById.mockResolvedValue(null);

        await expect(
            useCase.execute('non-existent', { name: 'Test' }),
        ).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when new office+shift is already taken', async () => {
        const existing = makeDoctor();
        const conflict = makeDoctor({ id: 'doc-other' });
        mockRepository.findById.mockResolvedValue(existing);
        mockRepository.findByOfficeAndShift.mockResolvedValue(conflict);

        await expect(
            useCase.execute('doc-1', { office: '2', shift: '14:00-22:00' }),
        ).rejects.toThrow(ConflictException);
    });

    it('skips office+shift check when neither office nor shift changes', async () => {
        const existing = makeDoctor();
        const updated = makeDoctor({ name: 'Nuevo Nombre' });
        mockRepository.findById.mockResolvedValue(existing);
        mockRepository.update.mockResolvedValue(updated);

        await useCase.execute('doc-1', { name: 'Nuevo Nombre' });

        expect(mockRepository.findByOfficeAndShift).not.toHaveBeenCalled();
    });

    it('skips office+shift conflict check when the conflicting doctor is the same being updated', async () => {
        const existing = makeDoctor();
        mockRepository.findById.mockResolvedValue(existing);
        mockRepository.findByOfficeAndShift.mockResolvedValue(existing);
        mockRepository.update.mockResolvedValue(existing);

        const result = await useCase.execute('doc-1', { office: '2', shift: '06:00-14:00' });

        expect(result).toEqual(existing);
    });

    it('throws BadRequestException when office is set but shift is null', async () => {
        const existing = makeDoctor({ office: null, shift: null });
        mockRepository.findById.mockResolvedValue(existing);

        await expect(
            useCase.execute('doc-1', { office: '3', shift: null }),
        ).rejects.toThrow(BadRequestException);
    });

    it('throws ConflictException when documentId already belongs to another doctor', async () => {
        const existing = makeDoctor();
        const otherDoctor = makeDoctor({ id: 'doc-other', documentId: '99999999' });
        mockRepository.findById.mockResolvedValue(existing);
        mockRepository.findByDocumentId.mockResolvedValue(otherDoctor);

        await expect(
            useCase.execute('doc-1', { documentId: '99999999' }),
        ).rejects.toThrow(ConflictException);
    });

    it('allows updating documentId when no conflict exists', async () => {
        const existing = makeDoctor();
        const updated = makeDoctor({ documentId: '87654321' });
        mockRepository.findById.mockResolvedValue(existing);
        mockRepository.findByDocumentId.mockResolvedValue(null);
        mockRepository.update.mockResolvedValue(updated);

        const result = await useCase.execute('doc-1', { documentId: '87654321' });

        expect(result.documentId).toBe('87654321');
    });

    it('skips documentId conflict check when documentId does not change', async () => {
        const existing = makeDoctor();
        const updated = makeDoctor({ name: 'Otro Nombre' });
        mockRepository.findById.mockResolvedValue(existing);
        mockRepository.update.mockResolvedValue(updated);

        await useCase.execute('doc-1', { name: 'Otro Nombre' });

        expect(mockRepository.findByDocumentId).not.toHaveBeenCalled();
    });

    it('allows removing office and shift by setting both to null', async () => {
        const existing = makeDoctor();
        const updated = makeDoctor({ office: null, shift: null });
        mockRepository.findById.mockResolvedValue(existing);
        mockRepository.update.mockResolvedValue(updated);

        const result = await useCase.execute('doc-1', { office: null, shift: null });

        expect(result.office).toBeNull();
        expect(result.shift).toBeNull();
    });
});
