import { SimpleLogger } from "@hypericon/axe";
import cors from "cors";
import { Express, Request, Response, json, raw, text, urlencoded } from "express";
import { FavaConfig } from "./interfaces";
import { backslashToForward } from "./utils";

export function configureMiddleware(app: Express, config: FavaConfig, logger: SimpleLogger) {
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
export function configureErrorHandler(app: Express, logger: SimpleLogger) {
  logger.debug(`Adding error handlers...`);

  app.use((err: Error, req: Request, res: Response, next: Function) => {

    const error = {
      error: err.name,
      message: backslashToForward(err.message),
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
