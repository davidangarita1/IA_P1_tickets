function required(name: string, value?: string): string {
  if (!value) throw new Error(`Missing env variable: ${name}`);
  return value;
}

export const env = {
  API_BASE_URL: required(
    "NEXT_PUBLIC_API_BASE_URL",
    process.env.NEXT_PUBLIC_API_BASE_URL
  ),
  WS_URL: required(
    "NEXT_PUBLIC_WS_URL",
    process.env.NEXT_PUBLIC_WS_URL
  ),
};
