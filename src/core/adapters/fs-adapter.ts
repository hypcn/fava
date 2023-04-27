import { join, parse } from "path";
import { CopyOptions, MoveOptions, FileData, WriteFileOptions, ReadBytesOptions, ReadFileOptions, WriteBytesOptions, IFavaAdapter, ReadFileResult, WriteBytesResult } from "./adapter.interface";
import * as fse from "fs-extra";
import { Logger } from "../utils/logger";
import { FavaUtils } from "../utils/utils";
import { DirInfo, FavaLocation_FS, FileInfo } from "../../shared";

export class FsAdapter implements IFavaAdapter<FavaLocation_FS> {

  private logger = new Logger("FS Adapter");

  getType(): "FS" {
    return "FS";
  }

  async append(loc: FavaLocation_FS, filePath: string, data: FileData, options?: WriteFileOptions): Promise<void> {
    const path = join(loc.root, filePath);
    await fse.appendFile(path, data, {
      encoding: options?.encoding,
      // flag,
      // mode,
      // signal,
    });
  }

  async copy(srcLoc: FavaLocation_FS, srcPath: string, destLoc: FavaLocation_FS, destPath: string, options?: CopyOptions): Promise<void> {
    const fullSrcPath = join(srcLoc.root, srcPath);
    const fullDestPath = join(destLoc.root, destPath);
    return fse.copy(fullSrcPath, fullDestPath, {
      overwrite: options?.overwrite ?? false,
      errorOnExist: true,
    });
  }

  async emptyDir(loc: FavaLocation_FS, dirPath: string): Promise<void> {
    const path = join(loc.root, dirPath);
    await fse.emptyDir(path);
  }

  async ensureFile(loc: FavaLocation_FS, filePath: string): Promise<void> {
    const path = join(loc.root, filePath);
    await fse.ensureFile(path);
  }

  async ensureDir(loc: FavaLocation_FS, dirPath: string): Promise<void> {
    const path = join(loc.root, dirPath);
    await fse.ensureDir(path);
  }

  async ls(loc: FavaLocation_FS, dirPath: string): Promise<DirInfo> {
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

  async move(srcLoc: FavaLocation_FS, srcPath: string, destLoc: FavaLocation_FS, destPath: string, options?: MoveOptions): Promise<void> {
    const fullSrcPath = join(srcLoc.root, srcPath);
    const fullDestPath = join(destLoc.root, destPath);
    return fse.move(fullSrcPath, fullDestPath, {
      overwrite: options?.overwrite ?? false,
      // dereference,
    });
  }

  async outputFile(loc: FavaLocation_FS, filePath: string, data: FileData, options?: WriteFileOptions): Promise<void> {
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

  async pathExists(loc: FavaLocation_FS, path: string): Promise<boolean> {
    const fullPath = join(loc.root, path);
    return fse.pathExists(fullPath);
  }

  // fails if file doesn't exist
  async read(loc: FavaLocation_FS, filePath: string, options?: ReadBytesOptions): Promise<ReadFileResult> {
    // fse.read()
    throw new Error("Not implemented: read()");
    // TODO
  }

  async readFile(loc: FavaLocation_FS, filePath: string, options?: ReadFileOptions): Promise<ReadFileResult> {
    const path = join(loc.root, filePath);
    return fse.readFile(path, {
      encoding: options?.encoding,
    });
  }

  async remove(loc: FavaLocation_FS, path: string): Promise<void> {
    const fullPath = join(loc.root, path);
    return fse.remove(fullPath);
  }

  async rename(loc: FavaLocation_FS, oldPath: string, newPath: string): Promise<void> {
    const fullOldPath = join(loc.root, oldPath);
    const fullNewPath = join(loc.root, newPath);
    return fse.rename(fullOldPath, fullNewPath);
  }

  async stat(loc: FavaLocation_FS, path: string) {
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
  async write(loc: FavaLocation_FS, filePath: string, data: FileData, options?: WriteBytesOptions): Promise<WriteBytesResult> {
    throw new Error("Not implemented: write()");
    // TODO

    // fse.write()
    
  }

  async writeFile(loc: FavaLocation_FS, filePath: string, data: FileData, options?: WriteFileOptions): Promise<void> {
    const path = join(loc.root, filePath);
    return fse.writeFile(path, data, {
      encoding: options?.encoding,
      // flag: options.flag,
      // mode: options.mode,
      // signal: options.signal,
    });
  }

}
