import { Logger } from "@hypericon/axe";
import cors from "cors";
import { Express, Request, Response, json, raw, text, urlencoded } from "express";
import { FavaServerConfig } from "./interfaces";
import { FavaUtils } from "./utils/utils";

const logger = new Logger("HTTP");

export function configureMiddleware(app: Express, config: FavaServerConfig) {
  logger.debug(`Adding middleware...`);

  // No error handlers here

  if (config.noCors !== true) {
    app.use(cors());
  }

  app.use(json({}));
  app.use(raw({}));
  app.use(text({}));
  app.use(urlencoded({ extended: true }));

  logger.debug(`Added middleware`);
  return app;
}

/**
 * Error handlers must be `use()`ed last
 * @param app 
 * @returns 
 */
export function configureErrorHandler(app: Express) {
  logger.debug(`Adding error handlers...`);

  app.use((err: Error, req: Request, res: Response, next: Function) => {

    const error = {
      error: err.name,
      message: FavaUtils.slash(err.message),
      url: req.url,
    };

    logger.error(error);

    if (res.headersSent) {
      return next(err);
    }

    res.status(500);
    res.json(error);
  });

  logger.debug(`Added error handlers`);
  return app;
}
