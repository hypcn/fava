import { Logger } from "./core/logger.interface";
import { FavaServerConfig } from "./core/server-config.interface";
import express, { Express } from "express";
import { Server, createServer } from 'http';
import { WebSocketServer } from 'ws';

const DEFAULT_PORT = 6131;

export class FavaServer {

  private server: Server;
  private app: Express;
  private wss: any;

  private logger: Logger = console;

  constructor(config: FavaServerConfig) {

    if (config.logger) this.logger = config.logger;

    if (config.server) {
      this.logger.log(`Using existing HTTP server`);
      this.server = config.server;
    } else {
      this.logger.log(`Creating new HTTP server`);
      this.server = createServer();
    }

    this.app = express();
    this.server.on("request", this.app);

    if (config.disableHttp) {
      this.logger.warn(`HTTP API disabled`);
    } else {

      // TODO: wire up HTTP API

    }

    this.wss = new WebSocketServer({
      server: this.server,
    });

    if (config.disableWs) {
      this.logger.warn(`WS API disabled`);
    } else {

      // TODO: wire up WS API

    }

    // If the server was created by the library, start listening
    if (config.server) {
      this.server.on("error", (err) => {
        this.logger.error(`Fava server error:`, err);
      });

      const port = config.port ?? DEFAULT_PORT;
      this.server.listen(port, () => {
        this.logger.log(`Fava server listening on port: ${port}`);
      });
    } else {
      this.logger.log(`Fava wired up to existing HTTP server`);
    }

  }

}
