
/**
 * Convert backslashes to forward slashes
 * @param s 
 * @returns 
 */
export function backslashToForward(s: string): string {
  return s.replace(/\\/g, "/");
}
