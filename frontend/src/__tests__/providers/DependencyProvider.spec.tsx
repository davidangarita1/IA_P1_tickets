import React from 'react';
import { renderHook } from '@testing-library/react';
import { DependencyProvider, useDeps } from '@/providers/DependencyProvider';
import {
  mockTicketWriter,
  mockTicketReader,
  mockRealTimeProvider,
  mockAudioNotifier,
  mockSanitizer,
} from '@/__tests__/mocks/factories';

function makeOverrides() {
  return {
    ticketWriter: mockTicketWriter(),
    ticketReader: mockTicketReader(),
    realTime: mockRealTimeProvider(),
    audio: mockAudioNotifier(),
    sanitizer: mockSanitizer(),
  };
}

function wrapper(overrides: ReturnType<typeof makeOverrides>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <DependencyProvider overrides={overrides}>{children}</DependencyProvider>;
  };
}

describe('DependencyProvider', () => {
  it('throws when useDeps is called outside the provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useDeps())).toThrow('DependencyProvider is required');

    consoleError.mockRestore();
  });

  it('provides all overridden dependencies via context', () => {
    const overrides = makeOverrides();

    const { result } = renderHook(() => useDeps(), {
      wrapper: wrapper(overrides),
    });

    expect(result.current.ticketWriter).toBe(overrides.ticketWriter);
    expect(result.current.ticketReader).toBe(overrides.ticketReader);
    expect(result.current.realTime).toBe(overrides.realTime);
    expect(result.current.audio).toBe(overrides.audio);
    expect(result.current.sanitizer).toBe(overrides.sanitizer);
  });

  it('exposes all required dependency keys', () => {
    const overrides = makeOverrides();

    const { result } = renderHook(() => useDeps(), {
      wrapper: wrapper(overrides),
    });

    expect(result.current).toHaveProperty('ticketWriter');
    expect(result.current).toHaveProperty('ticketReader');
    expect(result.current).toHaveProperty('realTime');
    expect(result.current).toHaveProperty('audio');
    expect(result.current).toHaveProperty('sanitizer');
  });

  it('partial overrides merge with defaults without crashing', () => {
    const partialOverride = { sanitizer: mockSanitizer() };

    const partialWrapper = ({ children }: { children: React.ReactNode }) => (
      <DependencyProvider overrides={partialOverride}>{children}</DependencyProvider>
    );

    expect(() => renderHook(() => useDeps(), { wrapper: partialWrapper })).not.toThrow();
  });
});
