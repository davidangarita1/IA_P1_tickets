import { DoctorMongooseAdapter } from '../../src/infrastructure/adapters/doctor-mongoose.adapter';

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

describe('DoctorMongooseAdapter (Infrastructure)', () => {
  const mockModel = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    countDocuments: jest.fn(),
  };

  let adapter: DoctorMongooseAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new DoctorMongooseAdapter(mockModel as any);
  });

  describe('create', () => {
    it('creates and returns a mapped doctor', async () => {
      const doc = makeDoctorDoc();
      mockModel.create.mockResolvedValue(doc);

      const result = await adapter.create({
        name: 'Juan García',
        documentId: '12345678',
        office: '2',
        shift: '06:00-14:00',
        status: 'active',
      });

      expect(result._id).toBe('doc-id-1');
      expect(result.name).toBe('Juan García');
      expect(result.documentId).toBe('12345678');
      expect(result.office).toBe('2');
      expect(result.shift).toBe('06:00-14:00');
      expect(result.status).toBe('active');
    });
  });

  describe('findAll', () => {
    it('returns active doctors mapped to domain entities', async () => {
      const docs = [makeDoctorDoc(), makeDoctorDoc({ _id: 'doc-id-2', cedula: '87654321' })];
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(docs),
      });

      const result = await adapter.findAll();

      expect(result).toHaveLength(2);
      expect(mockModel.find).toHaveBeenCalledWith({ status: 'active' });
    });

    it('returns empty array when no active doctors exist', async () => {
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await adapter.findAll();

      expect(result).toHaveLength(0);
    });
  });

  describe('findByDocumentId', () => {
    it('returns a doctor when found', async () => {
      const doc = makeDoctorDoc();
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(doc),
      });

      const result = await adapter.findByDocumentId('12345678');

      expect(result).not.toBeNull();
      expect(result?.documentId).toBe('12345678');
      expect(mockModel.findOne).toHaveBeenCalledWith({ documentId: '12345678' });
    });

    it('returns null when doctor is not found', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await adapter.findByDocumentId('99999999');

      expect(result).toBeNull();
    });
  });

  describe('findByOfficeAndShift', () => {
    it('returns a doctor when office and shift match', async () => {
      const doc = makeDoctorDoc();
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(doc),
      });

      const result = await adapter.findByOfficeAndShift('2', '06:00-14:00');

      expect(result).not.toBeNull();
      expect(mockModel.findOne).toHaveBeenCalledWith({
        office: '2',
        shift: '06:00-14:00',
        status: 'active',
      });
    });

    it('returns null when no doctor matches', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await adapter.findByOfficeAndShift('5', '14:00-22:00');

      expect(result).toBeNull();
    });
  });

  describe('findAvailableShifts', () => {
    it('returns available and occupied shifts for an office', async () => {
      const docs = [makeDoctorDoc({ shift: '06:00-14:00' })];
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(docs),
      });

      const result = await adapter.findAvailableShifts('2');

      expect(result.occupiedShifts).toContain('06:00-14:00');
      expect(result.availableShifts).toContain('14:00-22:00');
    });

    it('returns all shifts as available when no doctors assigned', async () => {
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await adapter.findAvailableShifts('7');

      expect(result.availableShifts).toHaveLength(2);
      expect(result.occupiedShifts).toHaveLength(0);
    });

    it('excludes a specific doctor when excludeDoctorId is provided', async () => {
      const docs = [makeDoctorDoc({ shift: '06:00-14:00' })];
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(docs),
      });

      await adapter.findAvailableShifts('2', 'doc-id-1');

      expect(mockModel.find).toHaveBeenCalledWith({
        office: '2',
        status: 'active',
        shift: { $ne: null },
        _id: { $ne: 'doc-id-1' },
      });
    });
  });

  describe('findAllPaginated', () => {
    it('returns paginated doctors with total count', async () => {
      const docs = [makeDoctorDoc(), makeDoctorDoc({ _id: 'doc-id-2' })];
      mockModel.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(docs),
          }),
        }),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(10),
      });

      const result = await adapter.findAllPaginated({ page: 1, limit: 2 });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(10);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(2);
    });

    it('applies correct skip offset for page 3', async () => {
      mockModel.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      await adapter.findAllPaginated({ page: 3, limit: 5 });

      const skipCall = mockModel.find().skip;
      expect(skipCall).toHaveBeenCalledWith(10);
    });
  });

  describe('findActiveByDocumentId', () => {
    it('returns an active doctor when found', async () => {
      const doc = makeDoctorDoc();
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(doc),
      });

      const result = await adapter.findActiveByDocumentId('12345678');

      expect(result).not.toBeNull();
      expect(result?.documentId).toBe('12345678');
      expect(mockModel.findOne).toHaveBeenCalledWith({ documentId: '12345678', status: 'active' });
    });

    it('returns null when no active doctor matches', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await adapter.findActiveByDocumentId('99999999');

      expect(result).toBeNull();
    });
  });
});
