import urlJoin from "url-join";
import { GetLocationsResult, GetStatsResult, PathExistsResult, ReadDirResult, UpdateResult } from "../shared";
import { FavaClientOptions } from "./client-options.interface";
import fetch from "node-fetch";

// export interface ClientFileData {
//   data: string | Uint8Array,
//   mimeType: string,
// }

export type FileData = string | Uint8Array | Buffer;

const DEFAULT_ORIGIN = "http://localhost:6131";

export class FavaClient {

  private _fetch: typeof fetch = (globalThis as any)?.window?.fetch
    ? window.fetch.bind(window) as any
    : fetch;
  
  private _apiPrefix: string;
  get apiPrefix() { return this._apiPrefix; }

  constructor(options?: FavaClientOptions) {

    // if (config.fetch) this._fetch = config.fetch;
    if (!this._fetch) throw new Error("No `fetch(…)` implementation provided!");
    // if (window) this._fetch.bind(window);

    const origin = options?.origin || DEFAULT_ORIGIN;
    const routePrefix = options?.routePrefix || "";

    this._apiPrefix = urlJoin(origin, routePrefix, "/api");

  }

  async getLocations(): Promise<GetLocationsResult> {

    const url = urlJoin(this.apiPrefix, `/locations`);

    const response = await this._fetch(url, {
      method: "GET",
    });
    const result = await response.json() as GetLocationsResult;

    return result;
  }

  async append(locationId: string, path: string, data: FileData, opts?: { mimeType?: string }): Promise<UpdateResult> {

    const url = urlJoin(this.apiPrefix, `/${locationId}/${path}?append`);

    const headers: { [key: string]: string } = {};
    if (opts?.mimeType) headers["Content-Type"] = opts.mimeType;

    const response = await this._fetch(url, {
      method: "PATCH",
      headers,
      body: data,
    });
    const result = await response.json() as UpdateResult;

    return result;
  }

  async copy(fromLocId: string, fromPath: string, toLocId: string, toPath: string, opts?: { overwrite?: boolean }): Promise<UpdateResult> {

    const overwrite = opts?.overwrite ? `&overwrite` : "";
    const url = urlJoin(this.apiPrefix, `/${toLocId}/${toPath}?copyFrom=${fromLocId}/${fromPath}${overwrite}`);

    const response = await this._fetch(url, {
      method: "PUT",
    });
    const result = await response.json() as UpdateResult;

    return result;
  }

  async emptyDir(locationId: string, path: string): Promise<UpdateResult> {

    const url = urlJoin(this.apiPrefix, `/${locationId}/${path}?emptyDir`);

    const response = await this._fetch(url, {
      method: "DELETE",
    });
    const result = await response.json() as UpdateResult;

    return result;
  }

  async ensureDir(locationId: string, path: string): Promise<UpdateResult> {

    const url = urlJoin(this.apiPrefix, `/${locationId}/${path}?ensureDir`);

    const response = await this._fetch(url, {
      method: "PUT",
    });
    const result = await response.json() as UpdateResult;

    return result;
  }

  async ensureFile(locationId: string, path: string): Promise<UpdateResult> {

    const url = urlJoin(this.apiPrefix, `/${locationId}/${path}?ensureFile`);

    const response = await this._fetch(url, {
      method: "PUT",
    });
    const result = await response.json() as UpdateResult;

    return result;
  }

  async exists(locationId: string, path: string): Promise<PathExistsResult> {
    
    const url = urlJoin(this.apiPrefix, `/${locationId}/${path}?exists`);

    const response = await this._fetch(url, {
      method: "GET",
    });
    const result = await response.json() as PathExistsResult;

    return result;
  }

  async move(fromLocId: string, fromPath: string, toLocId: string, toPath: string, opts?: { overwrite?: boolean }): Promise<UpdateResult> {

    const overwrite = opts?.overwrite ? `&overwrite` : "";
    const url = urlJoin(this.apiPrefix, `/${toLocId}/${toPath}?moveFrom=${fromLocId}/${fromPath}${overwrite}`);

    const response = await this._fetch(url, {
      method: "PUT",
    });
    const result = await response.json() as UpdateResult;

    return result;
  }

  async readDir(locationId: string, path: string): Promise<ReadDirResult> {

    const url = urlJoin(this.apiPrefix, `/${locationId}/${path}?readDir`);

    const response = await this._fetch(url, {
      method: "GET",
    });
    const result = await response.json() as ReadDirResult;

    return result;
  }

  async readFile(locationId: string, path: string, returnType?: "text" | "buffer"): Promise<string | ArrayBuffer> {

    const url = urlJoin(this.apiPrefix, `/${locationId}/${path}`);

    const response = await this._fetch(url, {
      method: "GET",
    });

    if (returnType === "buffer") return response.arrayBuffer();
    if (returnType === "text") return response.text();

    const contentType = response.headers.get("Content-Type") ?? "";
    const lookslikeText = contentType.startsWith("text") || [
      "application/json",
    ].includes(contentType);

    if (lookslikeText) {
      return response.text();
    } else {
      return response.arrayBuffer();
    }
  }

  async readFileChunk(locationId: string, path: string, opts?: { range?: any, mimeType?: string }): Promise<string | Uint8Array> {
    // read       - GET     locId/path            "Range" header

    throw new Error("Not implemented");

  }

  async remove(locationId: string, path: string): Promise<UpdateResult> {

    const url = urlJoin(this.apiPrefix, `/${locationId}/${path}`);

    const response = await this._fetch(url, {
      method: "DELETE",
    });
    const result = await response.json() as UpdateResult;

    return result;
  }
  
  async rename(locationId: string, fromPath: string, toPath: string): Promise<UpdateResult> {

    const url = urlJoin(this.apiPrefix, `/${locationId}/${toPath}?renameFrom=${fromPath}`);

    const response = await this._fetch(url, {
      method: "PUT",
    });
    const result = await response.json() as UpdateResult;

    return result;
  }

  async stats(locationId: string, path: string): Promise<GetStatsResult> {

    const url = urlJoin(this.apiPrefix, `/${locationId}/${path}?stats`);

    const response = await this._fetch(url, {
      method: "GET",
    });
    const result = await response.json() as GetStatsResult;

    return result;
  }

  async writeFile(locationId: string, path: string, data: FileData, opts?: { mimeType?: string }): Promise<UpdateResult> {

    const url = urlJoin(this.apiPrefix, `/${locationId}/${path}`);

    const headers: { [key: string]: string } = {};
    if (opts?.mimeType) headers["Content-Type"] = opts.mimeType;

    const response = await this._fetch(url, {
      method: "PUT",
      headers,
      body: data,
    });
    const result = await response.json() as UpdateResult;

    return result;
  }

  async writeFileChunk(locationId: string, path: string, data: FileData, opts?: { range?: any, mimeType?: string }): Promise<UpdateResult> {

    const url = urlJoin(this.apiPrefix, `/${locationId}/${path}`);

    const headers: { [key: string]: string } = {};
    if (opts?.mimeType) headers["Content-Type"] = opts.mimeType;
    // if (opts?.range) headers["Range"] = something;

    const response = await this._fetch(url, {
      method: "PATCH",
      headers,
      body: data,
    });
    const result = await response.json() as UpdateResult;

    return result;
  }

}
