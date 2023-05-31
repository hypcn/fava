import { Logger } from "@hypericon/axe";
import * as fse from "fs-extra";
import mime from "mime";
import { join, parse } from "path";
import { DirInfo, FavaLocation_FS, FileInfo } from "../../shared";
import { backslashToForward } from "../utils";
import { CopyOptions, FileData, IFavaAdapter, MoveOptions, ReadChunkOptions, ReadChunkResult, ReadFileOptions, ReadFileResult, WriteChunkOptions, WriteChunkResult, WriteFileOptions } from "./adapter.interface";

export class FsAdapter implements IFavaAdapter<FavaLocation_FS> {

  private logger = new Logger("FS Adapter");

  constructor(options?: {
    logger?: Logger,
  }) {
    if (options?.logger) this.logger = options.logger;
  }

  getType(): "FS" {
    return "FS";
  }

  async append(loc: FavaLocation_FS, filePath: string, data: FileData, options?: WriteFileOptions): Promise<void> {
    this.logger.verbose(`append:`, loc.id, filePath);
    const path = join(loc.root, filePath);
    await fse.appendFile(path, data, {
      encoding: options?.encoding,
      // flag,
      // mode,
      // signal,
    });
  }

  async copy(fromLoc: FavaLocation_FS, fromPath: string, toLoc: FavaLocation_FS, toPath: string, options?: CopyOptions): Promise<void> {
    this.logger.verbose(`copy:`, fromLoc.id, fromPath, toLoc.id, toPath);
    const fullSrcPath = join(fromLoc.root, fromPath);
    const fullDestPath = join(toLoc.root, toPath);
    return fse.copy(fullSrcPath, fullDestPath, {
      overwrite: options?.overwrite ?? false,
      errorOnExist: true,
    });
  }

  async emptyDir(loc: FavaLocation_FS, dirPath: string): Promise<void> {
    this.logger.verbose(`emptyDir:`, loc.id, dirPath);
    const path = join(loc.root, dirPath);
    await fse.emptyDir(path);
  }

  async ensureFile(loc: FavaLocation_FS, filePath: string): Promise<void> {
    this.logger.verbose(`ensureFile:`, loc.id, filePath);
    const path = join(loc.root, filePath);
    await fse.ensureFile(path);
  }

  async ensureDir(loc: FavaLocation_FS, dirPath: string): Promise<void> {
    this.logger.verbose(`ensureDir:`, loc.id, dirPath);
    const path = join(loc.root, dirPath);
    await fse.ensureDir(path);
  }

  async exists(loc: FavaLocation_FS, path: string): Promise<boolean> {
    this.logger.verbose(`pathExists:`, loc.id, path);
    const fullPath = join(loc.root, path);
    return fse.pathExists(fullPath);
  }

  async move(fromLoc: FavaLocation_FS, fromPath: string, toLoc: FavaLocation_FS, toPath: string, options?: MoveOptions): Promise<void> {
    this.logger.verbose(`move:`, fromLoc.id, fromPath, toLoc.id, toPath);
    const fullSrcPath = join(fromLoc.root, fromPath);
    const fullDestPath = join(toLoc.root, toPath);
    return fse.move(fullSrcPath, fullDestPath, {
      overwrite: options?.overwrite ?? false,
      // dereference,
    });
  }

  async readDir(loc: FavaLocation_FS, dirPath: string): Promise<DirInfo> {
    this.logger.verbose(`ls:`, loc.id, dirPath);
    const lsPath = join(loc.root, dirPath);

    const dirStats = await this.stat(loc, dirPath);

    const filenames = await fse.readdir(lsPath);
    const statPromises = filenames.map(filename => {
      const filePathWithinLoc = join(dirPath, filename);
      return this.stat(loc, filePathWithinLoc).catch(err => {
        this.logger.warn(`Error reading stats for ${loc.root} ${filePathWithinLoc}:`, err.code);
        return undefined;
      });
    });
    const statResults = await Promise.all(statPromises);
    let filesInfo: FileInfo[] = statResults.filter(r => r !== undefined) as FileInfo[];
    // ^ this might want to return soe sort of incomplete stats later

    const dirInfo: DirInfo = {
      dir: dirStats,
      files: filesInfo,
    };
    return dirInfo;
  }

