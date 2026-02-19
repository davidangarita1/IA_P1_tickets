
class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly threshold = 5;
  private readonly timeout = 60000;

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      throw new Error("CIRCUIT_OPEN");
    }

    try {
      const result = await fn();
      this.reset();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private isOpen(): boolean {
    if (this.failureCount >= this.threshold) {
      const now = Date.now();
      if (now - this.lastFailureTime < this.timeout) {
        return true;
      }
      this.reset();
    }
    return false;
  }

  private recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
  }

  private reset(): void {
    this.failureCount = 0;
    this.lastFailureTime = 0;
  }
}

const breaker = new CircuitBreaker();

async function request<T>(
  url: string,
  options: RequestInit
): Promise<T> {
  return breaker.execute(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP_ERROR`);
      }

      return response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  });
}

export async function httpGet<T>(url: string): Promise<T> {
  return request<T>(url, { method: "GET" });
}

export async function httpPost<T>(
  url: string,
  data: unknown
): Promise<T> {
  return request<T>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
