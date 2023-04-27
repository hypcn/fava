import express, { Express } from "express";
import { FavaCore } from "./core";
import { join } from "path";
import urlJoin from "url-join";

export function configureWebUi(app: Express, core: FavaCore, options: {
  routePrefix: string,
}) {

  const uiRoute = urlJoin(options.routePrefix, "/");
  const uiDir = join(__dirname, "../ui");

  app.use(uiRoute, express.static(uiDir));

}
