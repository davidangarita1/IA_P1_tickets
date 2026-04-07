jest.mock('@/infrastructure/cookies/cookieUtils');

import { HttpDoctorAdapter } from '@/infrastructure/adapters/HttpDoctorAdapter';
import { getAuthCookie } from '@/infrastructure/cookies/cookieUtils';

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

describe('HttpDoctorAdapter - remove()', () => {
  const BASE = 'http://localhost:3000';
  let adapter: HttpDoctorAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new HttpDoctorAdapter(BASE);
    mockedGetAuthCookie.mockReturnValue('test-token');
  });

  it('sends DELETE request with auth header', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(204, null));

    await adapter.remove('doc-1');

    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE}/api/v1/doctors/doc-1`,
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      }),
    );
  });

  it('throws backend message on 409 conflict', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse(409, {
        message:
          'No se puede dar de baja a un médico que se encuentra atendiendo un turno en este momento',
      }),
    );

    await expect(adapter.remove('doc-1')).rejects.toThrow(
      'No se puede dar de baja a un médico que se encuentra atendiendo un turno en este momento',
    );
  });

  it('throws CONFLICT when 409 body has no message', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(409, {}));

    await expect(adapter.remove('doc-1')).rejects.toThrow('CONFLICT');
  });

  it('throws HTTP_ERROR_404 when doctor not found', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(404, {}));

    await expect(adapter.remove('non-existent')).rejects.toThrow('HTTP_ERROR_404');
  });

  it('throws HTTP_ERROR_500 on server error', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(500, {}));

    await expect(adapter.remove('doc-1')).rejects.toThrow('HTTP_ERROR_500');
  });
});
