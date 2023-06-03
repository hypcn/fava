
export interface FavaClientConfig {

  /**
   * Provide an implementation for `fetch()`
   * 
   * E.g.: https://github.com/node-fetch/node-fetch
   */
  fetch: typeof fetch,

  /**
   * 
   * @default "http://localhost:6131"
   */
  origin?: string,

  routePrefix?: string,

  // TODO: auth?

}

export interface ClientReadFileOptions<T extends "text" | "binary" = any> {
  returnAs?: T,
}

export type FileResultData<T extends "text" | "binary" = any> = T extends "text" ? string : T extends "binary" ? Uint8Array : string | Uint8Array;

export interface ClientReadFileResult<T extends "text" | "binary" = any> {
  data: FileResultData<T>,
  mimeType: string,
  fileSize: number | undefined,
  lastModified: number | undefined,
}

export interface ClientReadChunkOptions {
  /** The range start in bytes */
  rangeStart?: number,
  /** The range end in bytes - requires the range start to be defined */
  rangeEnd?: number,
  // /** Read the specified number of bytes fromt he end of the file */
  // suffixLength?: number,
  returnAs?: "text" | "binary",
}

export interface ClientReadChunkResult {
  /** The data read from the file */
  data: string | Uint8Array,
  /** The number of bytes read */
  bytesRead: number | undefined,
  /** The start of the range, 0-indexed, inclusive */
  chunkStart: number | undefined,
  /** The end of the range, 0-indexed, inclusive */
  chunkEnd: number | undefined,
  /** The total size of the file */
  fileSize: number | undefined,
  /** May be empty for unknown types */
  mimeType: string | undefined,
}

export interface ClientWriteFileOptions {
  /**  */
  mimeType?: string,
}

export interface ClientWriteChunkOptions {
  /** The range start in bytes */
  rangeStart?: number,
  /** The range end in bytes - requires the range start to be defined. Does not truncate string chunks. */
  rangeEnd?: number,
  // /** Read the specified number of bytes from the end of the file */
  // suffixLength?: number,
  /**  */
  mimeType?: string,
}

export interface ClientWriteChunkResult {
  bytesWritten: number,
}
