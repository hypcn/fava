
/**
 * Convert backslashes to forward slashes
 * @param s 
 * @returns 
 */
export function backslashToForward(s: string): string {
  return s.replace(/\\/g, "/");
}

export function toStringOrUint8Array(input: string | ArrayBuffer | Buffer): string | Uint8Array {
  if (typeof input === "string") return input;
  if (input instanceof Buffer) return input.toString();
  return new Uint8Array(input);
}
