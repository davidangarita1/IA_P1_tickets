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

const DependencyContext = React.createContext<Dependencies | null>(null);

jest.mock("@/providers/DependencyProvider", () => ({
  useDeps: () => {
    const deps = React.useContext(DependencyContext);
    if (!deps) throw new Error("DependencyProvider is required");
    return deps;
  },
}));

import TicketsScreen from "@/app/page";

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
      <TicketsScreen />
    </DependencyContext.Provider>
  );

  return { ...result, realTime: realTime as ReturnType<typeof mockRealTimeProvider> };
}

describe("TicketsScreen — integration", () => {
  it("renders title and disconnected indicator initially", () => {
    renderWithDeps();

    expect(
      screen.getByText("Turnos habilitados")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Desconectado/)
    ).toBeInTheDocument();
  });

  it("shows connected status when RealTimeProvider connects", () => {
    const { realTime } = renderWithDeps();

    act(() => {
      realTime._simulateConnect();
    });

    expect(
      screen.getByText(/Conectado en tiempo real/)
    ).toBeInTheDocument();
  });

  it("displays 'called' tickets under Llamados section", () => {
    const { realTime } = renderWithDeps();

    const calledTicket = buildTicket({
      name: "Carlos Pérez",
      status: "called",
      office: "A1",
    });

    act(() => {
      realTime._simulateSnapshot([calledTicket]);
    });

    expect(screen.getByText("Carlos Pérez")).toBeInTheDocument();
    expect(screen.getByText("Consultorio A1")).toBeInTheDocument();
  });

  it("displays 'waiting' tickets under En espera section", () => {
    const { realTime } = renderWithDeps();

    const waitingTicket = buildTicket({
      name: "Ana López",
      status: "waiting",
    });

    act(() => {
      realTime._simulateSnapshot([waitingTicket]);
    });

    expect(screen.getByText("Ana López")).toBeInTheDocument();
    expect(screen.getByText("Sin consultorio")).toBeInTheDocument();
  });

  it("shows empty message when no tickets exist", () => {
    renderWithDeps();

    expect(
      screen.getByText("No hay turnos registrados")
    ).toBeInTheDocument();
  });

  it("shows error message on connection error", () => {
    const { realTime } = renderWithDeps();

    act(() => {
      realTime._simulateError("Connection failed");
    });

    expect(screen.getByText("Connection failed")).toBeInTheDocument();
  });

  it("filters out 'served' tickets from display", () => {
    const { realTime } = renderWithDeps();

    act(() => {
      realTime._simulateSnapshot([
        buildTicket({ name: "Visible", status: "called", office: "C1" }),
        buildTicket({ name: "Hidden", status: "served", office: "C2" }),
      ]);
    });

    expect(screen.getByText("Visible")).toBeInTheDocument();
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });

  it("disconnects RealTimeProvider on unmount", () => {
    const { realTime, unmount } = renderWithDeps();

    unmount();

    expect(realTime.disconnect).toHaveBeenCalled();
  });
});
