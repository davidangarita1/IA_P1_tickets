import { renderHook, act } from "@testing-library/react";
import { useToast } from "@/hooks/useToast";

describe("useToast", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("starts with not visible, null message, and success type", () => {
    const { result } = renderHook(() => useToast());

    expect(result.current.visible).toBe(false);
    expect(result.current.message).toBeNull();
    expect(result.current.type).toBe("success");
  });

  it("show makes the toast visible with the correct message and type", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.show("Operation successful", "success");
    });

    expect(result.current.visible).toBe(true);
    expect(result.current.message).toBe("Operation successful");
    expect(result.current.type).toBe("success");
  });

  it("show with error type sets type to error", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.show("Something went wrong", "error");
    });

    expect(result.current.type).toBe("error");
  });

  it("hide makes the toast invisible", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.show("A message", "success");
    });
    expect(result.current.visible).toBe(true);

    act(() => {
      result.current.hide();
    });

    expect(result.current.visible).toBe(false);
  });

  it("auto-hides after the specified duration", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.show("Timed message", "success", 2000);
    });
    expect(result.current.visible).toBe(true);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(result.current.visible).toBe(false);
  });

  it("auto-hides after default 3000ms when no duration given", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.show("Default duration", "success");
    });

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(result.current.visible).toBe(false);
  });

  it("does not hide before the duration elapses", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.show("Persistent message", "success", 5000);
    });

    act(() => {
      jest.advanceTimersByTime(4999);
    });

    expect(result.current.visible).toBe(true);

    act(() => {
      jest.advanceTimersByTime(1);
    });

    expect(result.current.visible).toBe(false);
  });

  it("cancels the previous timer when show is called again", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.show("First", "success", 5000);
    });

    act(() => {
      result.current.show("Second", "error", 1000);
    });

    act(() => {
      jest.advanceTimersByTime(4999);
    });

    expect(result.current.visible).toBe(false);
    expect(result.current.message).toBe("Second");
    expect(result.current.type).toBe("error");
  });

  it("cleans up the timer on unmount without throwing", () => {
    const { result, unmount } = renderHook(() => useToast());

    act(() => {
      result.current.show("Will be unmounted", "success", 10000);
    });

    expect(() => unmount()).not.toThrow();
  });
});
