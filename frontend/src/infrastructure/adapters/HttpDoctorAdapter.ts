import type { Doctor, CreateDoctorData, UpdateDoctorData, AvailableShiftsResponse } from "@/domain/Doctor";
import type { DoctorService } from "@/domain/ports/DoctorService";
import { getAuthCookie } from "@/infrastructure/cookies/cookieUtils";

export class HttpDoctorAdapter implements DoctorService {
  constructor(private readonly baseUrl: string) {}

  private buildHeaders(): Record<string, string> {
    const token = getAuthCookie();
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }

  async getAll(): Promise<Doctor[]> {
    const res = await fetch(`${this.baseUrl}/api/v1/doctors`, {
      headers: this.buildHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP_ERROR_${res.status}`);
    return res.json();
  }

  async create(data: CreateDoctorData): Promise<Doctor> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...this.buildHeaders(),
    };

    const res = await fetch(`${this.baseUrl}/api/v1/doctors`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (res.status === 409) {
      const body = await res.json();
      throw new Error(body.message || "CONFLICT");
    }

    if (!res.ok) throw new Error(`HTTP_ERROR_${res.status}`);
    return res.json();
  }

  async update(id: string, data: UpdateDoctorData): Promise<Doctor> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...this.buildHeaders(),
    };

    const res = await fetch(`${this.baseUrl}/api/v1/doctors/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });

    if (res.status === 409) {
      const body = await res.json();
      throw new Error(body.message || "CONFLICT");
    }

    if (!res.ok) throw new Error(`HTTP_ERROR_${res.status}`);
    return res.json();
  }

  async getAvailableShifts(
    office: string,
    excludeDoctorId?: string
  ): Promise<AvailableShiftsResponse> {
    const params = new URLSearchParams({ office });
    if (excludeDoctorId) params.set("exclude_doctor_id", excludeDoctorId);

    const res = await fetch(
      `${this.baseUrl}/api/v1/doctors/available-shifts?${params}`,
      { headers: this.buildHeaders() }
    );

    if (!res.ok) throw new Error(`HTTP_ERROR_${res.status}`);
    return res.json();
  }

  async remove(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/v1/doctors/${id}`, {
      method: "DELETE",
      headers: this.buildHeaders(),
    });

    if (res.status === 409) {
      const body = await res.json();
      throw new Error(body.message || "CONFLICT");
    }

    if (!res.ok) throw new Error(`HTTP_ERROR_${res.status}`);
  }
}
