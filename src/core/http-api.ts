import { Logger, SimpleLogger } from "@hypericon/axe";
import { Express, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { GetLocationsResult, GetStatsResult, PathExistsResult, ReadDirResult, UpdateResult } from "../shared";
import { FavaCore } from "./core";

// GET locations

// The defined operations:

// readFile   - GET     locId/path
// read       - GET     locId/path            "Range" header
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
// write      - PATCH   locId/path              data in body; range in "Range" header

// emptyDir   - DELETE  locId/path?emptyDir
// remove     - DELETE  locId/path

function putFlags(req: Request) {
  return {
    moveFrom: Boolean(req.query.moveFrom !== undefined),
    copyFrom: Boolean(req.query.copyFrom !== undefined),
    renameFrom: Boolean(req.query.renameFrom !== undefined),
    ensureDir: Boolean(req.query.ensureDir !== undefined),
    ensureFile: Boolean(req.query.ensureFile !== undefined),

    overwrite: Boolean(req.query.overwrite !== undefined),
  };
}

export function configureHttpApi(app: Express, core: FavaCore, options: {
  logger: SimpleLogger,
  routePrefix: string,
}) {

  const {
    logger,
    routePrefix,
  } = options;

  const locationsRoute = routePrefix + "/locations";

  app.get(locationsRoute, asyncHandler(async (req, res, next) => {
    logger.debug(`GET locations`);
    const response: GetLocationsResult = {
      locations: core.locations,
    };
    res.json(response);
  }));

  const apiRoute = routePrefix + "/:locationId/*";

  app.get(apiRoute, asyncHandler(async (req, res, next) => {

    const locationId = req.params.locationId ?? "";
    const path = req.params["0"] || "/";

    const isReadDir = req.query.readDir !== undefined;
    const isStats = req.query.stats !== undefined;
    const isExists = req.query.exists !== undefined;

    // TODO: Range header

    if (isReadDir) {
      logger.debug(`GET: readDir:`, locationId, path);
      const dirInfo = await core.readDir(locationId, path);
      const result: ReadDirResult = {
        dirInfo,
      };
      res.json(result);
    }
    
    else if (isStats) {
      logger.debug(`GET: stats:`, locationId, path);
      const fileInfo = await core.stat(locationId, path);
      const result: GetStatsResult = {
        fileInfo,
      };
      res.json(result);
    }
    
    else if (isExists) {
      logger.debug(`GET: exists:`, locationId, path);
      const exists = await core.exists(locationId, path);
      const result: PathExistsResult = {
        exists,
      };
      res.json(result);
    }
    
    else {
      logger.debug(`GET: read:`, locationId, path);
      const file = await core.readFile(locationId, path);
      res.send(file);
    }

    // printTestMess(route, req, res);

  }));

  app.put(apiRoute, asyncHandler(async (req, res, next) => {

    const locationId = req.params.locationId ?? "";
    const path = req.params["0"] || "/";
    const body = req.body;

    const isMoveFrom = Boolean(req.query.moveFrom !== undefined);
    const isCopyFrom = Boolean(req.query.copyFrom !== undefined);
    const isRenameFrom = Boolean(req.query.renameFrom !== undefined);
    const isEnsureDir = Boolean(req.query.ensureDir !== undefined);
    const isEnsureFile = Boolean(req.query.ensureFile !== undefined);
    const isOverwrite = Boolean(req.query.overwrite !== undefined);

    if (isMoveFrom) {
      const from = queryLocIdAndPath(req, "moveFrom");
      logger.debug(`PUT: move:`, from.locId, from.path, "->", locationId, path);
      await core.move(from.locId, from.path, locationId, path, { overwrite: isOverwrite });
      const result: UpdateResult = {
        update: "move",
        done: true,
      };
      res.json(result);
    }
    
    else if (isCopyFrom) {
      const from = queryLocIdAndPath(req, "copyFrom");
      logger.debug(`PUT: copy:`, from.locId, from.path, "->", locationId, path);
      await core.copy(from.locId, from.path, locationId, path, { overwrite: isOverwrite });
      const result: UpdateResult = {
        update: "copy",
        done: true,
      };
      res.json(result);
    }
    
    else if (isRenameFrom) {
      const from = req.query.renameFrom;
      if (!from || typeof from !== "string") {
        throw new Error(`Rename source must be a path`);
      }
      logger.debug(`PUT: rename:`, locationId, from, "->", locationId, path);
      await core.rename(locationId, from, path);
      const result: UpdateResult = {
        update: "rename",
        done: true,
      };
      res.json(result);
    }
    
    else if (isEnsureDir) {
      logger.debug(`PUT: ensureDir:`, locationId, path);
      await core.ensureDir(locationId, path);
      const result: UpdateResult = {
        update: "ensureDir",
        done: true,
      };
      res.json(result);
    }
    
    else if (isEnsureFile) {
      logger.debug(`PUT: ensureFile:`, locationId, path);
      await core.ensureFile(locationId, path);
      const result: UpdateResult = {
        update: "ensureFile",
        done: true,
      };
      res.json(result);
    }
    
    else {
      logger.debug(`PUT: write:`, locationId, path);
      logger.debug(`PUT: write body:`, body);
      await core.outputFile(locationId, path, body, {});
      const result: UpdateResult = {
        update: "write",
        done: true,
      };
      res.json(result);
    }

  }));

  app.patch(apiRoute, asyncHandler(async (req, res, next) => {

    const locationId = req.params.locationId ?? "";
    const path = req.params["0"] || "/";
    const body = req.body;

    const isAppend = Boolean(req.query.append !== undefined);

    if (isAppend) {
      logger.debug(`PATCH: append:`, locationId, path);
      await core.append(locationId, path, body, {});
      const result: UpdateResult = {
        update: "append",
        done: true,
      };
      res.json(result);
    }

    else {
      logger.debug(`PATCH: write:`, locationId, path);
      await core.writeBytes(locationId, path, body, {
        // range?
      });
      const result: UpdateResult = {
        update: "write",
        done: true,
      };
      res.json(result);
    }

  }));

  app.delete(apiRoute, asyncHandler(async (req, res, next) => {

    const locationId = req.params.locationId ?? "";
    const path = req.params["0"] || "/";

    const isEmptyDir = req.query.emptyDir !== undefined;

    if (isEmptyDir) {
      logger.debug(`DELETE: emptyDir:`, locationId, path);
      await core.emptyDir(locationId, path);
      const result: UpdateResult = {
        update: "emptyDir",
        done: true,
      };
      res.json(result);
    }

    else {
      logger.debug(`DELETE: remove:`, locationId, path);
      await core.remove(locationId, path);
      const result: UpdateResult = {
        update: "remove",
        done: true,
      };
      res.json(result);
    }

  }));

}

function queryLocIdAndPath(req: Request, queryName: string) {

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

function printTestMess(route: string, req: Request, res: Response) {

  // req.body
  // req.headers
  req.originalUrl
  req.path
  req.url
  res.json({
    route,
    locationIdParam: req.params.locationId,
    reqMethod: req.method,
    reqOriginalUrl: req.originalUrl,
    reqPath: req.path,
    reqUrl: req.url,
    // reqRoute: req.route,
    // driveList,
    params: req.params,
    query: req.query,
  });

}

// curl "http://localhost:6131/api/C:/somewhere/else/file.ext?something&one=two"
const testResponse = {
  "route": "/api/:locationId/*",
  "locationIdParam": "C:",
  "reqMethod": "GET",
  "reqOriginalUrl": "/api/C:/somewhere/else/file.ext?something&one=two",
  "reqPath": "/api/C:/somewhere/else/file.ext",
  "reqUrl": "/api/C:/somewhere/else/file.ext?something&one=two",
  "params": { "0": "somewhere/else/file.ext", "locationId": "C:" },
  "query": { "something": "", "one": "two" }
}
