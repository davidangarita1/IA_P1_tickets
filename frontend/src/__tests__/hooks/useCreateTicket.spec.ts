import { renderHook, act } from "@testing-library/react";
import { useCreateTicket } from "@/hooks/useCreateTicket";
import { mockTicketWriter } from "../mocks/factories";
import type { CreateTicketDTO, CreateTicketResponse } from "@/domain/CreateTicket";

describe("useCreateTicket", () => {
  const dto: CreateTicketDTO = { name: "Carlos", documentId: "12345678" };

  it("returns initial state: not loading, no success, no error", () => {
    const writer = mockTicketWriter();
    const { result } = renderHook(() => useCreateTicket(writer));

    expect(result.current.loading).toBe(false);
    expect(result.current.success).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("sets success message on successful submission", async () => {
    const writer = mockTicketWriter({
      status: "accepted",
      message: "Turno registrado",
    });

    const { result } = renderHook(() => useCreateTicket(writer));

    await act(async () => {
      await result.current.submit(dto);
    });

    expect(result.current.success).toBe("Turno registrado");
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(writer.createTicket).toHaveBeenCalledWith(dto);
  });

  it("sets error message on TIMEOUT failure", async () => {
    const writer = mockTicketWriter();
    writer.createTicket.mockRejectedValueOnce(new Error("TIMEOUT"));

    const { result } = renderHook(() => useCreateTicket(writer));

    await act(async () => {
      await result.current.submit(dto);
    });

    expect(result.current.error).toBe(
      "El servidor tardó demasiado. Intente nuevamente."
    );
    expect(result.current.success).toBeNull();
  });

  it("sets error message on RATE_LIMIT failure", async () => {
    const writer = mockTicketWriter();
    writer.createTicket.mockRejectedValueOnce(new Error("RATE_LIMIT"));

    const { result } = renderHook(() => useCreateTicket(writer));

    await act(async () => {
      await result.current.submit(dto);
    });

    expect(result.current.error).toBe(
      "Demasiadas solicitudes. Espere unos segundos."
    );
  });

  it("sets error message on CIRCUIT_OPEN failure", async () => {
    const writer = mockTicketWriter();
    writer.createTicket.mockRejectedValueOnce(new Error("CIRCUIT_OPEN"));

    const { result } = renderHook(() => useCreateTicket(writer));

    await act(async () => {
      await result.current.submit(dto);
    });

    expect(result.current.error).toBe(
      "Servidor temporalmente no disponible. Reintentando..."
    );
  });

  it("sets error message on SERVER_ERROR failure", async () => {
    const writer = mockTicketWriter();
    writer.createTicket.mockRejectedValueOnce(new Error("SERVER_ERROR"));

    const { result } = renderHook(() => useCreateTicket(writer));

    await act(async () => {
      await result.current.submit(dto);
    });

    expect(result.current.error).toBe(
      "Error del servidor. Intente más tarde."
    );
  });

  it("sets generic error for unknown exception", async () => {
    const writer = mockTicketWriter();
    writer.createTicket.mockRejectedValueOnce(new Error("SOME_OTHER"));

    const { result } = renderHook(() => useCreateTicket(writer));

    await act(async () => {
      await result.current.submit(dto);
    });

    expect(result.current.error).toBe("No se pudo registrar el turno.");
  });

  it("prevents duplicate in-flight requests", async () => {
    let resolvePromise: (value: CreateTicketResponse | PromiseLike<CreateTicketResponse>) => void;
    const writer = mockTicketWriter();
    writer.createTicket.mockImplementation(
      () =>
        new Promise<CreateTicketResponse>((resolve) => {
          resolvePromise = resolve;
        })
    );

    const { result } = renderHook(() => useCreateTicket(writer));

    // fire two submits without awaiting
    act(() => {
      result.current.submit(dto);
      result.current.submit(dto);
    });

    // resolve the pending promise
    await act(async () => {
      resolvePromise!({ status: "accepted", message: "OK" });
    });

    // should have been called only once
    expect(writer.createTicket).toHaveBeenCalledTimes(1);
  });

  it("clears previous error on new submission", async () => {
    const writer = mockTicketWriter();
    writer.createTicket
      .mockRejectedValueOnce(new Error("TIMEOUT"))
      .mockResolvedValueOnce({ status: "accepted", message: "OK" });

    const { result } = renderHook(() => useCreateTicket(writer));

    await act(async () => {
      await result.current.submit(dto);
    });
    expect(result.current.error).not.toBeNull();

    await act(async () => {
      await result.current.submit(dto);
    });
    expect(result.current.error).toBeNull();
    expect(result.current.success).toBe("OK");
  });

  it("uses fallback success message when response.message is absent", async () => {
    const writer = mockTicketWriter();
    writer.createTicket.mockResolvedValueOnce({
      status: "accepted",
      message: undefined as unknown as string,
    });

    const { result } = renderHook(() => useCreateTicket(writer));

    await act(async () => {
      await result.current.submit(dto);
    });

    expect(result.current.success).toBe("Turno registrado correctamente");
  });

  it("produces generic error message when thrown value is not an Error instance", async () => {
    const writer = mockTicketWriter();
    writer.createTicket.mockRejectedValueOnce("plain string rejection");

    const { result } = renderHook(() => useCreateTicket(writer));

    await act(async () => {
      await result.current.submit(dto);
    });

    expect(result.current.error).toBe("No se pudo registrar el turno.");
  });

  it("does not update state after component unmounts during in-flight request", async () => {
    let resolvePromise!: (v: CreateTicketResponse) => void;
    const writer = mockTicketWriter();
    writer.createTicket.mockReturnValueOnce(
      new Promise<CreateTicketResponse>((resolve) => {
        resolvePromise = resolve;
      })
    );

    const { result, unmount } = renderHook(() => useCreateTicket(writer));

    act(() => {
      result.current.submit(dto);
    });

    unmount();

    await act(async () => {
      resolvePromise({ status: "accepted", message: "OK" });
    });

    expect(result.current.success).toBeNull();
  });
});
