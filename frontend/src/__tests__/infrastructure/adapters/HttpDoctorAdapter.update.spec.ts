jest.mock("@/infrastructure/cookies/cookieUtils");

import { HttpDoctorAdapter } from "@/infrastructure/adapters/HttpDoctorAdapter";
import { getAuthCookie } from "@/infrastructure/cookies/cookieUtils";
import { buildDoctor } from "@/__tests__/mocks/factories";
import type { UpdateDoctorData } from "@/domain/Doctor";

const mockedGetAuthCookie = getAuthCookie as jest.MockedFunction<
  typeof getAuthCookie
>;
const mockFetch = jest.fn() as jest.MockedFunction<typeof global.fetch>;
global.fetch = mockFetch;

function mockResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response;
}

describe("HttpDoctorAdapter - update()", () => {
  const BASE = "http://localhost:3000";
  let adapter: HttpDoctorAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new HttpDoctorAdapter(BASE);
    mockedGetAuthCookie.mockReturnValue("test-token");
  });

  it("sends PUT request with auth header and returns updated doctor", async () => {
    const updated = buildDoctor({ name: "Pedro López" });
    mockFetch.mockResolvedValueOnce(mockResponse(200, updated));
    const data: UpdateDoctorData = { name: "Pedro López" };

    const result = await adapter.update("doc-1", data);

    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE}/api/v1/doctors/doc-1`,
      expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(data),
      })
    );
    expect(result).toEqual(updated);
  });

  it("throws backend message on 409 conflict", async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse(409, { message: "La franja horaria del consultorio ya está ocupada" })
    );

    await expect(adapter.update("doc-1", { office: "2", shift: "06:00-14:00" })).rejects.toThrow(
      "La franja horaria del consultorio ya está ocupada"
    );
  });

  it("throws CONFLICT when 409 body has no message", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(409, {}));

    await expect(adapter.update("doc-1", { name: "Test" })).rejects.toThrow("CONFLICT");
  });

  it("throws HTTP_ERROR_404 when doctor not found", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(404, {}));

    await expect(adapter.update("non-existent", { name: "Test" })).rejects.toThrow("HTTP_ERROR_404");
  });

  it("throws HTTP_ERROR_500 on server error", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(500, {}));

    await expect(adapter.update("doc-1", { name: "Test" })).rejects.toThrow("HTTP_ERROR_500");
  });
});
