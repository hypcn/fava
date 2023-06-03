import { SimpleLogger } from "@hypericon/axe";
import { Express, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { ApiGetLocationsResult, ApiGetStatsResult, ApiPathExistsResult, ApiReadDirResult, ApiUpdateResult, ApiWriteChunkResult } from "../shared";
import { FavaCore } from "./core";

// ----- Location operations:

// GET locations

// ----- File operations:

// readFile   - GET     locId/path
// readChunk  - GET     locId/path            "Range" header
// ls         - GET     locId/path?readDir
// dir        - GET     locId/path?readDir
// readDir    - GET     locId/path?readDir
// pathExists - GET     locId/path?exists
// stat       - GET     locId/path?stats

// copy       - PUT     locId/path?copyFrom=locId/path
// ensureFile - PUT     locId/path?ensureFile
// ensureDir  - PUT     locId/path?ensureDir
// move       - PUT     locId/path?moveFrom=locId/path
// rename     - PUT     locId/path?renameFrom=path
// writeFile  - PUT     locId/path                        file in the body

// append     - PATCH   locId/path?append       data in body
// writeChunk - PATCH   locId/path              data in body; range in "Range" header

// emptyDir   - DELETE  locId/path?emptyDir
// remove     - DELETE  locId/path

export class HttpApi {

  core: FavaCore;
  logger: SimpleLogger;
  routePrefix: string;

  constructor(settings: {
    core: FavaCore,
    routePrefix: string,
    logger: SimpleLogger,
  }) {
    this.core = settings.core;
    this.routePrefix = settings.routePrefix;
    this.logger = settings.logger;
  }

  addApiToApp(app: Express) {

    const locationsRoute = this.routePrefix + "/locations";

    app.get(locationsRoute, asyncHandler(async (req, res, next) => {
      this.logger.debug(`GET locations`);
      const response: ApiGetLocationsResult = {
        locations: this.core.locations,
      };
      res.json(response);
    }));

    const apiRoute = this.routePrefix + "/:locationId/*";

    app.get(apiRoute, asyncHandler(async (req, res, next) => {

      const locationId = req.params.locationId ?? "";
      const path = req.params["0"] || "/";

      if (hasQuery(req, "readDir")) {
        this.logger.debug(`GET: readDir:`, locationId, path);
        const dirInfo = await this.core.readDir(locationId, path);
        const result: ApiReadDirResult = { dirInfo };
        res.json(result);
      }

      else if (hasQuery(req, "stats")) {
        this.logger.debug(`GET: stats:`, locationId, path);
        const fileInfo = await this.core.stat(locationId, path);
        const result: ApiGetStatsResult = { fileInfo };
        res.json(result);
      }

      else if (hasQuery(req, "exists")) {
        this.logger.debug(`GET: exists:`, locationId, path);
        const exists = await this.core.exists(locationId, path);
        const result: ApiPathExistsResult = { exists };
        res.json(result);
      }

      else if (hasHeader(req, "range")) {
        const parsedRange = parseRange(req.headers.range);
        if (parsedRange === undefined) {
          res.status(501).send("Only a single range of bytes is supported.");
        } else {
          this.logger.debug(`GET: readFileChunk:`, locationId, path, `range: ${parsedRange.start} -> ${parsedRange.end ?? ""}`);
          await this.readFileChunk(locationId, path, parsedRange, res);
        }
      }

      else {
        this.logger.debug(`GET: readFile:`, locationId, path);
        const file = await this.core.readFile(locationId, path);

        if (file.lastModified) res.setHeader("Last-Modified", new Date(file.lastModified).toUTCString());
        if (file.fileSize) res.setHeader("Content-Length", file.fileSize);
        if (file.mimeType) res.type(file.mimeType);

        res.send(file.data);
      }

    }));

    app.put(apiRoute, asyncHandler(async (req, res, next) => {

      const locationId = req.params.locationId ?? "";
      const path = req.params["0"] || "/";
      const body = req.body;

      const isOverwrite = hasQuery(req, "overwrite");

      if (hasQuery(req, "moveFrom")) {
        const from = locIdAndPathFromQuery(req, "moveFrom");
        this.logger.debug(`PUT: move:`, from.locId, from.path, "->", locationId, path, "overwrite?", isOverwrite);
        await this.core.move(from.locId, from.path, locationId, path, { overwrite: isOverwrite });
        const result: ApiUpdateResult = { update: "move", done: true };
        res.json(result);
      }

      else if (hasQuery(req, "copyFrom")) {
        const from = locIdAndPathFromQuery(req, "copyFrom");
        this.logger.debug(`PUT: copy:`, from.locId, from.path, "->", locationId, path, "overwrite?", isOverwrite);
        await this.core.copy(from.locId, from.path, locationId, path, { overwrite: isOverwrite });
        const result: ApiUpdateResult = { update: "copy", done: true };
        res.json(result);
      }

      else if (hasQuery(req, "renameFrom")) {
        const from = req.query.renameFrom;
        if (!from || typeof from !== "string") {
          throw new Error(`Rename source must be a path`);
        }
        this.logger.debug(`PUT: rename:`, locationId, from, "->", locationId, path);
        await this.core.rename(locationId, from, path);
        const result: ApiUpdateResult = { update: "rename", done: true };
        res.json(result);
      }

      else if (hasQuery(req, "ensureDir")) {
        this.logger.debug(`PUT: ensureDir:`, locationId, path);
        await this.core.ensureDir(locationId, path);
        const result: ApiUpdateResult = { update: "ensureDir", done: true };
        res.json(result);
      }

      else if (hasQuery(req, "ensureFile")) {
        this.logger.debug(`PUT: ensureFile:`, locationId, path);
        await this.core.ensureFile(locationId, path);
        const result: ApiUpdateResult = { update: "ensureFile", done: true };
        res.json(result);
      }

      else {
        this.logger.debug(`PUT: writeFile:`, locationId, path);
        this.logger.debug(`PUT: writeFile body:`, body);
        await this.core.writeFile(locationId, path, body, {});
        const result: ApiUpdateResult = { update: "writeFile", done: true };
        res.json(result);
      }

    }));

    app.patch(apiRoute, asyncHandler(async (req, res, next) => {

      const locationId = req.params.locationId ?? "";
      const path = req.params["0"] || "/";
      const body = req.body;

      if (hasQuery(req, "append")) {
        this.logger.debug(`PATCH: append:`, locationId, path);
        await this.core.append(locationId, path, body, {});
        const result: ApiUpdateResult = { update: "append", done: true };
        res.json(result);
      }

      else {
        const parsedRange = parseRange(req.headers.range);
        if (parsedRange === undefined) {
          res.status(400).send("A single range of bytes must be specified to patch a file.");
        } else {
          this.logger.debug(`PATCH: writeFileChunk:`, locationId, path, `range: ${parsedRange.start} -> ${parsedRange.end ?? ""}`);
          return this.writeFileChunk(locationId, path, body, parsedRange, res)
        }
      }

    }));

    app.delete(apiRoute, asyncHandler(async (req, res, next) => {

      const locationId = req.params.locationId ?? "";
      const path = req.params["0"] || "/";

      if (hasQuery(req, "emptyDir")) {
        this.logger.debug(`DELETE: emptyDir:`, locationId, path);
        await this.core.emptyDir(locationId, path);
        const result: ApiUpdateResult = { update: "emptyDir", done: true };
        res.json(result);
      }

      else {
        this.logger.debug(`DELETE: remove:`, locationId, path);
        await this.core.remove(locationId, path);
        const result: ApiUpdateResult = { update: "remove", done: true };
        res.json(result);
      }

    }));

  }

  async readFileChunk(locationId: string, path: string, parsedRange: ParsedRange, res: Response) {

    const { position, length } = parsedRangeToPositionLength(parsedRange);
    const chunk = await this.core.readFileChunk(locationId, path, {
      position,
      length,
    });

    const isComplete = (chunk.fileSize && chunk.fileSize === chunk.bytesRead);
    if (isComplete) {
      res.status(200); // OK
      res.setHeader("Content-Range", `bytes */${chunk.fileSize ?? "*"}`);
    } else {
      res.status(206); // Partial Content
      const fileSize = chunk.fileSize ?? "*";
      const rangeStr = (chunk.chunkStart === undefined || chunk.chunkEnd === undefined)
        ? "*"
        : `${chunk.chunkStart}-${chunk.chunkEnd}`;
      res.setHeader("Content-Range", `bytes ${rangeStr}/${fileSize}`);
    }
    if (chunk.bytesRead !== undefined) {
      res.setHeader("Content-Length", chunk.bytesRead.toString());
    }

    if (chunk.mimeType) res.type(chunk.mimeType);
    res.send(chunk.data);

  }

  async writeFileChunk(locationId: string, path: string, data: any, parsedRange: ParsedRange, res: Response) {

    const { position, length } = parsedRangeToPositionLength(parsedRange);
    const chunk = await this.core.writeFileChunk(locationId, path, data, {
      // encoding,
      position,
      length,
    });

    // set headers and that

    const result: ApiWriteChunkResult = {
      bytesWritten: chunk.bytesWritten
    };
    res.json(result);
    
  }

}

/**
 * Find whether the given query parameter is present at all
 * @param req 
 * @param query 
 * @returns 
 */
function hasQuery(req: Request, query: string): boolean {
  return Boolean(req.query[query] !== undefined);
}

function hasHeader(req: Request, header: string): boolean {
  return Boolean(req.headers[header] !== undefined);
}

function locIdAndPathFromQuery(req: Request, queryName: string) {

  const queryValue = req.query[queryName];
  if (!queryValue || typeof queryValue !== "string") {
    throw new Error(`Query parameter missing or malformed: ${queryName}`);
  }

  const [locId, path] = queryValue.split("/");
  return {
    locId: locId,
    path: path ?? "",
  };

}

type ParsedRange = {
  units: string,
  start: number,
  end: number | undefined,
};

/**
 * Parse the given "range" header value to a single range,
 * or `undefined` if invalid value or multiple ranges are defined
 * @param rangeHeader 
 * @returns 
 */
function parseRange(rangeHeader: string | undefined): ParsedRange | undefined {
  if (!rangeHeader) return undefined;

  const [units, rangesStr] = rangeHeader.split("=");
  if (!units || !rangesStr) return undefined;

  const rangeStrs = rangesStr.split(",").map(r => r.trim()).filter(r => Boolean(r));
  if (rangeStrs.length !== 1) return undefined;

  const rangeStr = rangeStrs[0];
  const [startStr, endStr] = rangeStr.split("-").map(r => r.trim());

  let start = startStr === "" ? undefined : parseInt(startStr);
  let end = endStr === "" ? undefined : parseInt(endStr);
  if (Number.isNaN(start)) start = undefined;
  if (Number.isNaN(end)) end = undefined;
  if (start === undefined) return undefined;

  const range: ParsedRange = {
    units,
    start,
    end,
  };
  return range;
}

function parsedRangeToPositionLength(parsedRange: ParsedRange) {
  const position = parsedRange.start;
  const length = (parsedRange.start !== undefined && parsedRange.end !== undefined)
    ? parsedRange.end - parsedRange.start + 1
    : undefined;
  return { position, length };
}
