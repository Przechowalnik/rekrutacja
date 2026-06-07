export function extractApartmentNumber(address: string): string | undefined {
  // Search type "/12", "m12", "lok. 3", "m 1" itp.
  const match = /[\s/-]?(?:m|lok\.?)\s*([\da-z]+)/i.exec(address);
  return match?.[1];
}
