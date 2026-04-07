import { renderHook, act } from "@testing-library/react";
import { useAvailableShifts } from "@/hooks/useAvailableShifts";
import { mockDoctorService } from "../mocks/factories";

describe("useAvailableShifts - cache", () => {
  it("returns cached result without calling service on second fetch with same args", async () => {
    const service = mockDoctorService();
    service.getAvailableShifts.mockResolvedValue({
      office: "1",
      availableShifts: ["06:00-14:00"],
      occupiedShifts: ["14:00-22:00"],
    });

    const { result } = renderHook(() => useAvailableShifts(service));

    await act(async () => {
      await result.current.fetchShifts("1");
    });
    await act(async () => {
      await result.current.fetchShifts("1");
    });

    expect(service.getAvailableShifts).toHaveBeenCalledTimes(1);
    expect(result.current.shifts).toEqual(["06:00-14:00"]);
  });

  it("calls service again when office changes", async () => {
    const service = mockDoctorService();
    service.getAvailableShifts
      .mockResolvedValueOnce({
        office: "1",
        availableShifts: ["06:00-14:00"],
        occupiedShifts: [],
      })
      .mockResolvedValueOnce({
        office: "2",
        availableShifts: ["14:00-22:00"],
        occupiedShifts: [],
      });

    const { result } = renderHook(() => useAvailableShifts(service));

    await act(async () => {
      await result.current.fetchShifts("1");
    });
    await act(async () => {
      await result.current.fetchShifts("2");
    });

    expect(service.getAvailableShifts).toHaveBeenCalledTimes(2);
    expect(result.current.shifts).toEqual(["14:00-22:00"]);
  });

  it("keeps loading false when result comes from cache", async () => {
    const service = mockDoctorService();
    service.getAvailableShifts.mockResolvedValueOnce({
      office: "1",
      availableShifts: ["06:00-14:00"],
      occupiedShifts: [],
    });

    const { result } = renderHook(() => useAvailableShifts(service));

    await act(async () => {
      await result.current.fetchShifts("1");
    });
    await act(async () => {
      await result.current.fetchShifts("1");
    });

    expect(result.current.loading).toBe(false);
  });

  it("differentiates cache keys by excludeDoctorId", async () => {
    const service = mockDoctorService();
    service.getAvailableShifts
      .mockResolvedValueOnce({
        office: "1",
        availableShifts: ["06:00-14:00", "14:00-22:00"],
        occupiedShifts: [],
      })
      .mockResolvedValueOnce({
        office: "1",
        availableShifts: ["06:00-14:00"],
        occupiedShifts: ["14:00-22:00"],
      });

    const { result } = renderHook(() => useAvailableShifts(service));

    await act(async () => {
      await result.current.fetchShifts("1");
    });
    await act(async () => {
      await result.current.fetchShifts("1", "doc-99");
    });

    expect(service.getAvailableShifts).toHaveBeenCalledTimes(2);
  });
});
