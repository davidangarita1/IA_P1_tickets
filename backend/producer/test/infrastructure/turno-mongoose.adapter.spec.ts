import { NotFoundException } from '@nestjs/common';
import { TurnoMongooseAdapter } from '../../src/infrastructure/adapters/turno-mongoose.adapter';

// Mock del documento Mongoose
const mockTurnoDoc = (overrides = {}) => ({
  _id: 'turno-id-1',
  nombre: 'Paciente Test',
  cedula: 12345,
  consultorio: '1',
  estado: 'espera',
  priority: 'media',
  timestamp: Date.now(),
  finAtencionAt: null,
  ...overrides,
});

describe('TurnoMongooseAdapter (Infrastructure)', () => {
  const mockModel = {
    find: jest.fn(),
  };

  let adapter: TurnoMongooseAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new TurnoMongooseAdapter(mockModel as any);
  });

  describe('findAll', () => {
    it('retorna todos los turnos ordenados por timestamp', async () => {
      // Arrange
      const docs = [mockTurnoDoc(), mockTurnoDoc({ _id: 'turno-id-2', cedula: 67890 })];
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(docs),
        }),
      });

      // Act
      const result = await adapter.findAll();

      // Assert
      expect(result).toHaveLength(2);
      expect(mockModel.find).toHaveBeenCalled();
    });

    it('retorna array vacío si no hay turnos', async () => {
      // Arrange
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      });

      // Act
      const result = await adapter.findAll();

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe('findByCedula', () => {
    it('retorna turnos filtrados por cédula', async () => {
      // Arrange
      const cedula = 12345;
      const docs = [mockTurnoDoc({ cedula })];
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(docs),
        }),
      });

      // Act
      const result = await adapter.findByCedula(cedula);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].cedula).toBe(cedula);
      expect(mockModel.find).toHaveBeenCalledWith({ cedula });
    });

    it('lanza NotFoundException si no hay turnos para la cédula', async () => {
      // Arrange
      const cedula = 99999;
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      });

      // Act & Assert
      await expect(adapter.findByCedula(cedula)).rejects.toThrow(NotFoundException);
    });
  });
});
