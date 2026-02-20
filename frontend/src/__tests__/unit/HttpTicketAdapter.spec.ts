jest.mock("@/infrastructure/http/httpClient", () => ({
  httpGet: jest.fn(),
  httpPost: jest.fn(),
}));

jest.mock("@/infrastructure/mappers/ticketMapper", () => ({
  toDomainTicket: jest.fn((raw: unknown) => raw),
  toBackendCreateDTO: jest.fn((dto: unknown) => dto),
}));

import { HttpTicketAdapter } from "@/infrastructure/adapters/HttpTicketAdapter";
import { httpGet, httpPost } from "@/infrastructure/http/httpClient";
import {
  toDomainTicket,
  toBackendCreateDTO,
} from "@/infrastructure/mappers/ticketMapper";

const mockedHttpGet = httpGet as jest.MockedFunction<typeof httpGet>;
const mockedHttpPost = httpPost as jest.MockedFunction<typeof httpPost>;
const mockedToDomain = toDomainTicket as jest.MockedFunction<
  typeof toDomainTicket
>;
const mockedToBackend = toBackendCreateDTO as jest.MockedFunction<
  typeof toBackendCreateDTO
>;

describe("HttpTicketAdapter", () => {
  let adapter: HttpTicketAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new HttpTicketAdapter("http://localhost:3000");
  });

  describe("getTickets()", () => {
    it("calls httpGet with correct URL and maps results", async () => {
      const rawData = [
        { id: "1", nombre: "A", cedula: 1, consultorio: null, timestamp: 0, estado: "espera" },
        { id: "2", nombre: "B", cedula: 2, consultorio: "C1", timestamp: 1, estado: "llamado" },
      ];
      mockedHttpGet.mockResolvedValueOnce(rawData);
      mockedToDomain.mockImplementation((raw: unknown) => raw as ReturnType<typeof toDomainTicket>);

      const tickets = await adapter.getTickets();

      expect(mockedHttpGet).toHaveBeenCalledWith(
        "http://localhost:3000/turnos"
      );
      expect(mockedToDomain).toHaveBeenCalledTimes(2);
      expect(tickets).toHaveLength(2);
    });

    it("propagates errors from httpGet", async () => {
      mockedHttpGet.mockRejectedValueOnce(new Error("SERVER_ERROR"));

      await expect(adapter.getTickets()).rejects.toThrow("SERVER_ERROR");
    });
  });

  describe("createTicket()", () => {
    it("maps DTO through ACL and calls httpPost", async () => {
      const domainDTO = { name: "Carlos", documentId: 123 };
      const backendDTO = { nombre: "Carlos", cedula: 123 };
      const response = { status: "accepted" as const, message: "Created" };

      mockedToBackend.mockReturnValue(backendDTO);
      mockedHttpPost.mockResolvedValueOnce(response);

      const result = await adapter.createTicket(domainDTO);

      expect(mockedToBackend).toHaveBeenCalledWith(domainDTO);
      expect(mockedHttpPost).toHaveBeenCalledWith(
        "http://localhost:3000/turnos",
        backendDTO
      );
      expect(result).toEqual(response);
    });

    it("propagates errors from httpPost", async () => {
      mockedToBackend.mockReturnValue({ nombre: "", cedula: 0 });
      mockedHttpPost.mockRejectedValueOnce(new Error("TIMEOUT"));

      await expect(
        adapter.createTicket({ name: "", documentId: 0 })
      ).rejects.toThrow("TIMEOUT");
    });
  });
});
