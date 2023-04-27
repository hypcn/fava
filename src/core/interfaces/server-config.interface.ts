import { Server } from "http";
import { FavaLogger } from "./logger.interface";
import { FavaLocation } from "../../shared";
import { LogLevel } from "../utils/logger";

/** Configure whether an interface is enabled, and if so, with what capabilities */
export type FavaServerInterfaceConfig =
  | {
    read: boolean,
    write: boolean
  }
  | boolean
  ;

export interface FavaServerConfig {

  /** Optionally specify an existing server to use, otherwise a new one will be created */
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
  http?: FavaServerInterfaceConfig,

  /** Configure whether the websocket API is enabled, and if so, with what capabilities */
  ws?: FavaServerInterfaceConfig,

  /** Configure whether the web UI is enabled, and if so, with what capabilities */
  ui?: FavaServerInterfaceConfig,

  /** Optionally override the default logger */
  logger?: FavaLogger,

  /** Optionally configure the logging level of the built-in logger */
  logLevel?: LogLevel,

}