  async readFile(loc: FavaLocation_FS, filePath: string, options?: ReadFileOptions): Promise<ReadFileResult> {
    this.logger.verbose(`readFile:`, loc.id, filePath);
    const path = join(loc.root, filePath);
    return fse.readFile(path, {
      encoding: options?.encoding,
    });
  }

  // fails if file doesn't exist
  async readFileChunk(loc: FavaLocation_FS, filePath: string, options?: ReadChunkOptions): Promise<ReadChunkResult> {
    this.logger.verbose(`read:`, loc.id, filePath);

    // Ensure the file exists before attempting to read a chunk
    const fullPath = join(loc.root, filePath);
    const fileExists = await fse.pathExists(fullPath);

    if (!fileExists) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Set default options
    const encoding = options?.encoding;
    const position = options?.position || 0;
    const length = options?.length || (await fse.stat(fullPath)).size - position;

    // Read the chunk from the file
    const buffer = options?.buffer ?? Buffer.alloc(length);
    const fd = await fse.open(fullPath, 'r');
    try {
      const { bytesRead } = await fse.read(fd, buffer, 0, length, position);
      const data = encoding === undefined
        ? buffer.subarray(0, bytesRead)
        : buffer.toString(encoding, 0, bytesRead);
      return { bytesRead, data };
    } finally {
      await fse.close(fd);
    }

  }

  async remove(loc: FavaLocation_FS, path: string): Promise<void> {
    this.logger.verbose(`remove:`, loc.id, path);
    const fullPath = join(loc.root, path);
    return fse.remove(fullPath);
  }

  async rename(loc: FavaLocation_FS, oldPath: string, newPath: string): Promise<void> {
    this.logger.verbose(`rename:`, loc.id, oldPath, "->", newPath);
    const fullOldPath = join(loc.root, oldPath);
    const fullNewPath = join(loc.root, newPath);
    return fse.rename(fullOldPath, fullNewPath);
  }

  async stat(loc: FavaLocation_FS, path: string) {
    this.logger.verbose(`stat:`, loc.id, path);

    const fullPath = join(loc.root, path);
    const stat = await fse.stat(fullPath);

    const parsedPath = parse(path);
    const mimeType = stat.isDirectory() ? "" : (mime.getType(path) ?? "");

    const fileInfo: FileInfo = {
      fullpath: backslashToForward(path),
      dirpath: backslashToForward(parsedPath.dir),
      filename: parsedPath.base,
      basename: parsedPath.name,
      ext: parsedPath.ext,

      mimeType: mimeType,
      isDir: stat.isDirectory(),
      size: stat.size,

      created: stat.birthtimeMs,
      modified: stat.mtimeMs,
      changed: stat.ctimeMs,
      accessed: stat.atimeMs,
    };

    return fileInfo;
  }

  async writeFile(loc: FavaLocation_FS, filePath: string, data: FileData, options?: WriteFileOptions): Promise<void> {
    this.logger.verbose(`writeFile:`, loc.id, filePath);
    const path = join(loc.root, filePath);
    return fse.outputFile(path, data, {
      encoding: options?.encoding,
      // flag: options.flag,
      // mode: options.mode,
      // signal: options.signal,
    });
  }

  // fails if file doesn't exist
  async writeFileChunk(loc: FavaLocation_FS, filePath: string, data: FileData, options?: WriteChunkOptions): Promise<WriteChunkResult> {
    this.logger.verbose(`writeFileChunk:`, loc.id, filePath);

    // Ensure the file exists before attempting to write a chunk
    const fullPath = join(loc.root, filePath);
    const fileExists = await fse.pathExists(fullPath);

    if (!fileExists) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Set default options
    const encoding = (options?.encoding || 'utf8') as BufferEncoding;
    const offset = options?.offset || 0;
    const length = options?.length || (data instanceof Buffer ? data.length : Buffer.byteLength(data, encoding));
    const position = options?.position || null;

    // Write the chunk to the file
    const fd = await fse.open(fullPath, 'r+');
    try {
      const dataBuffer = typeof data === "string" ? Buffer.from(data, "utf8") : data;
      const { bytesWritten, buffer } = await fse.write(fd, dataBuffer, offset, length, position);
      return { bytesWritten };
    } finally {
      await fse.close(fd);
    }

  }

}
