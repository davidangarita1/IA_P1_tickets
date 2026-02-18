const mockCanRequest = jest.fn().mockReturnValue(true);
const mockSuccess = jest.fn();
const mockFail = jest.fn();

jest.mock("@/infrastructure/http/CircuitBreaker", () => ({
  CircuitBreaker: jest.fn().mockImplementation(() => ({
    canRequest: mockCanRequest,
    success: mockSuccess,
    fail: mockFail,
    getState: jest.fn().mockReturnValue("CLOSED"),
  })),
}));

import { httpGet, httpPost } from "@/infrastructure/http/httpClient";

describe("httpClient", () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockCanRequest.mockReturnValue(true);
    global.fetch = mockFetch;
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe("httpGet", () => {
    it("returns parsed JSON on success", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [1, 2, 3] }),
      });

      const result = await httpGet<{ data: number[] }>("http://localhost:3000/turnos");

      expect(result).toEqual({ data: [1, 2, 3] });
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/turnos",
        expect.objectContaining({ method: "GET" })
      );
      expect(mockSuccess).toHaveBeenCalled();
    });

    it("throws CIRCUIT_OPEN when circuit breaker is open", async () => {
      mockCanRequest.mockReturnValue(false);

      await expect(
        httpGet("http://localhost:3000/test")
      ).rejects.toThrow("CIRCUIT_OPEN");

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("throws RATE_LIMIT on 429 status without retry", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
      });

      await expect(
        httpGet("http://localhost:3000/test")
      ).rejects.toThrow("RATE_LIMIT");
    });

    it("throws SERVER_ERROR on 500+ status after retries", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(
        httpGet("http://localhost:3000/test")
      ).rejects.toThrow("SERVER_ERROR");

      expect(mockFail).toHaveBeenCalled();
    });

    it("throws HTTP_ERROR on 4xx status", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(
        httpGet("http://localhost:3000/test")
      ).rejects.toThrow("HTTP_ERROR");
    });
  });

  describe("httpPost", () => {
    it("sends JSON body and returns parsed response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ status: "accepted", message: "Created" }),
      });

      const result = await httpPost("http://localhost:3000/turnos", {
        nombre: "Carlos",
        cedula: 123,
      });

      expect(result).toEqual({ status: "accepted", message: "Created" });

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe("POST");
      expect(options.headers["Content-Type"]).toBe("application/json");
      expect(JSON.parse(options.body)).toEqual({
        nombre: "Carlos",
        cedula: 123,
      });
    });
  });

  describe("retries", () => {
    it("retries on failure and succeeds on second attempt", async () => {
      mockFetch
        .mockRejectedValueOnce(new Error("network failure"))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ ok: true }),
        });

      const result = await httpGet("http://localhost:3000/test");

      expect(result).toEqual({ ok: true });
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockSuccess).toHaveBeenCalled();
    });
  });
});
