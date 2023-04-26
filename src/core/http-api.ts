import express, { Express, Request, Response } from "express";
import urlJoin from "url-join";
import { list } from "drivelist";
import { inspect } from "util";
import { Logger } from "./utils/logger";
import { FavaCore } from "./core";
import asyncHandler from "express-async-handler";

// The defined operations:

// readFile   - GET     locId/path
// read       - GET     locId/path            "Range" header
// ls         - GET     locId/path?ls
// dir        - GET     locId/path?ls
// readDir    - GET     locId/path?ls
// pathExists - GET     locId/path?exists
// stat       - GET     locId/path?stats

// copy       - PUT     locId/path?copyFrom=locId/path
// ensureFile - PUT     locId/path?ensureFile
// ensureDir  - PUT     locId/path?ensureDir
// move       - PUT     locId/path?moveFrom=locId/path
// rename     - PUT     locId/path?renameFrom=locId/path
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
  routePrefix: string,
}) {

  const logger = new Logger("HTTP");

  const route = options.routePrefix + "/:locationId/*";

  app.get(route, asyncHandler(async (req, res, next) => {

    const locationId = req.params.locationId ?? "";
    const path = req.params["0"] ?? "";

    const isLs = req.query.ls !== undefined;
    const isStats = req.query.stats !== undefined;
    const isExists = req.query.exists !== undefined;

    if (isLs) {
      logger.debug(`GET: ls: ${locationId} / ${path}`);
      const dirinfo = await core.ls(locationId, path);
      // res.status()
      res.json(dirinfo);

    } else if (isStats) {
      logger.debug(`GET: stats: ${locationId} / ${path}`);
      const fileInfo = await core.stat(locationId, path);
      res.json(fileInfo);

    } else if (isExists) {
      logger.debug(`GET: exists: ${locationId} / ${path}`);
      const exists = await core.pathExists(locationId, path);
      res.json({ exists: exists });

    } else {
      logger.debug(`GET: read: ${locationId} / ${path}`);
      const file = await core.readFile(locationId, path);
      res.send(file);
    }

    // printTestMess(route, req, res);

  }));

  app.put(route, asyncHandler(async (req, res, next) => {

    const locationId = req.params.locationId ?? "";
    const path = req.params["0"] ?? "";
    const flags = putFlags(req);
    const body = req.body;

    if (flags.moveFrom) {
      const from = queryLocIdAndPath(req, "moveFrom");
      logger.debug(`PUT: move: ${from.locId} / ${from.path} -> ${locationId} / ${path}`);
      await core.move(from.locId, from.path, locationId, path, { overwrite: flags.overwrite });
      res.json({ move: "done" });

    } else if (flags.copyFrom) {
      const from = queryLocIdAndPath(req, "copyFrom");
      logger.debug(`PUT: copy: ${from.locId} / ${from.path} -> ${locationId} / ${path}`);
      await core.copy(from.locId, from.path, locationId, path, { overwrite: flags.overwrite });
      res.json({ copy: "done" });

    } else if (flags.renameFrom) {
      const from = req.query.renameFrom;
      if (!from || typeof from !== "string") {
        throw new Error(`Rename source must be a path`);
      }
      logger.debug(`PUT: rename: ${locationId} / ${from} -> ${locationId} / ${path}`);
      await core.rename(locationId, from, path);
      res.json({ rename: "done" });

    } else if (flags.ensureDir) {
      logger.debug(`PUT: ensureDir: ${locationId} / ${path}`);
      await core.ensureDir(locationId, path);
      res.json({ ensureDir: "done" });

    } else if (flags.ensureFile) {
      logger.debug(`PUT: ensureFile: ${locationId} / ${path}`);
      await core.ensureFile(locationId, path);
      res.json({ ensureFile: "done" });

    } else {
      logger.debug(`PUT: write: ${locationId} / ${path}`);
      logger.debug(`PUT: write body: ${body}`);
      await core.outputFile(locationId, path, body, { });
      res.json({ write: "done" });
    }

  }));

  app.patch(route, asyncHandler(async (req, res, next) => {
    
    const locationId = req.params.locationId ?? "";
    const path = req.params["0"] ?? "";
    const body = req.body;

    const isAppend = req.query.append !== undefined;

    if (isAppend) {
      logger.debug(`PATCH: append: ${locationId} / ${path}`);
      await core.append(locationId, path, body, { });
      res.json({ append: "done" });

    } else {
      logger.debug(`PATCH: write: ${locationId} / ${path}`);
      await core.write(locationId, path, body, { });
      res.json({ write: "done" });
    }

  }));

  app.delete(route, asyncHandler(async (req, res, next) => {
    
    const locationId = req.params.locationId ?? "";
    const path = req.params["0"] ?? "";

    const isEmptyDir = req.query.emptyDir !== undefined;

    if (isEmptyDir) {
      logger.debug(`DELETE: emptyDir: ${locationId} / ${path}`);
      await core.emptyDir(locationId, path);
      res.json({ emptyDir: "done" });

    } else {
      logger.debug(`DELETE: remove: ${locationId} / ${path}`);
      await core.remove(locationId, path);
      res.json({ remove: "done" });
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
