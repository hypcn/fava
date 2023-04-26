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
// mkdir      - PUT     locId/path?mkdir
// move       - PUT     locId/path?moveFrom=locId/path
// outputFile - PUT     locId/path                        file in the body
// rename     - PUT     locId/path?renameFrom=locId/path
// touch      - PUT     locId/path?touch
// writeFile  - PUT     locId/path                        file in the body

// write      - PATCH   locId/path      range in "Range" header; data in body

// emptyDir   - DELETE  locId/path?keepDir
// remove     - DELETE  locId/path

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

    // logger.debug(`GET`);
    // logger.debug(`Location ID: ${locationId}`);
    // logger.debug(`Path: ${path}`);
    // logger.debug(`flags: ls: ${isLs} stats: ${isStats} exists: ${isExists}`);

    if (isLs) {
      logger.debug(`GET:  ls: ${locationId} // ${path}`);
      const dirinfo = await core.ls(locationId, path);
      // res.status()
      res.json(dirinfo);
    } else if (isStats) {
      logger.debug(`GET:  stats: ${locationId} // ${path}`);
      const fileInfo = await core.stat(locationId, path);
      res.json(fileInfo);
    } else if (isExists) {
      logger.debug(`GET:  exists: ${locationId} // ${path}`);
      const exists = await core.pathExists(locationId, path);
      res.json({ exists: exists });
    } else {
      logger.debug(`GET:  read: ${locationId} // ${path}`);
      const file = await core.readFile(locationId, path);
      res.send(file);
    }

    // printTestMess(route, req, res);

  }));

  app.put(route, asyncHandler(async (req, res, next) => {
    // 
  }));

  app.patch(route, asyncHandler(async (req, res, next) => {
    // 
  }));

  app.delete(route, asyncHandler(async (req, res, next) => {
    // 
  }));

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
