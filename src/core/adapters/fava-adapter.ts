import { join, parse } from "path";
import { CopyOptions, MoveOptions, FileData, WriteFileOptions, ReadBytesOptions, ReadFileOptions, WriteBytesOptions, IFavaAdapter, ReadFileResult, WriteBytesResult } from "./adapter.interface";
// import * as fse from "fs-extra";
import { Logger } from "../utils/logger";
import { FavaUtils } from "../utils/utils";
import { DirInfo, FavaLocation_Fava, FileInfo } from "../../shared";
import fetch from "node-fetch";
import { FavaClient } from "../../client";

export class FavaAdapter implements IFavaAdapter<FavaLocation_Fava> {

  private logger = new Logger("Fava Adapter");

  /** Map of location IDs to client library instances */
  private locationClients = new Map<string, FavaClient>();

  constructor() {}

  private getClient(location: FavaLocation_Fava): FavaClient {
    let existing = this.locationClients.get(location.id);
    if (existing) return existing;

    this.logger.log(`Creating new client for Fava location with ID: ${location.id} (${location.origin})`);
    const client = new FavaClient({
      fetch: fetch as any,
      origin: location.origin,
      routePrefix: location.routePrefix,
    });
    this.locationClients.set(location.id, client);
    return client;
  }

  async append(loc: FavaLocation_Fava, filePath: string, data: FileData, options?: WriteFileOptions): Promise<void> {
    const client = this.getClient(loc);
    const result = await client.append(loc.remoteId, filePath, data);
    return;
  }

  async copy(srcLoc: FavaLocation_Fava, srcPath: string, destLoc: FavaLocation_Fava, destPath: string, options?: CopyOptions): Promise<void> {
    const client = this.getClient(srcLoc);
    const result = await client.copy(srcLoc.remoteId, srcPath, destLoc.id, destPath, options);
    return;
  }

  async emptyDir(loc: FavaLocation_Fava, dirPath: string): Promise<void> {
    const client = this.getClient(loc);
    const result = await client.emptyDir(loc.remoteId, dirPath);
    return;
  }

  async ensureFile(loc: FavaLocation_Fava, filePath: string): Promise<void> {
    const client = this.getClient(loc);
    const result = await client.ensureFile(loc.remoteId, filePath);
    return;
  }

  async ensureDir(loc: FavaLocation_Fava, dirPath: string): Promise<void> {
    const client = this.getClient(loc);
    const result = await client.ensureDir(loc.remoteId, dirPath);
    return;
  }

  async ls(loc: FavaLocation_Fava, dirPath: string): Promise<DirInfo> {
    const client = this.getClient(loc);
    const result = await client.readDir(loc.remoteId, dirPath);
    return result.dirInfo;
  }

  async move(srcLoc: FavaLocation_Fava, srcPath: string, destLoc: FavaLocation_Fava, destPath: string, options?: MoveOptions): Promise<void> {
    const client = this.getClient(srcLoc);
    const result = await client.move(srcLoc.remoteId, srcPath, destLoc.remoteId, destPath, options);
    return;
  }

  async outputFile(loc: FavaLocation_Fava, filePath: string, data: FileData, options?: WriteFileOptions): Promise<void> {
    const client = this.getClient(loc);

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

  async pathExists(loc: FavaLocation_Fava, path: string): Promise<boolean> {
    const client = this.getClient(loc);

    const fullPath = join(loc.root, path);
    return fse.pathExists(fullPath);
  }

  // fails if file doesn't exist
  async read(loc: FavaLocation_Fava, filePath: string, options?: ReadBytesOptions): Promise<void> {
    const client = this.getClient(loc);

    // fse.read()
    throw new Error("Not implemented: read()");
    // TODO
  }

  async readFile(loc: FavaLocation_Fava, filePath: string, options?: ReadFileOptions): Promise<ReadFileResult> {
    const client = this.getClient(loc);

    const path = join(loc.root, filePath);
    return fse.readFile(path, {
      encoding: options?.encoding,
    });
  }

  async remove(loc: FavaLocation_Fava, path: string): Promise<void> {
    const client = this.getClient(loc);

    const fullPath = join(loc.root, path);
    return fse.remove(fullPath);
  }

  async rename(loc: FavaLocation_Fava, oldPath: string, newPath: string): Promise<void> {
    const client = this.getClient(loc);

    const fullOldPath = join(loc.root, oldPath);
    const fullNewPath = join(loc.root, newPath);
    return fse.rename(fullOldPath, fullNewPath);
  }

  async stat(loc: FavaLocation_Fava, path: string) {
    const client = this.getClient(loc);

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
  async write(loc: FavaLocation_Fava, filePath: string, data: FileData, options?: WriteBytesOptions): Promise<WriteBytesResult> {
    const client = this.getClient(loc);

    throw new Error("Not implemented: write()");
    // TODO

    // fse.write()
    
  }

  async writeFile(loc: FavaLocation_Fava, filePath: string, data: FileData, options?: WriteFileOptions): Promise<void> {
    const client = this.getClient(loc);

    const path = join(loc.root, filePath);
    return fse.writeFile(path, data, {
      encoding: options?.encoding,
      // flag: options.flag,
      // mode: options.mode,
      // signal: options.signal,
    });
  }

}
