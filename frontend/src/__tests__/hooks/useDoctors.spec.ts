import { renderHook, act, waitFor } from '@testing-library/react';
import { useDoctors } from '@/hooks/useDoctors';
import { mockDoctorService, buildDoctor } from '../mocks/factories';

describe('useDoctors', () => {
  it('starts with empty doctors and no error', () => {
    const service = mockDoctorService([]);

    const { result } = renderHook(() => useDoctors(service));

    expect(result.current.doctors).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('loads doctors on mount', async () => {
    const doctor = buildDoctor();
    const service = mockDoctorService([doctor]);

    const { result } = renderHook(() => useDoctors(service));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.doctors).toHaveLength(1);
    expect(result.current.doctors[0]).toEqual(doctor);
    expect(service.getAll).toHaveBeenCalledTimes(1);
  });

  it('sets loading to true while fetching', async () => {
    let resolveGetAll!: (val: ReturnType<typeof buildDoctor>[]) => void;
    const service = mockDoctorService([]);
    service.getAll.mockReturnValueOnce(
      new Promise((res) => {
        resolveGetAll = res;
      }),
    );

    const { result } = renderHook(() => useDoctors(service));

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolveGetAll([]);
    });

    expect(result.current.loading).toBe(false);
  });

  it('sets error when getAll throws HTTP_ERROR_401', async () => {
    const service = mockDoctorService();
    service.getAll.mockRejectedValueOnce(new Error('HTTP_ERROR_401'));

    const { result } = renderHook(() => useDoctors(service));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('No autorizado. Inicie sesión nuevamente.');
  });

  it('sets error when getAll throws HTTP_ERROR_500', async () => {
    const service = mockDoctorService();
    service.getAll.mockRejectedValueOnce(new Error('HTTP_ERROR_500'));

    const { result } = renderHook(() => useDoctors(service));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Error del servidor. Intente más tarde.');
  });

  it('sets generic error message for unknown errors', async () => {
    const service = mockDoctorService();
    service.getAll.mockRejectedValueOnce(new Error('SOME_UNKNOWN'));

    const { result } = renderHook(() => useDoctors(service));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Error al cargar médicos.');
  });

  it('sets generic error message for non-Error throw', async () => {
    const service = mockDoctorService();
    service.getAll.mockRejectedValueOnce('plain string error');

    const { result } = renderHook(() => useDoctors(service));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Error al cargar médicos.');
  });

  it('create delegates to doctorService.create and returns the doctor', async () => {
    const doctor = buildDoctor();
    const service = mockDoctorService([doctor]);
    service.create.mockResolvedValueOnce(doctor);

    const { result } = renderHook(() => useDoctors(service));
    await waitFor(() => expect(result.current.loading).toBe(false));

    const data = { name: 'Test Doc', documentId: '12345678' };
    const created = await result.current.create(data);

    expect(service.create).toHaveBeenCalledWith(data);
    expect(created).toEqual(doctor);
  });

  it('refresh reloads the doctor list', async () => {
    const service = mockDoctorService([]);

    const { result } = renderHook(() => useDoctors(service));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.doctors).toHaveLength(0);

    const newDoctor = buildDoctor();
    service.getAll.mockResolvedValueOnce([newDoctor]);

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.doctors).toHaveLength(1);
    expect(result.current.doctors[0]).toEqual(newDoctor);
  });

  it('clears previous error on refresh', async () => {
    const service = mockDoctorService();
    service.getAll.mockRejectedValueOnce(new Error('HTTP_ERROR_500'));

    const { result } = renderHook(() => useDoctors(service));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).not.toBeNull();

    service.getAll.mockResolvedValueOnce([]);

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.doctors).toEqual([]);
  });
});
