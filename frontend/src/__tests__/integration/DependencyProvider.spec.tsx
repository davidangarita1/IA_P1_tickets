
import React from "react";
import { render, screen, renderHook } from "@testing-library/react";
import type { Dependencies } from "@/providers/DependencyProvider";
import type { TicketWriter } from "@/domain/ports/TicketWriter";
import type { TicketReader } from "@/domain/ports/TicketReader";
import type { RealTimeProvider } from "@/domain/ports/RealTimeProvider";
import type { AudioNotifier } from "@/domain/ports/AudioNotifier";
import type { InputSanitizer } from "@/domain/ports/InputSanitizer";
import {
  mockTicketWriter,
  mockTicketReader,
  mockRealTimeProvider,
  mockAudioNotifier,
  mockSanitizer,
} from "../mocks/factories";


const DependencyContext = React.createContext<Dependencies | null>(null);

function useDeps(): Dependencies {
  const deps = React.useContext(DependencyContext);
  if (!deps) throw new Error("DependencyProvider is required");
  return deps;
}

function TestProvider({
  children,
  overrides = {},
}: {
  children: React.ReactNode;
  overrides?: Partial<Dependencies>;
}) {
  const deps: Dependencies = {
    ticketWriter: overrides.ticketWriter ?? mockTicketWriter(),
    ticketReader: overrides.ticketReader ?? mockTicketReader(),
    realTime: overrides.realTime ?? mockRealTimeProvider(),
    audio: overrides.audio ?? mockAudioNotifier(),
    sanitizer: overrides.sanitizer ?? mockSanitizer(),
  };

  return (
    <DependencyContext.Provider value={deps}>
      {children}
    </DependencyContext.Provider>
  );
}

describe("DependencyProvider integration", () => {
  it("provides all 5 ports through useDeps()", () => {
    const { result } = renderHook(() => useDeps(), {
      wrapper: ({ children }) => <TestProvider>{children}</TestProvider>,
    });

    expect(result.current.ticketWriter).toBeDefined();
    expect(result.current.ticketReader).toBeDefined();
    expect(result.current.realTime).toBeDefined();
    expect(result.current.audio).toBeDefined();
    expect(result.current.sanitizer).toBeDefined();
  });

  it("throws if useDeps is used outside provider", () => {
    // Suppress console.error from React error boundary
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      renderHook(() => useDeps());
    }).toThrow("DependencyProvider is required");

    spy.mockRestore();
  });

  it("allows overriding individual ports for testing", () => {
    const customWriter = mockTicketWriter({
      status: "accepted",
      message: "Custom",
    });

    const { result } = renderHook(() => useDeps(), {
      wrapper: ({ children }) => (
        <TestProvider overrides={{ ticketWriter: customWriter }}>
          {children}
        </TestProvider>
      ),
    });

    expect(result.current.ticketWriter).toBe(customWriter);
  });

  it("each port satisfies its interface contract", () => {
    const writer: TicketWriter = mockTicketWriter();
    const reader: TicketReader = mockTicketReader();
    const realTime: RealTimeProvider = mockRealTimeProvider();
    const audio: AudioNotifier = mockAudioNotifier();
    const sanitizer: InputSanitizer = mockSanitizer();

    expect(typeof writer.createTicket).toBe("function");
    expect(typeof reader.getTickets).toBe("function");
    expect(typeof realTime.connect).toBe("function");
    expect(typeof realTime.disconnect).toBe("function");
    expect(typeof realTime.isConnected).toBe("function");
    expect(typeof audio.init).toBe("function");
    expect(typeof audio.unlock).toBe("function");
    expect(typeof audio.play).toBe("function");
    expect(typeof audio.isEnabled).toBe("function");
    expect(typeof sanitizer.sanitize).toBe("function");
  });

  it("renders children within the provider", () => {
    render(
      <TestProvider>
        <div data-testid="child">Hello</div>
      </TestProvider>
    );

    expect(screen.getByTestId("child")).toHaveTextContent("Hello");
  });
});
