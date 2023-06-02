import urlJoin from "url-join";
import { ApiGetLocationsResult, ApiGetStatsResult, ApiPathExistsResult, ApiReadDirResult, ApiUpdateResult, ApiWriteChunkResult } from "../shared";
import { ClientReadChunkOptions, ClientReadChunkResult, ClientReadFileOptions, ClientWriteChunkOptions, ClientWriteChunkResult, ClientWriteFileOptions, FavaClientConfig } from "./client.interface";

// export interface ClientFileData {
//   data: string | Uint8Array,
//   mimeType: string,
// }

export type FileData = string | Uint8Array | Buffer;

const DEFAULT_ORIGIN = "http://localhost:6131";

export class FavaClient {

  private _fetch: typeof fetch; // = (globalThis as any)?.window?.fetch;
    // ? window.fetch.bind(window) as any
    // : fetch;
  
  private _apiPrefix: string;
  get apiPrefix() { return this._apiPrefix; }

  constructor(config: FavaClientConfig) {

    this._fetch = config.fetch;
    if (!this._fetch) throw new Error(`No \`fetch(…)\` implementation provided!
Browser config example:
  \`{ fetch: window.fetch.bind(window) }\`
Server config example:
  \`import fetch from "node-fetch";\`
  \`{ fetch: fetch as any }\`
`);

    const origin = config?.origin || DEFAULT_ORIGIN;
    const routePrefix = config?.routePrefix || "";

    this._apiPrefix = urlJoin(origin, routePrefix, "/api");

  }

  async getLocations(): Promise<ApiGetLocationsResult> {

    const url = urlJoin(this.apiPrefix, `/locations`);

    const response = await this._fetch(url, {
      method: "GET",
    });
    const result = await response.json() as ApiGetLocationsResult;

    return result;
  }

  async append(locationId: string, path: string, data: FileData, opts?: { mimeType?: string }): Promise<ApiUpdateResult> {

    const url = urlJoin(this.apiPrefix, `/${locationId}/${path}?append`);

    const headers: { [key: string]: string } = {};
    if (opts?.mimeType) headers["Content-Type"] = opts.mimeType;

    const response = await this._fetch(url, {
      method: "PATCH",
      headers,
      body: data,
    });
    const result = await response.json() as ApiUpdateResult;

    return result;
  }

  async copy(fromLocId: string, fromPath: string, toLocId: string, toPath: string, opts?: { overwrite?: boolean }): Promise<ApiUpdateResult> {

    const overwrite = opts?.overwrite ? `&overwrite` : "";
    const url = urlJoin(this.apiPrefix, `/${toLocId}/${toPath}?copyFrom=${fromLocId}/${fromPath}${overwrite}`);

    const response = await this._fetch(url, {
      method: "PUT",
    });
    const result = await response.json() as ApiUpdateResult;

    return result;
  }

  async emptyDir(locationId: string, path: string): Promise<ApiUpdateResult> {

    const url = urlJoin(this.apiPrefix, `/${locationId}/${path}?emptyDir`);

    const response = await this._fetch(url, {
      method: "DELETE",
    });
    const result = await response.json() as ApiUpdateResult;

    return result;
  }

  async ensureDir(locationId: string, path: string): Promise<ApiUpdateResult> {

    const url = urlJoin(this.apiPrefix, `/${locationId}/${path}?ensureDir`);

    const response = await this._fetch(url, {
      method: "PUT",
    });
    const result = await response.json() as ApiUpdateResult;

    return result;
  }

  async ensureFile(locationId: string, path: string): Promise<ApiUpdateResult> {

    const url = urlJoin(this.apiPrefix, `/${locationId}/${path}?ensureFile`);

    const response = await this._fetch(url, {
      method: "PUT",
    });
    const result = await response.json() as ApiUpdateResult;

    return result;
  }

  async exists(locationId: string, path: string): Promise<ApiPathExistsResult> {
    
    const url = urlJoin(this.apiPrefix, `/${locationId}/${path}?exists`);

    const response = await this._fetch(url, {
      method: "GET",
    });
    const result = await response.json() as ApiPathExistsResult;

    return result;
  }

  async move(fromLocId: string, fromPath: string, toLocId: string, toPath: string, opts?: { overwrite?: boolean }): Promise<ApiUpdateResult> {

    const overwrite = opts?.overwrite ? `&overwrite` : "";
    const url = urlJoin(this.apiPrefix, `/${toLocId}/${toPath}?moveFrom=${fromLocId}/${fromPath}${overwrite}`);

    const response = await this._fetch(url, {
      method: "PUT",
    });
    const result = await response.json() as ApiUpdateResult;

    return result;
  }

  async readDir(locationId: string, path: string): Promise<ApiReadDirResult> {

    const url = urlJoin(this.apiPrefix, `/${locationId}/${path}?readDir`);

    const response = await this._fetch(url, {
      method: "GET",
    });
    const result = await response.json() as ApiReadDirResult;

    return result;
  }

  async readFile(locationId: string, path: string, opts?: { returnAs: "text" }): Promise<string>
  async readFile(locationId: string, path: string, opts?: { returnAs: "binary" }): Promise<Uint8Array>
  async readFile(locationId: string, path: string, opts?: { returnAs: "text" | "binary" }): Promise<string | Uint8Array>
  async readFile(locationId: string, path: string, opts?: ClientReadFileOptions): Promise<string | Uint8Array> {

    const url = urlJoin(this.apiPrefix, `/${locationId}/${path}`);

    const response = await this._fetch(url, {
      method: "GET",
      headers: {
        "Accept": "*/*",
      }
    });

    if (opts?.returnAs === "binary") return new Uint8Array(await response.arrayBuffer());
    if (opts?.returnAs === "text") return response.text();

    const contentType = response.headers.get("Content-Type") ?? "";
    const lookslikeText = contentType.startsWith("text") || [
      "application/json",
    ].includes(contentType);

    if (lookslikeText) {
      return response.text();
    } else {
      return new Uint8Array(await response.arrayBuffer());
    }
  }

