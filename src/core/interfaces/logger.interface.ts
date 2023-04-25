
export interface FavaLogger {
  debug: (...msgs: any[]) => any,
  log: (...msgs: any[]) => any,
  warn: (...msgs: any[]) => any,
  error: (...msgs: any[]) => any,
}
