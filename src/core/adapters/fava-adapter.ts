import { CopyOptions, FileData, IFavaAdapter, MoveOptions, ReadChunkOptions, ReadChunkResult, ReadFileOptions, ReadFileResult, WriteChunkOptions, WriteChunkResult, WriteFileOptions } from "./adapter.interface";
import { Logger } from "@hypericon/axe";
import { FavaClient } from "../../client";
import { DirInfo, FavaLocation_Fava } from "../../shared";
import { toStringOrUint8Array } from "../utils";
import fetch from "node-fetch";

export class FavaAdapter implements IFavaAdapter<FavaLocation_Fava> {

  private logger = new Logger("Fava Adapter");

  /** Map of location IDs to client library instances */
  private locationClients = new Map<string, FavaClient>();

  constructor(options?: {
    logger?: Logger,
  }) {
    if (options?.logger) this.logger = options.logger;
  }

  getType(): "Fava" {
    return "Fava";
  }

  /**
   * Find the client instance connected to the given location, and create it if it doesn't exist
   * @param location 
   * @returns 
   */
  getClient(location: FavaLocation_Fava): FavaClient {
    let existing = this.locationClients.get(location.id);
    if (existing) return existing;

    this.logger.debug(`Creating new client for Fava location with ID: ${location.id} (${location.origin})`);
    const client = new FavaClient({
      fetch: fetch as any,
      origin: location.origin,
      routePrefix: location.routePrefix,
    });
    this.locationClients.set(location.id, client);
    return client;
  }

  async append(loc: FavaLocation_Fava, filePath: string, data: FileData, options?: WriteFileOptions): Promise<void> {
    this.logger.debug(`append:`, loc.id, filePath, data, options);
    const client = this.getClient(loc);
    const result = await client.append(loc.remoteId, filePath, data);
    return;
  }

  async copy(srcLoc: FavaLocation_Fava, srcPath: string, destLoc: FavaLocation_Fava, destPath: string, options?: CopyOptions): Promise<void> {
    this.logger.debug(`copy:`, srcLoc.id, srcPath, destLoc.id, destPath, options);
    const client = this.getClient(srcLoc);
    const result = await client.copy(srcLoc.remoteId, srcPath, destLoc.remoteId, destPath, options);
    return;
  }

  async emptyDir(loc: FavaLocation_Fava, dirPath: string): Promise<void> {
    this.logger.debug(`emptyDir:`, loc.id, dirPath);
    const client = this.getClient(loc);
    const result = await client.emptyDir(loc.remoteId, dirPath);
    return;
  }

  async ensureFile(loc: FavaLocation_Fava, filePath: string): Promise<void> {
    this.logger.debug(`ensureFile:`, loc.id, filePath);
    const client = this.getClient(loc);
    const result = await client.ensureFile(loc.remoteId, filePath);
    return;
  }

  async ensureDir(loc: FavaLocation_Fava, dirPath: string): Promise<void> {
    this.logger.debug(`ensureDir:`, loc.id, dirPath);
    const client = this.getClient(loc);
    const result = await client.ensureDir(loc.remoteId, dirPath);
    return;
  }

  async exists(loc: FavaLocation_Fava, path: string): Promise<boolean> {
    this.logger.debug(`exists:`, loc.id, path);
    const client = this.getClient(loc);
    const result = await client.exists(loc.remoteId, path);
    return result.exists;
  }

  async move(srcLoc: FavaLocation_Fava, srcPath: string, destLoc: FavaLocation_Fava, destPath: string, options?: MoveOptions): Promise<void> {
    this.logger.debug(`move:`, srcLoc.id, srcPath, destLoc.id, destPath, options);
    const client = this.getClient(srcLoc);
    const result = await client.move(srcLoc.remoteId, srcPath, destLoc.remoteId, destPath, options);
    return;
  }

  async readDir(loc: FavaLocation_Fava, dirPath: string): Promise<DirInfo> {
    this.logger.debug(`readDir:`, loc.id, dirPath);
    const client = this.getClient(loc);
    const result = await client.readDir(loc.remoteId, dirPath);
    return result.dirInfo;
  }

  async readFile(loc: FavaLocation_Fava, filePath: string, options?: ReadFileOptions): Promise<ReadFileResult> {
    this.logger.debug(`readFile:`, loc.id, filePath, options);
    const client = this.getClient(loc);

    const result = await client.readFile(loc.remoteId, filePath, {
      returnAs: options?.encoding !== undefined ? "text" : "binary",
    });

    // let result: string | Uint8Array;
    // if (options?.encoding !== undefined) {
    //   result = await client.readFile(loc.remoteId, filePath, { returnAs: "text" });
    // } else {
    //   result = await client.readFile(loc.remoteId, filePath, { returnAs: "binary" });
    // }

    return {
      data: result.data,
      fileSize: result.fileSize,
      lastModified: result.lastModified,
      mimeType: result.mimeType,
    };
  }

  async readFileChunk(loc: FavaLocation_Fava, filePath: string, options?: ReadChunkOptions): Promise<ReadChunkResult> {
    this.logger.debug(`readFileChunk:`, loc.id, filePath, options);
    const client = this.getClient(loc);

    const rangeStart = options?.position;
    const rangeEnd = (options?.position !== undefined && options?.length !== undefined)
      ? options.position + options.length - 1
      : undefined;

    const result = await client.readFileChunk(loc.remoteId, filePath, {
      rangeStart,
      rangeEnd,
      returnAs: options?.encoding === undefined ? "binary" : "text",
    });

    return {
      data: result.data,
      bytesRead: result.bytesRead,
      chunkStart: result.chunkStart,
      chunkEnd: result.chunkEnd,
      fileSize: result.fileSize,
      mimeType: result.mimeType,
    };
  }

  async remove(loc: FavaLocation_Fava, path: string): Promise<void> {
    this.logger.debug(`remove:`, loc.id, path);
    const client = this.getClient(loc);
    const result = await client.remove(loc.remoteId, path);
    return;
  }

  async rename(loc: FavaLocation_Fava, oldPath: string, newPath: string): Promise<void> {
    this.logger.debug(`rename:`, loc.id, oldPath, newPath);
    const client = this.getClient(loc);
    const result = await client.rename(loc.remoteId, oldPath, newPath);
    return;
  }

  async stat(loc: FavaLocation_Fava, path: string) {
    this.logger.debug(`stat:`, loc.id, path);
    const client = this.getClient(loc);
    const result = await client.stats(loc.remoteId, path);
    return result.fileInfo;
  }

  async writeFile(loc: FavaLocation_Fava, filePath: string, data: FileData, options?: WriteFileOptions): Promise<void> {
    this.logger.debug(`writeFile:`, loc.id, filePath, data, options);
    const client = this.getClient(loc);
    const result = await client.writeFile(loc.remoteId, filePath, data, {
      // mimeType: options.
    }); // options?
    return;
  }

  async writeFileChunk(loc: FavaLocation_Fava, filePath: string, data: FileData, options?: WriteChunkOptions): Promise<WriteChunkResult> {
    this.logger.debug(`writeFileChunk:`, loc.id, filePath, data, options);
    const client = this.getClient(loc);

    const rangeStart = options?.position;
    const rangeEnd = (options?.position !== undefined && options?.length !== undefined)
      ? options.position + options.length - 1
      : undefined;

    const result = await client.writeFileChunk(loc.remoteId, filePath, data, {
      // mimeType: options.,
      // mimeType: options.,
      rangeStart,
      rangeEnd,
      // suffixLength,
    });

    return {
      bytesWritten: result.bytesWritten,
    };
  }

}
