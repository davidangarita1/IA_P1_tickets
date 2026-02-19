import React from "react";
import { render, screen, act } from "@testing-library/react";
import type { Dependencies } from "@/providers/DependencyProvider";
import {
  mockTicketWriter,
  mockTicketReader,
  mockRealTimeProvider,
  mockAudioNotifier,
  mockSanitizer,
  buildTicket,
} from "../mocks/factories";

/* ── Stub provider ────────────────────────────────────── */

const DependencyContext = React.createContext<Dependencies | null>(null);

jest.mock("@/providers/DependencyProvider", () => ({
  useDeps: () => {
    const deps = React.useContext(DependencyContext);
    if (!deps) throw new Error("DependencyProvider is required");
    return deps;
  },
}));

import ServedDashboard from "@/app/dashboard/page";

function renderWithDeps(overrides: Partial<Dependencies> = {}) {
  const realTime = overrides.realTime ?? mockRealTimeProvider();
  const deps: Dependencies = {
    ticketWriter: overrides.ticketWriter ?? mockTicketWriter(),
    ticketReader: overrides.ticketReader ?? mockTicketReader(),
    realTime,
    audio: overrides.audio ?? mockAudioNotifier(),
    sanitizer: overrides.sanitizer ?? mockSanitizer(),
  };

  const result = render(
    <DependencyContext.Provider value={deps}>
      <ServedDashboard />
    </DependencyContext.Provider>
  );

  return { ...result, realTime: realTime as ReturnType<typeof mockRealTimeProvider> };
}

describe("ServedDashboard — integration", () => {
  it("renders title and connection status", () => {
    renderWithDeps();

    expect(
      screen.getByText(/Historial de.*Atendidos/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Desconectado/)
    ).toBeInTheDocument();
  });

  it("shows connected status after connection", () => {
    const { realTime } = renderWithDeps();

    act(() => {
      realTime._simulateConnect();
    });

    expect(
      screen.getByText(/Conectado en tiempo real/)
    ).toBeInTheDocument();
  });

  it("displays only served tickets", () => {
    const { realTime } = renderWithDeps();

    act(() => {
      realTime._simulateSnapshot([
        buildTicket({ name: "Served Patient", status: "served", office: "B1", timestamp: 1700000000000 }),
        buildTicket({ name: "Waiting Patient", status: "waiting" }),
        buildTicket({ name: "Called Patient", status: "called", office: "A1" }),
      ]);
    });

    expect(screen.getByText("Served Patient")).toBeInTheDocument();
    expect(screen.queryByText("Waiting Patient")).not.toBeInTheDocument();
    expect(screen.queryByText("Called Patient")).not.toBeInTheDocument();
  });

  it("shows empty message when no served tickets", () => {
    const { realTime } = renderWithDeps();

    act(() => {
      realTime._simulateSnapshot([
        buildTicket({ status: "waiting" }),
      ]);
    });

    expect(
      screen.getByText("No hay turnos atendidos")
    ).toBeInTheDocument();
  });

  it("shows count of served tickets in section title", () => {
    const { realTime } = renderWithDeps();

    act(() => {
      realTime._simulateSnapshot([
        buildTicket({ status: "served", office: "A1", timestamp: 1 }),
        buildTicket({ status: "served", office: "B2", timestamp: 2 }),
      ]);
    });

    expect(screen.getByText(/Atendidos \(2\)/)).toBeInTheDocument();
  });

  it("sorts served tickets by timestamp descending (most recent first)", () => {
    const { realTime } = renderWithDeps();

    act(() => {
      realTime._simulateSnapshot([
        buildTicket({ name: "First", status: "served", office: "A", timestamp: 1000 }),
        buildTicket({ name: "Last", status: "served", office: "B", timestamp: 3000 }),
        buildTicket({ name: "Middle", status: "served", office: "C", timestamp: 2000 }),
      ]);
    });

    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Last");
    expect(items[1]).toHaveTextContent("Middle");
    expect(items[2]).toHaveTextContent("First");
  });

  it("shows error message on connection error", () => {
    const { realTime } = renderWithDeps();

    act(() => {
      realTime._simulateError("WebSocket failed");
    });

    expect(screen.getByText("WebSocket failed")).toBeInTheDocument();
  });
});
