jest.mock('@/infrastructure/cookies/cookieUtils');

import { HttpDoctorAdapter } from '@/infrastructure/adapters/HttpDoctorAdapter';
import { getAuthCookie } from '@/infrastructure/cookies/cookieUtils';
import { buildDoctor } from '@/__tests__/mocks/factories';
import type { CreateDoctorData } from '@/domain/Doctor';

const mockedGetAuthCookie = getAuthCookie as jest.MockedFunction<typeof getAuthCookie>;
const mockFetch = jest.fn() as jest.MockedFunction<typeof global.fetch>;
global.fetch = mockFetch;

function mockResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response;
}

describe('HttpDoctorAdapter', () => {
  const BASE = 'http://localhost:3000';
  let adapter: HttpDoctorAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new HttpDoctorAdapter(BASE);
    mockedGetAuthCookie.mockReturnValue('test-token');
  });

  describe('getAll()', () => {
    it('fetches doctors with auth header when token exists', async () => {
      const doctors = [buildDoctor()];
      mockFetch.mockResolvedValueOnce(mockResponse(200, doctors));

      const result = await adapter.getAll();

      expect(mockFetch).toHaveBeenCalledWith(`${BASE}/api/v1/doctors`, {
        headers: { Authorization: 'Bearer test-token' },
      });
      expect(result).toEqual(doctors);
    });

    it('fetches without auth header when no token', async () => {
      mockedGetAuthCookie.mockReturnValue(null);
      mockFetch.mockResolvedValueOnce(mockResponse(200, []));

      await adapter.getAll();

      expect(mockFetch).toHaveBeenCalledWith(`${BASE}/api/v1/doctors`, {
        headers: {},
      });
    });

    it('throws user-friendly message on unauthorized response', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(401, {}));

      await expect(adapter.getAll()).rejects.toThrow('No autorizado. Inicie sesión nuevamente.');
    });

    it('throws user-friendly message on server error', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(500, {}));

      await expect(adapter.getAll()).rejects.toThrow('Error del servidor. Intente más tarde.');
    });

    it('appends page and limit as query params when provided', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(200, { data: [], total: 0, page: 2, limit: 10 }));

      await adapter.getAll({ page: 2, limit: 10 });

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE}/api/v1/doctors?page=2&limit=10`,
        expect.any(Object),
      );
    });

    it('appends only page when limit is not provided', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(200, { data: [], total: 0, page: 1, limit: 25 }));

      await adapter.getAll({ page: 1 });

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE}/api/v1/doctors?page=1`,
        expect.any(Object),
      );
    });
  });

  describe('create()', () => {
    const data: CreateDoctorData = {
      name: 'Dr. Test',
      documentId: '12345678',
    };

    it('creates a doctor and returns the created doctor', async () => {
      const doctor = buildDoctor();
      mockFetch.mockResolvedValueOnce(mockResponse(201, doctor));

      const result = await adapter.create(data);

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE}/api/v1/doctors`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          }),
        }),
      );
      expect(result).toEqual(doctor);
    });

    it('throws the backend message on 409 conflict', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(409, { message: 'Cédula ya existe' }));

      await expect(adapter.create(data)).rejects.toThrow('Cédula ya existe');
    });

    it('throws CONFLICT when 409 body has no message', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(409, {}));

      await expect(adapter.create(data)).rejects.toThrow('CONFLICT');
    });

    it('throws user-friendly message on non-409 error', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(500, {}));

      await expect(adapter.create(data)).rejects.toThrow('Error del servidor. Intente más tarde.');
    });

    it('omits Authorization header when no token', async () => {
      mockedGetAuthCookie.mockReturnValue(null);
      mockFetch.mockResolvedValueOnce(mockResponse(201, buildDoctor()));

      await adapter.create(data);

      const call = mockFetch.mock.calls[0][1] as RequestInit;
      const headers = call.headers as Record<string, string>;
      expect(headers).not.toHaveProperty('Authorization');
    });
  });

  describe('getAvailableShifts()', () => {
    it('fetches available shifts with consultorio param', async () => {
      const response = {
        office: '1',
        availableShifts: ['06:00-14:00' as const],
        occupiedShifts: [] as ('06:00-14:00' | '14:00-22:00')[],
      };
      mockFetch.mockResolvedValueOnce(mockResponse(200, response));

      const result = await adapter.getAvailableShifts('1');

      expect(mockFetch).toHaveBeenCalledWith(`${BASE}/api/v1/doctors/available-shifts?office=1`, {
        headers: { Authorization: 'Bearer test-token' },
      });
      expect(result).toEqual(response);
    });

    it('includes exclude_doctor_id when provided', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse(200, {
          consultorio: '1',
          available_shifts: [],
          occupied_shifts: [],
        }),
      );

      await adapter.getAvailableShifts('1', 'doc-123');

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE}/api/v1/doctors/available-shifts?office=1&exclude_doctor_id=doc-123`,
        expect.any(Object),
      );
    });

    it('throws user-friendly message on server error', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(500, {}));

      await expect(adapter.getAvailableShifts('1')).rejects.toThrow('Error del servidor. Intente más tarde.');
    });

    it('fetches without auth header when no token', async () => {
      mockedGetAuthCookie.mockReturnValue(null);
      mockFetch.mockResolvedValueOnce(
        mockResponse(200, {
          office: '1',
          availableShifts: [],
          occupiedShifts: [],
        }),
      );

      await adapter.getAvailableShifts('1');

      expect(mockFetch).toHaveBeenCalledWith(expect.any(String), {
        headers: {},
      });
    });
  });
});
