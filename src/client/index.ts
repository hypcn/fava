import urlJoin from "url-join";
import { GetLocationsResult, GetStatsResult, PathExistsResult, ReadDirResult, UpdateResult } from "../shared";
import { FavaClientConfig } from "./client-config.interface";

export interface FileData {
  data: string | Uint8Array,
  mimeType: string
}

export class FavaClient {

  private origin: string = "http://localhost:6131";
  private routePrefix?: string;

  private _fetch: typeof fetch = window?.fetch;

  constructor(config: FavaClientConfig) {

    if (config.origin) {
      this.origin = config.origin;
    }

    if (config.routePrefix) {
      this.routePrefix = config.routePrefix;
    }

    if (config.fetch) {
      this._fetch = config.fetch;
    }
    if (!this._fetch) {
      throw new Error("No `fetch()` implementation provided!");
    }

  }

  async getLocations(): Promise<GetLocationsResult> {

    const route = urlJoin(this.routePrefix ?? "", `/api/locations`);
    const url = urlJoin(this.origin, route);

    const response = await this._fetch(url, {
      method: "GET",
    });
    const result = await response.json() as GetLocationsResult;

    return result;
  }

  async readDir(locationId: string, path: string): Promise<ReadDirResult> {

    const route = urlJoin(this.routePrefix ?? "", `/api/${locationId}/${path}?readDir`);
    const url = urlJoin(this.origin, route);

    const response = await this._fetch(url, {
      method: "GET",
    });
    const result = await response.json() as ReadDirResult;

    return result;
  }

  async getStats(locationId: string, path: string): Promise<GetStatsResult> {

    const route = urlJoin(this.routePrefix ?? "", `/api/${locationId}/${path}?stats`);
    const url = urlJoin(this.origin, route);

    const response = await this._fetch(url, {
      method: "GET",
    });
    const result = await response.json() as GetStatsResult;

    return result;
  }

  async pathExists(locationId: string, path: string): Promise<PathExistsResult> {
    
    const route = urlJoin(this.routePrefix ?? "", `/api/${locationId}/${path}?exists`);
    const url = urlJoin(this.origin, route);

    const response = await this._fetch(url, {
      method: "GET",
    });
    const result = await response.json() as PathExistsResult;

    return result;
  }

  async readFile(locationId: string, path: string, returnType?: "text" | "buffer"): Promise<string | ArrayBuffer> {

    const route = urlJoin(this.routePrefix ?? "", `/api/${locationId}/${path}`);
    const url = urlJoin(this.origin, route);

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
    const route = urlJoin(this.routePrefix ?? "", `/api/${toLocId}/${toPath}?moveFrom=${fromLocId}/${fromPath}${overwrite}`);
    const url = urlJoin(this.origin, route);

    const response = await this._fetch(url, {
      method: "PUT",
    });
    const result = await response.json() as UpdateResult;

    return result;
  }

  async copy(fromLocId: string, fromPath: string, toLocId: string, toPath: string, opts?: { overwrite?: boolean }): Promise<UpdateResult> {

    const overwrite = opts?.overwrite ? `&overwrite` : "";
    const route = urlJoin(this.routePrefix ?? "", `/api/${toLocId}/${toPath}?copyFrom=${fromLocId}/${fromPath}${overwrite}`);
    const url = urlJoin(this.origin, route);

    const response = await this._fetch(url, {
      method: "PUT",
    });
    const result = await response.json() as UpdateResult;

    return result;
  }
  
  async rename(locationId: string, fromPath: string, toPath: string): Promise<UpdateResult> {

    const route = urlJoin(this.routePrefix ?? "", `/api/${locationId}/${toPath}?renameFrom=${fromPath}`);
    const url = urlJoin(this.origin, route);

    const response = await this._fetch(url, {
      method: "PUT",
    });
    const result = await response.json() as UpdateResult;

    return result;
  }

  async ensureDir(locationId: string, path: string): Promise<UpdateResult> {

    const route = urlJoin(this.routePrefix ?? "", `/api/${locationId}/${path}?ensureDir`);
    const url = urlJoin(this.origin, route);

    const response = await this._fetch(url, {
      method: "PUT",
    });
    const result = await response.json() as UpdateResult;

    return result;
  }

  async ensureFile(locationId: string, path: string): Promise<UpdateResult> {

    const route = urlJoin(this.routePrefix ?? "", `/api/${locationId}/${path}?ensureFile`);
    const url = urlJoin(this.origin, route);

    const response = await this._fetch(url, {
      method: "PUT",
    });
    const result = await response.json() as UpdateResult;

    return result;
  }

  async writeFile(locationId: string, path: string, file: FileData): Promise<UpdateResult> {

    const route = urlJoin(this.routePrefix ?? "", `/api/${locationId}/${path}`);
    const url = urlJoin(this.origin, route);

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

    const route = urlJoin(this.routePrefix ?? "", `/api/${locationId}/${path}?append`);
    const url = urlJoin(this.origin, route);

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

    const route = urlJoin(this.routePrefix ?? "", `/api/${locationId}/${path}`);
    const url = urlJoin(this.origin, route);

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

    const route = urlJoin(this.routePrefix ?? "", `/api/${locationId}/${path}?emptyDir`);
    const url = urlJoin(this.origin, route);

    const response = await this._fetch(url, {
      method: "DELETE",
    });
    const result = await response.json() as UpdateResult;

    return result;
  }

  async remove(locationId: string, path: string): Promise<UpdateResult> {

    const route = urlJoin(this.routePrefix ?? "", `/api/${locationId}/${path}`);
    const url = urlJoin(this.origin, route);

    const response = await this._fetch(url, {
      method: "DELETE",
    });
    const result = await response.json() as UpdateResult;

    return result;
  }

}
