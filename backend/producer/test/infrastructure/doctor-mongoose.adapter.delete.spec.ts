import { NotFoundException } from '@nestjs/common';
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

describe('DoctorMongooseAdapter - softDelete (Infrastructure)', () => {
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

    it('sets status to inactive and returns the updated doctor', async () => {
        const doc = makeDoctorDoc({ status: 'inactive' });
        mockModel.findByIdAndUpdate.mockReturnValue({
            exec: jest.fn().mockResolvedValue(doc),
        });

        const result = await adapter.softDelete('doc-id-1');

        expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
            'doc-id-1',
            { status: 'inactive' },
            { new: true },
        );
        expect(result.status).toBe('inactive');
        expect(result._id).toBe('doc-id-1');
    });

    it('throws NotFoundException when doctor does not exist', async () => {
        mockModel.findByIdAndUpdate.mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
        });

        await expect(adapter.softDelete('non-existent')).rejects.toThrow(NotFoundException);
    });
});
