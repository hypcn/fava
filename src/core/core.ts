import { FavaLocation } from "./interfaces/location.interface";
import { Logger } from "./utils/logger";

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
  /** To read the file as a string specify an encoding */
  encoding?: string,
  // filesystem flags? string?
}

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

export interface WriteFileOptions {
  /** When the data is a string, specify the encoding (default: "utf8") */
  encoding?: string,
  // mode? integer?
  // filesystem flags? string?
}

export type FileData = string | Buffer | Uint8Array;

export class FavaCore {

  private logger = new Logger("Core");

  locations: FavaLocation[] = [];

  constructor() {}

  // overwrite? default false
  async copy(srcLocId: string, srcPath: string, destLocId: string, destPath: string, options?: CopyOptions) { }

  // alias for ls()
  async dir(locId: string, dirPath: string) { }

  async emptyDir(locId: string, dirPath: string) { }

  async ensureFile(locId: string, filePath: string) { }

  // is recursive
  async ensureDir(locId: string, dirPath: string) { }

  async ls(locId: string, dirPath: string) { }

  // calls ensureDir
  // is recursive
  async mkdir(locId: string, dirPath: string) { }

  // overwrite? default false
  async move(srcLocId: string, srcPath: string, destLocId: string, destPath: string, options?: MoveOptions) { }

  // also ensures dir
  async outputFile(locId: string, filePath: string, data: FileData, options?: WriteFileOptions) { }

  async pathExists(locId: string, path: string): Promise<boolean> {
    return false;
  }

  // fails if file doesn't exist
  async read(locId: string, filePath: string, options?: ReadBytesOptions) { }

  // Alias for ls()
  async readDir(locId: string, dirPath: string) { }

  // fails if file doesn't exist
  async readFile(locId: string, filePath: string, options?: ReadFileOptions) { }

  async remove(locId: string, path: string) { }

  async rename(locId: string, oldPath: string, newPath: string) { }

  async stat(locId: string, path: string) { }

  // calls ensureFile
  async touch(locId: string, filePath: string) { }

  // fails if file doesn't exist
  async write(locId: string, filePath: string, data: FileData, options?: WriteBytesOptions) { }

  async writeFile(locId: string, filePath: string, data: FileData, options?: WriteFileOptions) { }

}
