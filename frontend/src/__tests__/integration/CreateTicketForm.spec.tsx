import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Dependencies } from "@/providers/DependencyProvider";
import {
  mockTicketWriter,
  mockTicketReader,
  mockRealTimeProvider,
  mockAudioNotifier,
  mockSanitizer,
} from "../mocks/factories";

const DependencyContext = React.createContext<Dependencies | null>(null);

jest.mock("@/providers/DependencyProvider", () => {
  const actual = jest.requireActual("@/providers/DependencyProvider");
  return {
    ...actual,
    useDeps: () => {
      const deps = React.useContext(DependencyContext);
      if (!deps) throw new Error("DependencyProvider is required");
      return deps;
    },
  };
});

import CreateTicketForm from "@/components/CreateTicketForm/CreateTicketForm";

function renderWithDeps(overrides: Partial<Dependencies> = {}) {
  const deps: Dependencies = {
    ticketWriter: overrides.ticketWriter ?? mockTicketWriter(),
    ticketReader: overrides.ticketReader ?? mockTicketReader(),
    realTime: overrides.realTime ?? mockRealTimeProvider(),
    audio: overrides.audio ?? mockAudioNotifier(),
    sanitizer: overrides.sanitizer ?? mockSanitizer(),
  };

  return render(
    <DependencyContext.Provider value={deps}>
      <CreateTicketForm />
    </DependencyContext.Provider>
  );
}

describe("CreateTicketForm — integration", () => {
  it("renders the form with inputs and button", () => {
    renderWithDeps();

    expect(screen.getByPlaceholderText("Nombre completo")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Cédula")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Registrar turno/i })
    ).toBeInTheDocument();
  });

  it("submits form with sanitized data and shows success", async () => {
    const writer = mockTicketWriter({
      status: "accepted",
      message: "Turno registrado correctamente",
    });
    const sanitizer = mockSanitizer();

    renderWithDeps({ ticketWriter: writer, sanitizer });

    const nameInput = screen.getByPlaceholderText("Nombre completo");
    const docInput = screen.getByPlaceholderText("Cédula");
    const button = screen.getByRole("button", { name: /Registrar turno/i });

    await userEvent.type(nameInput, "Carlos Pérez");
    await userEvent.type(docInput, "12345678");
    fireEvent.click(button);

    await waitFor(() => {
      expect(writer.createTicket).toHaveBeenCalledWith({
        name: "Carlos Pérez",
        documentId: 12345678,
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Turno registrado correctamente")).toBeInTheDocument();
    });
  });

  it("sanitizes inputs before submission", async () => {
    const writer = mockTicketWriter();
    const sanitizer = mockSanitizer();
    sanitizer.sanitize.mockImplementation((input: string) =>
      input.replace(/[<>]/g, "").trim()
    );

    renderWithDeps({ ticketWriter: writer, sanitizer });

    await userEvent.type(
      screen.getByPlaceholderText("Nombre completo"),
      "<script>alert</script>"
    );
    await userEvent.type(screen.getByPlaceholderText("Cédula"), "999");
    fireEvent.click(
      screen.getByRole("button", { name: /Registrar turno/i })
    );

    await waitFor(() => {
      expect(sanitizer.sanitize).toHaveBeenCalled();
    });
  });

  it("does not submit if name is empty after sanitization", async () => {
    const writer = mockTicketWriter();
    const sanitizer = mockSanitizer();
    sanitizer.sanitize.mockReturnValue("");

    renderWithDeps({ ticketWriter: writer, sanitizer });

    await userEvent.type(
      screen.getByPlaceholderText("Nombre completo"),
      "   "
    );
    await userEvent.type(screen.getByPlaceholderText("Cédula"), "123");
    fireEvent.click(
      screen.getByRole("button", { name: /Registrar turno/i })
    );

    // wait a tick to ensure no async calls
    await new Promise((r) => setTimeout(r, 50));
    expect(writer.createTicket).not.toHaveBeenCalled();
  });

  it("does not submit if documentId is NaN after sanitization", async () => {
    const writer = mockTicketWriter();
    const sanitizer = mockSanitizer();
    sanitizer.sanitize.mockImplementation((input: string) => input.trim());

    renderWithDeps({ ticketWriter: writer, sanitizer });

    await userEvent.type(
      screen.getByPlaceholderText("Nombre completo"),
      "Carlos"
    );
    await userEvent.type(screen.getByPlaceholderText("Cédula"), "abc");
    fireEvent.click(
      screen.getByRole("button", { name: /Registrar turno/i })
    );

    await new Promise((r) => setTimeout(r, 50));
    expect(writer.createTicket).not.toHaveBeenCalled();
  });

  it("shows error message on submission failure", async () => {
    const writer = mockTicketWriter();
    writer.createTicket.mockRejectedValueOnce(new Error("TIMEOUT"));

    renderWithDeps({ ticketWriter: writer });

    await userEvent.type(
      screen.getByPlaceholderText("Nombre completo"),
      "Ana"
    );
    await userEvent.type(screen.getByPlaceholderText("Cédula"), "456");
    fireEvent.click(
      screen.getByRole("button", { name: /Registrar turno/i })
    );

    await waitFor(() => {
      expect(
        screen.getByText("El servidor tardó demasiado. Intente nuevamente.")
      ).toBeInTheDocument();
    });
  });

  it("disables button while loading", async () => {
    const writer = mockTicketWriter();
    type CreateTicketResolve = (
      value:
        | Awaited<ReturnType<typeof writer.createTicket>>
        | PromiseLike<Awaited<ReturnType<typeof writer.createTicket>>>
    ) => void;
    let resolveCreate: CreateTicketResolve;
    writer.createTicket.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCreate = resolve;
        })
    );

    renderWithDeps({ ticketWriter: writer });

    await userEvent.type(
      screen.getByPlaceholderText("Nombre completo"),
      "Test"
    );
    await userEvent.type(screen.getByPlaceholderText("Cédula"), "123");
    fireEvent.click(
      screen.getByRole("button", { name: /Registrar turno/i })
    );

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeDisabled();
      expect(screen.getByRole("button")).toHaveTextContent("Enviando...");
    });

    // resolve the promise to finish
    resolveCreate!({ status: "accepted", message: "OK" });

    await waitFor(() => {
      expect(screen.getByRole("button")).not.toBeDisabled();
    });
  });
});
