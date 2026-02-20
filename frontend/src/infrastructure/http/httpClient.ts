import { CircuitBreaker } from "./CircuitBreaker";

export interface RequestConfig {
  retries?: number;
  timeout?: number;
}

const DEFAULT_RETRIES = 2;
const DEFAULT_TIMEOUT = 4000;

const circuits = new Map<string, CircuitBreaker>();

function getCircuit(url: string): CircuitBreaker {
  const host = new URL(url, "http://dummy").host;
  if (!circuits.has(host)) {
    circuits.set(host, new CircuitBreaker());
  }
  return circuits.get(host)!;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function request<T>(
  url: string,
  options: RequestInit,
  config: RequestConfig = {}
): Promise<T> {
  const retries = config.retries ?? DEFAULT_RETRIES;
  const timeout = config.timeout ?? DEFAULT_TIMEOUT;
  const circuit = getCircuit(url);

  if (!circuit.canRequest()) {
    throw new Error("CIRCUIT_OPEN");
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(id);

      if (!res.ok) {
        if (res.status === 429) throw new Error("RATE_LIMIT");
        if (res.status >= 500) throw new Error("SERVER_ERROR");
        throw new Error("HTTP_ERROR");
      }

      const data = await res.json();
      circuit.success();
      return data;
    } catch (err: unknown) {
      clearTimeout(id);

      const message = err instanceof Error ? err.message : "";
      const name = err instanceof Error ? err.name : "";

      if (name === "AbortError" && attempt === retries) {
        circuit.fail();
        throw new Error("TIMEOUT");
      }

      if (message === "SERVER_ERROR" && attempt === retries) {
        circuit.fail();
        throw err;
      }

      if (message === "RATE_LIMIT") {
        throw err;
      }

      if (attempt === retries) {
        circuit.fail();
        throw err;
      }

      const backoff = 300 * Math.pow(2, attempt);
      await sleep(backoff);
    }
  }

  throw new Error("UNEXPECTED_HTTP_ERROR");
}

export function httpGet<T>(url: string, config?: RequestConfig): Promise<T> {
  return request<T>(url, { method: "GET", cache: "no-store" }, config);
}

export function httpPost<T>(url: string, body: unknown, config?: RequestConfig): Promise<T> {
  return request<T>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }, config);
}
