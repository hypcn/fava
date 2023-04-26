import { DirInfo, FavaLocation, FileInfo } from "../../shared";

export interface CopyOptions {
  /** Overwrite any destination files */
  overwrite?: boolean,
}

export interface MoveOptions {
  /** Overwrite any destination files */
  overwrite?: boolean,
}

export interface ReadBytesOptions {
  /** The buffer to write the data to */
  buffer?: Buffer,
  /** The offset within the buffer to start writing at */
  offset?: number,
  /** The number of bytes to read */
  length?: number,
  /** The position in the file to start reading at */
  position?: number,
}

export interface ReadFileOptions {
  /** To read the file as a string, specify an encoding */
  encoding?: BufferEncoding,
  // filesystem flags? string?
}

export type ReadFileResult = Buffer | string;

export interface WriteBytesOptions {
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

export interface WriteBytesResult {
  bytesWritten: number,
}

export interface WriteFileOptions {
  /** When the data is a string, specify the encoding (default: "utf8") */
  encoding?: BufferEncoding,
  // mode? integer?
  // filesystem flags? string?
}

export type FileData = string | Buffer | Uint8Array;

export interface FavaAdapter<T extends FavaLocation> {

  append(loc: T, filePath: string, data: FileData, options?: WriteFileOptions): Promise<void>;

  copy(srcLoc: T, srcPath: string, destLoc: T, destPath: string, options?: CopyOptions): Promise<void>;

  // dir(loc: T, dirPath: string): Promise<DirInfo>;

  emptyDir(loc: T, dirPath: string): Promise<void>;

  ensureFile(loc: T, filePath: string): Promise<void>;

  ensureDir(loc: T, dirPath: string): Promise<void>;

  ls(loc: T, dirPath: string): Promise<DirInfo>;

  // mkdir(loc: T, dirPath: string): Promise<void>;

  move(srcLoc: T, srcPath: string, destLoc: T, destPath: string, options?: MoveOptions): Promise<void>;

  outputFile(loc: T, filePath: string, data: FileData, options?: WriteFileOptions): Promise<void>;

  pathExists(loc: T, path: string): Promise<boolean>;

  read(loc: T, filePath: string, options?: ReadBytesOptions): Promise<void>;

  // readDir(loc: T, dirPath: string): Promise<DirInfo>;

  readFile(loc: T, filePath: string, options?: ReadFileOptions): Promise<ReadFileResult>;

  remove(loc: T, path: string): Promise<void>;

  rename(loc: T, oldPath: string, newPath: string): Promise<void>;

  stat(loc: T, path: string): Promise<FileInfo>;

  // touch(loc: T, filePath: string): Promise<void>;

  write(loc: T, filePath: string, data: FileData, options?: WriteBytesOptions): Promise<WriteBytesResult>;

  writeFile(loc: T, filePath: string, data: FileData, options ?: WriteFileOptions): Promise<void>;
}