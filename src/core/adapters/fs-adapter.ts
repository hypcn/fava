import { join, parse } from "path";
import { FavaLocationFS } from "../interfaces";
import { CopyOptions, MoveOptions, FileData, WriteFileOptions, ReadBytesOptions, ReadFileOptions, WriteBytesOptions, FavaAdapter, DirInfo, ReadFileResult, WriteBytesResult, FileInfo } from "./adapter.interface";
import * as fse from "fs-extra";
import { Logger } from "../utils/logger";
import { FavaUtils } from "../utils/utils";

export class FavaFsAdapter implements FavaAdapter<FavaLocationFS> {

  private logger = new Logger("FS Adapter");

  async copy(srcLoc: FavaLocationFS, srcPath: string, destLoc: FavaLocationFS, destPath: string, options?: CopyOptions): Promise<void> {
    const fullSrcPath = join(srcLoc.root, srcPath);
    const fullDestPath = join(destLoc.root, destPath);
    return fse.copy(fullSrcPath, fullDestPath, {
      overwrite: options?.overwrite,
      errorOnExist: true,
    });
  }

  async emptyDir(loc: FavaLocationFS, dirPath: string): Promise<void> {
    const path = join(loc.root, dirPath);
    await fse.emptyDir(path);
  }

  async ensureFile(loc: FavaLocationFS, filePath: string): Promise<void> {
    const path = join(loc.root, filePath);
    await fse.ensureFile(path);
  }

  async ensureDir(loc: FavaLocationFS, dirPath: string): Promise<void> {
    const path = join(loc.root, dirPath);
    await fse.ensureDir(path);
  }

  async ls(loc: FavaLocationFS, dirPath: string): Promise<DirInfo> {
    const path = join(loc.root, dirPath);

    const dirStats = await this.stat(loc, dirPath);
    
    const filenames = await fse.readdir(path);
    const statPromises = filenames.map(filename => {
      return this.stat(loc, join(dirPath, filename));
    });
    const filesInfo = await Promise.all(statPromises);

    const dirInfo: DirInfo = {
      dir: dirStats,
      files: filesInfo,
    };
    return dirInfo;
  }

  async move(srcLoc: FavaLocationFS, srcPath: string, destLoc: FavaLocationFS, destPath: string, options?: MoveOptions): Promise<void> {
    const fullSrcPath = join(srcLoc.root, srcPath);
    const fullDestPath = join(destLoc.root, destPath);
    return fse.move(fullSrcPath, fullDestPath, {
      overwrite: options?.overwrite,
      // dereference,
    });
  }

  async outputFile(loc: FavaLocationFS, filePath: string, data: FileData, options?: WriteFileOptions): Promise<void> {
    const fullFilePath = join(loc.root, filePath);
    // const fullDirPath = dirname(fullFilePath);
    // await fse.ensureDir(fullDirPath);
    return fse.outputFile(fullFilePath, data, {
      encoding: options?.encoding,
      // flag: options.flag,
      // mode: options.mode,
      // signal: options.signal,
    });
  }

  async pathExists(loc: FavaLocationFS, path: string): Promise<boolean> {
    const fullPath = join(loc.root, path);
    return fse.pathExists(fullPath);
  }

  // fails if file doesn't exist
  async read(loc: FavaLocationFS, filePath: string, options?: ReadBytesOptions): Promise<void> {
    // fse.read()
    throw new Error("Not implemented: read()");
    // TODO
  }

  async readFile(loc: FavaLocationFS, filePath: string, options?: ReadFileOptions): Promise<ReadFileResult> {
    const path = join(loc.root, filePath);
    return fse.readFile(path, {
      encoding: options?.encoding,
    });
  }

  async remove(loc: FavaLocationFS, path: string): Promise<void> {
    const fullPath = join(loc.root, path);
    return fse.remove(fullPath);
  }

  async rename(loc: FavaLocationFS, oldPath: string, newPath: string): Promise<void> {
    const fullOldPath = join(loc.root, oldPath);
    const fullNewPath = join(loc.root, newPath);
    return fse.rename(fullOldPath, fullNewPath);
  }

  async stat(loc: FavaLocationFS, path: string) {
    const fullPath = join(loc.root, path);
    const stat = await fse.stat(fullPath);

    const parsedPath = parse(fullPath);
    const fileInfo: FileInfo = {
      fullpath: FavaUtils.slash(fullPath),
      dirpath: FavaUtils.slash(parsedPath.dir),
      filename: parsedPath.base,
      basename: parsedPath.name,
      ext: parsedPath.ext,

      size: stat.size,
      isDir: stat.isDirectory(),

      created: stat.birthtimeMs,
      modified: stat.mtimeMs,
      changed: stat.ctimeMs,
      accessed: stat.atimeMs,
    };
    return fileInfo;
  }

  // fails if file doesn't exist
  async write(loc: FavaLocationFS, filePath: string, data: FileData, options?: WriteBytesOptions): Promise<WriteBytesResult> {
    throw new Error("Not implemented: write()");
    // TODO
  }

  async writeFile(loc: FavaLocationFS, filePath: string, data: FileData, options?: WriteFileOptions): Promise<void> {
    const path = join(loc.root, filePath);
    return fse.writeFile(path, data, {
      encoding: options?.encoding,
      // flag: options.flag,
      // mode: options.mode,
      // signal: options.signal,
    });
  }

}
