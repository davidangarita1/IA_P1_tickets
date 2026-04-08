import { renderHook, act, waitFor } from '@testing-library/react';
import { useDoctors } from '@/hooks/useDoctors';
import { mockDoctorService, buildDoctor, buildPaginatedDoctors } from '../mocks/factories';

describe('useDoctors', () => {
  it('starts with empty doctors, total 0 and no error', () => {
    const service = mockDoctorService([]);

    const { result } = renderHook(() => useDoctors(service));

    expect(result.current.doctors).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it('loads doctors on mount and exposes total', async () => {
    const doctor = buildDoctor();
    const service = mockDoctorService([doctor]);

    const { result } = renderHook(() => useDoctors(service));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.doctors).toHaveLength(1);
    expect(result.current.total).toBe(1);
    expect(result.current.doctors[0]).toEqual(doctor);
    expect(service.getAll).toHaveBeenCalledTimes(1);
  });

  it('passes pagination params to doctorService.getAll', async () => {
    const service = mockDoctorService([]);
    const pagination = { page: 2, limit: 10 };

    const { result } = renderHook(() => useDoctors(service, pagination));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(service.getAll).toHaveBeenCalledWith(pagination);
  });

  it('sets loading to true while fetching', async () => {
    let resolveGetAll!: (val: ReturnType<typeof buildPaginatedDoctors>) => void;
    const service = mockDoctorService([]);
    service.getAll.mockReturnValueOnce(
      new Promise((res) => {
        resolveGetAll = res;
      }),
    );

    const { result } = renderHook(() => useDoctors(service));

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolveGetAll(buildPaginatedDoctors([]));
    });

    expect(result.current.loading).toBe(false);
  });

  it('sets error when getAll throws unauthorized error', async () => {
    const service = mockDoctorService();
    service.getAll.mockRejectedValueOnce(new Error('No autorizado. Inicie sesión nuevamente.'));

    const { result } = renderHook(() => useDoctors(service));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('No autorizado. Inicie sesión nuevamente.');
  });

  it('sets error when getAll throws forbidden error', async () => {
    const service = mockDoctorService();
    service.getAll.mockRejectedValueOnce(new Error('No tiene permisos para realizar esta acción.'));

    const { result } = renderHook(() => useDoctors(service));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('No tiene permisos para realizar esta acción.');
  });

  it('sets error when getAll throws conflict error', async () => {
    const service = mockDoctorService();
    service.getAll.mockRejectedValueOnce(new Error('Conflicto con los datos existentes. Verifique la información.'));

    const { result } = renderHook(() => useDoctors(service));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Conflicto con los datos existentes. Verifique la información.');
  });

  it('sets error when getAll throws server error', async () => {
    const service = mockDoctorService();
    service.getAll.mockRejectedValueOnce(new Error('Error del servidor. Intente más tarde.'));

    const { result } = renderHook(() => useDoctors(service));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Error del servidor. Intente más tarde.');
  });

  it('passes through error message from Error instances', async () => {
    const service = mockDoctorService();
    service.getAll.mockRejectedValueOnce(new Error('Error inesperado (código 502).'));

    const { result } = renderHook(() => useDoctors(service));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Error inesperado (código 502).');
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
    service.getAll.mockResolvedValueOnce(buildPaginatedDoctors([newDoctor]));

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.doctors).toHaveLength(1);
    expect(result.current.total).toBe(1);
    expect(result.current.doctors[0]).toEqual(newDoctor);
  });

  it('clears previous error on refresh', async () => {
    const service = mockDoctorService();
    service.getAll.mockRejectedValueOnce(new Error('Error del servidor. Intente más tarde.'));

    const { result } = renderHook(() => useDoctors(service));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).not.toBeNull();

    service.getAll.mockResolvedValueOnce(buildPaginatedDoctors([]));

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.doctors).toEqual([]);
  });
});
