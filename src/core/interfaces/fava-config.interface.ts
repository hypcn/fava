import { LogLevel, SimpleLogger } from "@hypericon/axe";
import { Server } from "http";
import { FavaLocation } from "../../shared";

/** Configure whether an interface is enabled, and if so, with what capabilities */
export type FavaInterfaceConfig =
  | {
    read: boolean,
    write: boolean,
  }
  | boolean
  ;

export interface FavaConfig {

  /** Optionally specify an existing HTTP server to use, otherwise a new one will be created */
  server?: Server,

  /**
   * If no server is provided, a new one will be created.
   * Optionally override the default port number
   * @default 6131
   */
  port?: number,

  /** Optionally specify a prefix for server HTTP routes */
  routePrefix?: string,
  
  /**
   * 
   */
  locations?: FavaLocation[],

  /** Configure whether the HTTP API is enabled, and if so, with what capabilities */
  http?: FavaInterfaceConfig,

  /** Configure whether the websocket API is enabled, and if so, with what capabilities */
  ws?: FavaInterfaceConfig,

  /** Configure whether the web UI is enabled, and if so, with what capabilities */
  ui?: FavaInterfaceConfig,

  /** Optionally provide a function to get custom logger objects overriding the default logger */
  getLogger?: (context?: string) => SimpleLogger,

  /** Optionally configure the logging level of the built-in logger */
  logLevel?: LogLevel,

  /** Disable CORS, which is enabled by default */
  noCors?: boolean,

}
