import { Server } from "http";
import { Logger } from "./logger.interface";

export interface FavaServerConfig {

  /**
   * Optionally specify an existing server to use, otherwise a new one will be created
   */
  server?: Server,

  /**
   * If no server is provided, a new one will be created.
   * Optionally override the default port number
   * @default 6131
   */
  port?: number,

  /**
   * Optionally override the default logger
   */
  logger?: Logger,

  /**
   * Disable the HTTP API entirely
   */
  disableHttp?: boolean,

  /**
   * Disable the Websocket API entirely
   */
  disableWs?: boolean,

}