  async readFileChunk(locationId: string, path: string, opts?: ClientReadChunkOptions): Promise<ClientReadChunkResult> {

    const url = urlJoin(this.apiPrefix, `/${locationId}/${path}`);

    const headers: { [key: string]: string } = {};
    headers["Accept"] = "*/*";

    if (opts?.rangeStart !== undefined) {
      const rangeStart = opts.rangeStart.toString();
      const rangeEnd = (opts.rangeEnd !== undefined) ? opts.rangeEnd.toString() : "";
      headers["Range"] = `bytes=${rangeStart}-${rangeEnd}`;
    } else if (opts?.suffixLength !== undefined) {
      const suffixLength = opts.suffixLength.toString();
      headers["Range"] = `bytes=-${suffixLength}`;
    } else {
      headers["Range"] = `bytes=0-`;
    }

    const response = await this._fetch(url, {
      method: "GET",
      headers,
    });

    const contentType = response.headers.get("Content-Type") ?? undefined;
    const contentLengthRaw = Number(response.headers.get("Content-Length"));
    const contentLength = Number.isNaN(contentLengthRaw) ? undefined : contentLengthRaw;

    let fileSize: number | undefined = undefined;
    let rangeStart: number | undefined = undefined;
    let rangeEnd: number | undefined = undefined;

    const contentRange = response.headers.get("Content-Range") ?? undefined;
    if (contentRange) {
      const rangeStr = contentRange.replace("bytes ", "");
      const [startEnd, size] = rangeStr.split("/").map(r => r.trim());
      if (size && size !== "*" && (!Number.isNaN(Number(size)))) {
        fileSize = Number(size);
      }
      if (startEnd.includes("-")) {
        const [start, end] = startEnd.split("-");
        if (!Number.isNaN(Number(start))) rangeStart = Number(start);
        if (!Number.isNaN(Number(end))) rangeEnd = Number(end);
      }
    }

    const data = opts?.returnAs === "text" ? (await response.text()) :
      opts?.returnAs === "binary" ? new Uint8Array(await response.arrayBuffer()) :
        (contentType?.startsWith("text") || contentType === "application/json") ? (await response.text()) :
        new Uint8Array(await response.arrayBuffer());

    return {
      data: data,
      bytesRead: contentLength,
      chunkStart: rangeStart,
      chunkEnd: rangeEnd,
      fileSize,
      mimeType: contentType,
    };
  }

  async remove(locationId: string, path: string): Promise<ApiUpdateResult> {

    const url = urlJoin(this.apiPrefix, `/${locationId}/${path}`);

    const response = await this._fetch(url, {
      method: "DELETE",
    });
    const result = await response.json() as ApiUpdateResult;

    return result;
  }
  
  async rename(locationId: string, fromPath: string, toPath: string): Promise<ApiUpdateResult> {

    const url = urlJoin(this.apiPrefix, `/${locationId}/${toPath}?renameFrom=${fromPath}`);

    const response = await this._fetch(url, {
      method: "PUT",
    });
    const result = await response.json() as ApiUpdateResult;

    return result;
  }

  async stats(locationId: string, path: string): Promise<ApiGetStatsResult> {

    const url = urlJoin(this.apiPrefix, `/${locationId}/${path}?stats`);

    const response = await this._fetch(url, {
      method: "GET",
    });
    const result = await response.json() as ApiGetStatsResult;

    return result;
  }

  async writeFile(locationId: string, path: string, data: FileData, opts?: ClientWriteFileOptions): Promise<ApiUpdateResult> {

    const url = urlJoin(this.apiPrefix, `/${locationId}/${path}`);

    const headers: { [key: string]: string } = {};
    if (opts?.mimeType) headers["Content-Type"] = opts.mimeType;

    const response = await this._fetch(url, {
      method: "PUT",
      headers,
      body: data,
    });
    const result = await response.json() as ApiUpdateResult;

    return result;
  }

  async writeFileChunk(locationId: string, path: string, data: FileData, opts?: ClientWriteChunkOptions): Promise<ClientWriteChunkResult> {

    const url = urlJoin(this.apiPrefix, `/${locationId}/${path}`);

    const headers: { [key: string]: string } = {};
    if (opts?.mimeType) headers["Content-Type"] = opts.mimeType;

    if (opts?.rangeStart !== undefined) {
      const rangeStart = opts.rangeStart.toString();
      const rangeEnd = (opts.rangeEnd !== undefined) ? opts.rangeEnd.toString() : "";
      headers["Range"] = `bytes=${rangeStart}-${rangeEnd}`;
    } else if (opts?.suffixLength !== undefined) {
      const suffixLength = opts.suffixLength.toString();
      headers["Range"] = `bytes=-${suffixLength}`;
    } else {
      headers["Range"] = `bytes=0-`;
    }

    const response = await this._fetch(url, {
      method: "PATCH",
      headers,
      body: data,
    });
    const result = await response.json() as ApiWriteChunkResult;

    return {
      bytesWritten: result.bytesWritten,
    };
  }

}
