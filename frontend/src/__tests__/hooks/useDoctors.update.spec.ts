import { renderHook, waitFor } from '@testing-library/react';
import { useDoctors } from '@/hooks/useDoctors';
import { mockDoctorService, buildDoctor } from '../mocks/factories';

describe('useDoctors - update', () => {
  it('update delegates to doctorService.update and returns the doctor', async () => {
    const doctor = buildDoctor();
    const updated = buildDoctor({ name: 'Pedro López' });
    const service = mockDoctorService([doctor]);
    service.update.mockResolvedValueOnce(updated);

    const { result } = renderHook(() => useDoctors(service));
    await waitFor(() => expect(result.current.loading).toBe(false));

    const data = { name: 'Pedro López' };
    const returned = await result.current.update('doc-1', data);

    expect(service.update).toHaveBeenCalledWith('doc-1', data);
    expect(returned).toEqual(updated);
  });
});
