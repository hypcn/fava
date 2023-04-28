import urlJoin from "url-join";
import { GetLocationsResult, GetStatsResult, PathExistsResult, ReadDirResult, UpdateResult } from "../shared";
import { FavaClientConfig } from "./client-config.interface";

export interface FileData {
  data: string | Uint8Array,
  mimeType: string
}

const DEFAULT_ORIGIN = "http://localhost:6131";

export class FavaClient {

  private _fetch: typeof fetch = window?.fetch?.bind(window);
  
  private apiPrefix: string;

  constructor(config: FavaClientConfig) {

    if (config.fetch) this._fetch = config.fetch;
    if (!this._fetch) throw new Error("No `fetch()` implementation provided!");
    // if (window) this._fetch.bind(window);

    const origin = config.origin || DEFAULT_ORIGIN;
    const routePrefix = config.routePrefix || "";

    this.apiPrefix = urlJoin(origin, routePrefix, "/api");

  }

  async getLocations(): Promise<GetLocationsResult> {

    const url = urlJoin(this.apiPrefix, `/locations`);

    const response = await this._fetch(url, {
      method: "GET",
    });
    const result = await response.json() as GetLocationsResult;

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

  async getStats(locationId: string, path: string): Promise<GetStatsResult> {

    const url = urlJoin(this.apiPrefix, `/${locationId}/${path}?stats`);

    const response = await this._fetch(url, {
      method: "GET",
    });
    const result = await response.json() as GetStatsResult;

    return result;
  }

  async pathExists(locationId: string, path: string): Promise<PathExistsResult> {
    
    const url = urlJoin(this.apiPrefix, `/${locationId}/${path}?exists`);

    const response = await this._fetch(url, {
      method: "GET",
    });
    const result = await response.json() as PathExistsResult;

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

  async readFilePart(locationId: string, path: string, range: any): Promise<string | Uint8Array> {
    // read       - GET     locId/path            "Range" header

    throw new Error("Not implemented");

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

  async copy(fromLocId: string, fromPath: string, toLocId: string, toPath: string, opts?: { overwrite?: boolean }): Promise<UpdateResult> {

    const overwrite = opts?.overwrite ? `&overwrite` : "";
    const url = urlJoin(this.apiPrefix, `/${toLocId}/${toPath}?copyFrom=${fromLocId}/${fromPath}${overwrite}`);

    const response = await this._fetch(url, {
      method: "PUT",
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

  async writeFile(locationId: string, path: string, file: FileData): Promise<UpdateResult> {

    const url = urlJoin(this.apiPrefix, `/${locationId}/${path}`);

    const response = await this._fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": file.mimeType,
      },
      body: file.data,
    });
    const result = await response.json() as UpdateResult;

    return result;
  }

  async append(locationId: string, path: string, file: FileData): Promise<UpdateResult> {

    const url = urlJoin(this.apiPrefix, `/${locationId}/${path}?append`);

    const response = await this._fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": file.mimeType,
      },
      body: file.data,
    });
    const result = await response.json() as UpdateResult;

    return result;
  }

  async write(locationId: string, path: string, file: FileData, range: any): Promise<UpdateResult> {

    const url = urlJoin(this.apiPrefix, `/${locationId}/${path}`);

    const response = await this._fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": file.mimeType,
        // "Range": something,
      },
      body: file.data,
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

  async remove(locationId: string, path: string): Promise<UpdateResult> {

    const url = urlJoin(this.apiPrefix, `/${locationId}/${path}`);

    const response = await this._fetch(url, {
      method: "DELETE",
    });
    const result = await response.json() as UpdateResult;

    return result;
  }

}
