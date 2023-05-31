import { DirInfo, FavaLocation, FileInfo } from "../../shared";

export interface CopyOptions {
  /** Overwrite any destination files */
  overwrite?: boolean,
}

export interface MoveOptions {
  /** Overwrite any destination files */
  overwrite?: boolean,
}

export interface ReadFileOptions {
  /** To read the file as a string, specify an encoding */
  encoding?: BufferEncoding,
  // filesystem flags? string?
}

export interface ReadChunkOptions {
  encoding?: string,
  /** The buffer to write the data to */
  buffer?: Buffer,
  /** The offset within the buffer to start writing at */
  offset?: number,
  /** The number of bytes to read */
  length?: number,
  /** The position in the file to start reading at */
  position?: number,
}

export type ReadFileResult = Buffer | string;

export interface ReadChunkResult {
  data: string | Buffer,
  bytesRead: number,
}

export interface WriteChunkOptions {
  /** When the data is a string, specify the encoding (default: "utf8") */
  encoding?: string,
  // mode? integer?
  // filesystem flags? string?
  /** When the data is a buffer, specify the offset within the buffer to start writing from */
  offset?: number,
  /** When the data is a buffer, specify number of bytes to write */
  length?: number,
  /** Specify the position within the file at which to start writing */
  position?: number,
}

export interface WriteChunkResult {
  bytesWritten: number,
}

export interface WriteFileOptions {
  /** When the data is a string, specify the encoding (default: "utf8") */
  encoding?: BufferEncoding,
  // mode? integer?
  // filesystem flags? string?
}

export type FileData = string | Buffer | Uint8Array;

export interface IFavaAdapter<T extends FavaLocation> {

  getType(): T["type"];

  append(loc: T, filePath: string, data: FileData, options?: WriteFileOptions): Promise<void>;

  copy(srcLoc: T, srcPath: string, destLoc: T, destPath: string, options?: CopyOptions): Promise<void>;

  emptyDir(loc: T, dirPath: string): Promise<void>;

  ensureDir(loc: T, dirPath: string): Promise<void>;

  ensureFile(loc: T, filePath: string): Promise<void>;

  exists(loc: T, path: string): Promise<boolean>;

  move(srcLoc: T, srcPath: string, destLoc: T, destPath: string, options?: MoveOptions): Promise<void>;

  readDir(loc: T, dirPath: string): Promise<DirInfo>;

  readFile(loc: T, filePath: string, options?: ReadFileOptions): Promise<ReadFileResult>;

  readFileChunk(loc: T, filePath: string, options?: ReadChunkOptions): Promise<ReadChunkResult>;

  remove(loc: T, path: string): Promise<void>;

  rename(loc: T, oldPath: string, newPath: string): Promise<void>;

  stat(loc: T, path: string): Promise<FileInfo>;

  /**
   * Write data to a file, ensuring the directory path, and replacing the file if it already existed
   * @param loc 
   * @param filePath 
   * @param data 
   * @param options 
   */
  writeFile(loc: T, filePath: string, data: FileData, options?: WriteFileOptions): Promise<void>;

  /**
   * Write some data to a specified section of an existing file
   * @param loc 
   * @param filePath 
   * @param data 
   * @param options 
   */
  writeFileChunk(loc: T, filePath: string, data: FileData, options?: WriteChunkOptions): Promise<WriteChunkResult>;

}
