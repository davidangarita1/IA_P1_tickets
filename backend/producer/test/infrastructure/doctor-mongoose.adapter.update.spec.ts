import { DoctorMongooseAdapter } from '../../src/doctors/infrastructure/adapters/doctor-mongoose.adapter';

const makeDoctorDoc = (overrides = {}) => ({
  _id: 'doc-id-1',
  name: 'Juan García',
  documentId: '12345678',
  office: '2',
  shift: '06:00-14:00',
  status: 'active',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  ...overrides,
});

describe('DoctorMongooseAdapter - update and findById (Infrastructure)', () => {
  const mockModel = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  let adapter: DoctorMongooseAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new DoctorMongooseAdapter(mockModel as any);
  });

  describe('findById', () => {
    it('returns a doctor when found', async () => {
      const doc = makeDoctorDoc();
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(doc),
      });

      const result = await adapter.findById('doc-id-1');

      expect(result).not.toBeNull();
      expect(result?._id).toBe('doc-id-1');
      expect(result?.name).toBe('Juan García');
      expect(mockModel.findById).toHaveBeenCalledWith('doc-id-1');
    });

    it('returns null when doctor is not found', async () => {
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await adapter.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('updates and returns the mapped doctor', async () => {
      const updatedDoc = makeDoctorDoc({ name: 'Pedro López', office: '4', shift: '14:00-22:00' });
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedDoc),
      });

      const result = await adapter.update('doc-id-1', {
        name: 'Pedro López',
        office: '4',
        shift: '14:00-22:00',
      });

      expect(result.name).toBe('Pedro López');
      expect(result.office).toBe('4');
      expect(result.shift).toBe('14:00-22:00');
      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'doc-id-1',
        { name: 'Pedro López', office: '4', shift: '14:00-22:00' },
        { new: true },
      );
    });

    it('throws error when doctor to update is not found', async () => {
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(adapter.update('non-existent', { name: 'Test' })).rejects.toThrow();
    });
  });
});
