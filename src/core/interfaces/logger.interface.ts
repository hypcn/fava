
export interface FavaLogger {
  verbose: (...msgs: any[]) => any,
  debug: (...msgs: any[]) => any,
  log: (...msgs: any[]) => any,
  warn: (...msgs: any[]) => any,
  error: (...msgs: any[]) => any,
}
