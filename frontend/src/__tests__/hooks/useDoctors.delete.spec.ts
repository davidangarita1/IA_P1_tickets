import { renderHook, waitFor, act } from '@testing-library/react';
import { useDoctors } from '@/hooks/useDoctors';
import { mockDoctorService, buildDoctor } from '../mocks/factories';

describe('useDoctors - remove', () => {
  it('remove delegates to doctorService.remove', async () => {
    const doctor = buildDoctor();
    const service = mockDoctorService([doctor]);
    service.remove.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDoctors(service));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.remove('doc-1');
    });

    expect(service.remove).toHaveBeenCalledWith('doc-1');
  });
});
