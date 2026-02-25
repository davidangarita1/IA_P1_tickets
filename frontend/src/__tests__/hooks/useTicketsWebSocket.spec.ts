import { renderHook, act } from "@testing-library/react";
import { useTicketsWebSocket } from "@/hooks/useTicketsWebSocket";
import { mockRealTimeProvider, buildTicket } from "../mocks/factories";

describe("useTicketsWebSocket", () => {
  it("connects on mount and disconnects on unmount", () => {
    const provider = mockRealTimeProvider();

    const { unmount } = renderHook(() => useTicketsWebSocket(provider));

    expect(provider.connect).toHaveBeenCalledTimes(1);
    expect(provider.connect).toHaveBeenCalledWith(
      expect.objectContaining({
        onSnapshot: expect.any(Function),
        onTicketUpdate: expect.any(Function),
        onConnect: expect.any(Function),
        onDisconnect: expect.any(Function),
        onError: expect.any(Function),
      })
    );

    unmount();
    expect(provider.disconnect).toHaveBeenCalledTimes(1);
  });

  it("returns initial state: empty tickets, no error, not connected", () => {
    const provider = mockRealTimeProvider();

    const { result } = renderHook(() => useTicketsWebSocket(provider));

    expect(result.current.tickets).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.connected).toBe(false);
  });

  it("sets connected to true on onConnect callback", () => {
    const provider = mockRealTimeProvider();
    const { result } = renderHook(() => useTicketsWebSocket(provider));

    act(() => {
      provider._simulateConnect();
    });

    expect(result.current.connected).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("sets connected to false on onDisconnect callback", () => {
    const provider = mockRealTimeProvider();
    const { result } = renderHook(() => useTicketsWebSocket(provider));

    act(() => {
      provider._simulateConnect();
    });
    expect(result.current.connected).toBe(true);

    act(() => {
      provider._simulateDisconnect();
    });
    expect(result.current.connected).toBe(false);
  });

  it("populates tickets array from onSnapshot", () => {
    const provider = mockRealTimeProvider();
    const tickets = [
      buildTicket({ status: "waiting" }),
      buildTicket({ status: "called", office: "A1" }),
    ];

    const { result } = renderHook(() => useTicketsWebSocket(provider));

    act(() => {
      provider._simulateSnapshot(tickets);
    });

    expect(result.current.tickets).toHaveLength(2);
    expect(result.current.tickets[0].status).toBe("waiting");
    expect(result.current.tickets[1].status).toBe("called");
  });

  it("updates existing ticket via onTicketUpdate", () => {
    const provider = mockRealTimeProvider();
    const ticket = buildTicket({ id: "t-1", status: "waiting" });

    const { result } = renderHook(() => useTicketsWebSocket(provider));

    act(() => {
      provider._simulateSnapshot([ticket]);
    });
    expect(result.current.tickets[0].status).toBe("waiting");

    act(() => {
      provider._simulateUpdate({ ...ticket, status: "called", office: "B2" });
    });

    expect(result.current.tickets).toHaveLength(1);
    expect(result.current.tickets[0].status).toBe("called");
    expect(result.current.tickets[0].office).toBe("B2");
  });

  it("appends new ticket if onTicketUpdate has unknown id", () => {
    const provider = mockRealTimeProvider();
    const existing = buildTicket({ id: "t-1" });
    const newTicket = buildTicket({ id: "t-new", status: "called" });

    const { result } = renderHook(() => useTicketsWebSocket(provider));

    act(() => {
      provider._simulateSnapshot([existing]);
    });
    expect(result.current.tickets).toHaveLength(1);

    act(() => {
      provider._simulateUpdate(newTicket);
    });
    expect(result.current.tickets).toHaveLength(2);
  });

  it("sets error and disconnects on onError", () => {
    const provider = mockRealTimeProvider();
    const { result } = renderHook(() => useTicketsWebSocket(provider));

    act(() => {
      provider._simulateConnect();
    });
    expect(result.current.connected).toBe(true);

    act(() => {
      provider._simulateError("Connection lost");
    });

    expect(result.current.error).toBe("Connection lost");
    expect(result.current.connected).toBe(false);
  });

  it("clears error on new snapshot after error", () => {
    const provider = mockRealTimeProvider();
    const { result } = renderHook(() => useTicketsWebSocket(provider));

    act(() => {
      provider._simulateError("Error");
    });
    expect(result.current.error).toBe("Error");

    act(() => {
      provider._simulateSnapshot([buildTicket()]);
    });
    expect(result.current.error).toBeNull();
  });
});
