import { CopyOptions, FileData, IFavaAdapter, MoveOptions, ReadBytesOptions, ReadFileOptions, ReadFileResult, WriteBytesOptions, WriteBytesResult, WriteFileOptions } from "./adapter.interface";
// import * as fse from "fs-extra";
import { Logger } from "@hypericon/axe";
import fetch from "node-fetch";
import { FavaClient } from "../../client";
import { DirInfo, FavaLocation_Fava } from "../../shared";

export class FavaAdapter implements IFavaAdapter<FavaLocation_Fava> {

  private logger = new Logger("Fava Adapter");

  /** Map of location IDs to client library instances */
  private locationClients = new Map<string, FavaClient>();

  constructor() {}

  getType(): "Fava" {
    return "Fava";
  }

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
    throw new Error(`Not implemented`);
    // const client = this.getClient(loc);
    // const result = await client.append(loc.remoteId, filePath, data);
    // return;
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
    throw new Error(`Not implemented`);
    // const client = this.getClient(loc);
    // const result = await client.writeFile(loc.remoteId, filePath, data); // options?
    // return;
  }

  async pathExists(loc: FavaLocation_Fava, path: string): Promise<boolean> {
    const client = this.getClient(loc);
    const result = await client.pathExists(loc.remoteId, path);
    return result.exists;
  }

  async read(loc: FavaLocation_Fava, filePath: string, options?: ReadBytesOptions): Promise<ReadFileResult> {
    throw new Error(`Not implemented`);
    // const client = this.getClient(loc);
    // // TODO
    // const result = await client.readFilePart(loc.remoteId, filePath, options);
    // return result;
  }

  async readFile(loc: FavaLocation_Fava, filePath: string, options?: ReadFileOptions): Promise<ReadFileResult> {
    throw new Error(`Not implemented`);
    // const client = this.getClient(loc);
    // const result = await client.readFile(loc.remoteId, filePath, { });
    // return result;
  }

  async remove(loc: FavaLocation_Fava, path: string): Promise<void> {
    const client = this.getClient(loc);
    const result = await client.remove(loc.remoteId, path);
    return;
  }

  async rename(loc: FavaLocation_Fava, oldPath: string, newPath: string): Promise<void> {
    const client = this.getClient(loc);
    const result = await client.rename(loc.remoteId, oldPath, newPath);
    return;
  }

  async stat(loc: FavaLocation_Fava, path: string) {
    const client = this.getClient(loc);
    const result = await client.getStats(loc.remoteId, path);
    return result.fileInfo;
  }

  async write(loc: FavaLocation_Fava, filePath: string, data: FileData, options?: WriteBytesOptions): Promise<WriteBytesResult> {
    throw new Error(`Not implemented`);
    // const client = this.getClient(loc);
    // // TODO
    // const result = await client.write(loc.remoteId, filePath, data, options);
    // return result;
  }

  async writeFile(loc: FavaLocation_Fava, filePath: string, data: FileData, options?: WriteFileOptions): Promise<void> {
    throw new Error(`Not implemented`);
    // const client = this.getClient(loc);
    // const result = await client.writeFile(loc.remoteId, filePath, data); // options?
    // return;
  }

}
