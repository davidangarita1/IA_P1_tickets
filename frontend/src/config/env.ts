function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing env variable: ${name}`);
  return value;
}

export const env = {
  get API_BASE_URL(): string {
    return required("NEXT_PUBLIC_API_BASE_URL", "http://localhost:3000");
  },
  get WS_URL(): string {
    return required("NEXT_PUBLIC_WS_URL", "http://localhost:3000");
  },
};
