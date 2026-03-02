import { TurnoMongooseAdapter } from '../../src/infrastructure/adapters/turno-mongoose.adapter';
import { IPrioritySortingStrategy } from '../../src/domain/ports/IPrioritySortingStrategy';
import { Turno } from '../../src/domain/entities/turno.entity';

// Mock del documento Mongoose
const mockTurnoDoc = (overrides = {}) => ({
    _id: 'turno-id-1',
    nombre: 'Paciente Test',
    cedula: 12345,
    consultorio: null,
    estado: 'espera',
    priority: 'media',
    timestamp: Date.now(),
    finAtencionAt: null,
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
});

describe('TurnoMongooseAdapter (Infrastructure)', () => {
    const mockPrioritySorting: jest.Mocked<IPrioritySortingStrategy> = {
        sort: jest.fn((turnos) => turnos),
    };

    const mockModel = {
        findOne: jest.fn(),
        find: jest.fn(),
        findOneAndUpdate: jest.fn(),
        updateMany: jest.fn(),
    };

    let adapter: TurnoMongooseAdapter;

    beforeEach(() => {
        jest.clearAllMocks();
        adapter = new TurnoMongooseAdapter(mockModel as any, mockPrioritySorting);
    });

    describe('findActivoPorCedula', () => {
        it('retorna turno si existe uno activo para la cédula', async () => {
            // Arrange
            const doc = mockTurnoDoc({ estado: 'espera' });
            mockModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(doc),
            });

            // Act
            const result = await adapter.findActivoPorCedula(12345);

            // Assert
            expect(result).toBeInstanceOf(Turno);
            expect(result?.cedula).toBe(12345);
        });

        it('retorna null si no hay turno activo', async () => {
            // Arrange
            mockModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });

            // Act
            const result = await adapter.findActivoPorCedula(99999);

            // Assert
            expect(result).toBeNull();
        });
    });

    describe('save', () => {
        it('crea y guarda un nuevo turno', async () => {
            // Arrange
            const data = { cedula: 12345, nombre: 'Nuevo Paciente', priority: 'alta' as const };
            const savedDoc = mockTurnoDoc({ ...data, _id: 'new-id' });

            // Mock the Model constructor to return a document with save method
            const mockSave = jest.fn().mockResolvedValue(savedDoc);
            (adapter as any).turnoModel = function (docData: any) {
                return { ...savedDoc, ...docData, save: mockSave };
            };

            // Act
            const result = await adapter.save(data);

            // Assert
            expect(result).toBeInstanceOf(Turno);
            expect(mockSave).toHaveBeenCalled();
        });
    });

    describe('findPacientesEnEspera', () => {
        it('retorna pacientes ordenados por prioridad', async () => {
            // Arrange
            const docs = [mockTurnoDoc(), mockTurnoDoc({ _id: 'id-2', cedula: 67890 })];
            mockModel.find.mockReturnValue({
                exec: jest.fn().mockResolvedValue(docs),
            });

            // Act
            const result = await adapter.findPacientesEnEspera();

            // Assert
            expect(result).toHaveLength(2);
            expect(mockPrioritySorting.sort).toHaveBeenCalled();
        });
    });

    describe('getConsultoriosOcupados', () => {
        it('retorna lista de consultorios ocupados', async () => {
            // Arrange
            const docs = [{ consultorio: '1' }, { consultorio: '2' }];
            mockModel.find.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    lean: jest.fn().mockReturnValue({
                        exec: jest.fn().mockResolvedValue(docs),
                    }),
                }),
            });

            // Act
            const result = await adapter.getConsultoriosOcupados();

            // Assert
            expect(result).toEqual(['1', '2']);
        });

        it('filtra consultorios null o undefined', async () => {
            // Arrange
            const docs = [{ consultorio: '1' }, { consultorio: null }, { consultorio: undefined }];
            mockModel.find.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    lean: jest.fn().mockReturnValue({
                        exec: jest.fn().mockResolvedValue(docs),
                    }),
                }),
            });

            // Act
            const result = await adapter.getConsultoriosOcupados();

            // Assert
            expect(result).toEqual(['1']);
        });
    });

    describe('asignarConsultorio', () => {
        it('asigna consultorio y retorna turno actualizado', async () => {
            // Arrange
            const updatedDoc = mockTurnoDoc({ consultorio: '3', estado: 'llamado' });
            mockModel.findOneAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue(updatedDoc),
            });

            // Act
            const result = await adapter.asignarConsultorio('turno-id-1', '3');

            // Assert
            expect(result).toBeInstanceOf(Turno);
            expect(result?.consultorio).toBe('3');
        });

        it('retorna null si el turno no está en espera', async () => {
            // Arrange
            mockModel.findOneAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });

            // Act
            const result = await adapter.asignarConsultorio('turno-inexistente', '1');

            // Assert
            expect(result).toBeNull();
        });
    });

    describe('finalizarTurnosLlamados', () => {
        it('finaliza turnos expirados y retorna lista', async () => {
            // Arrange
            const expirados = [mockTurnoDoc({ estado: 'llamado' })];
            mockModel.find.mockReturnValue({
                exec: jest.fn().mockResolvedValue(expirados),
            });
            mockModel.updateMany.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
            });

            // Act
            const result = await adapter.finalizarTurnosLlamados();

            // Assert
            expect(result).toHaveLength(1);
            expect(result[0].estado).toBe('atendido');
        });

        it('retorna array vacío si no hay turnos expirados', async () => {
            // Arrange
            mockModel.find.mockReturnValue({
                exec: jest.fn().mockResolvedValue([]),
            });

            // Act
            const result = await adapter.finalizarTurnosLlamados();

            // Assert
            expect(result).toHaveLength(0);
            expect(mockModel.updateMany).not.toHaveBeenCalled();
        });
    });
});
