function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env variable: ${name}`);
  return value;
}

export const env = {
  get API_BASE_URL(): string {
    return required("NEXT_PUBLIC_API_BASE_URL");
  },
  get WS_URL(): string {
    return required("NEXT_PUBLIC_WS_URL");
  },
};
