
/**
 * Convert backslashes to forward slashes
 * @param s 
 * @returns 
 */
export function backslashToForward(s: string): string {
  return s.replace(/\\/g, "/");
}

export function arrayBufferToBuffer(input: ArrayBuffer | string): Buffer | string {
  if (typeof input === "string") return input;
  // const buffer = Buffer.alloc(input.byteLength);
  return Buffer.from(input);
}
