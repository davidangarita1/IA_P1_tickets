import { renderHook, act, waitFor } from "@testing-library/react";
import { useAvailableShifts } from "@/hooks/useAvailableShifts";
import { mockDoctorService } from "../mocks/factories";

describe("useAvailableShifts", () => {
  it("starts with empty shifts and loading false", () => {
    const service = mockDoctorService();

    const { result } = renderHook(() => useAvailableShifts(service));

    expect(result.current.shifts).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("sets loading to false after fetchShifts resolves", async () => {
    const service = mockDoctorService();
    service.getAvailableShifts.mockResolvedValueOnce({
      office: "1",
      availableShifts: [],
      occupiedShifts: [],
    });

    const { result } = renderHook(() => useAvailableShifts(service));

    await act(async () => {
      await result.current.fetchShifts("1");
    });

    expect(result.current.loading).toBe(false);
  });

  it("populates shifts after fetchShifts succeeds", async () => {
    const service = mockDoctorService();
    service.getAvailableShifts.mockResolvedValueOnce({
      office: "1",
      availableShifts: ["06:00-14:00", "14:00-22:00"],
      occupiedShifts: [],
    });

    const { result } = renderHook(() => useAvailableShifts(service));

    await act(async () => {
      await result.current.fetchShifts("1");
    });

    expect(result.current.shifts).toEqual(["06:00-14:00", "14:00-22:00"]);
    expect(result.current.loading).toBe(false);
    expect(service.getAvailableShifts).toHaveBeenCalledWith("1", undefined);
  });

  it("passes excludeDoctorId to the service", async () => {
    const service = mockDoctorService();
    service.getAvailableShifts.mockResolvedValueOnce({
      office: "2",
      availableShifts: ["06:00-14:00"],
      occupiedShifts: ["14:00-22:00"],
    });

    const { result } = renderHook(() => useAvailableShifts(service));

    await act(async () => {
      await result.current.fetchShifts("2", "doc-123");
    });

    expect(service.getAvailableShifts).toHaveBeenCalledWith("2", "doc-123");
  });

  it("resets shifts to empty array when fetchShifts fails for a new office", async () => {
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
    expect(result.current.shifts).toHaveLength(1);

    service.getAvailableShifts.mockRejectedValueOnce(new Error("API Error"));

    await act(async () => {
      await result.current.fetchShifts("2");
    });

    expect(result.current.shifts).toEqual([]);
    expect(result.current.loading).toBe(false);
  });
});
