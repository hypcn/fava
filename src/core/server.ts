import { FavaServerConfig } from "./interfaces/server-config.interface";
import express, { Express } from "express";
import { Server, createServer } from 'http';
import { WebSocketServer } from 'ws';
import { configureHttpApi } from "./http-api";
import { FavaLocation } from "./interfaces/location.interface";
import { FavaUtils } from "./utils";
import { Logger } from "./logger";

const DEFAULT_PORT = 6131;

export class FavaServer {

  private server: Server;
  private app: Express;
  private wss: any;

  private httpEnabled: boolean;
  private wsEnabled: boolean;
  private uiEnabled: boolean;

  private locations: FavaLocation[] = [];

  private logger = new Logger("Fava");

  constructor(config: FavaServerConfig) {

    if (config.logger) this.logger = config.logger as Logger;

    if (!config.locations || config.locations.length === 0) {
      this.logger.log(`No locations specified; local drives will be discovered`);
    } else {
      this.locations = config.locations;
      this.logger.log(`${this.locations.length} locations specified`);
    }

    if (config.server) {
      this.logger.log(`Using existing HTTP server`);
      this.server = config.server;
    } else {
      this.logger.log(`Creating new HTTP server`);
      this.server = createServer();
    }
    const startListening = !Boolean(config.server);

    this.app = express();
    this.server.on("request", this.app);

    if (config.http) {
      configureHttpApi(this.app, {
        routePrefix: "/api",
      });
      this.logger.log(`Configured HTTP API`);
    } else {
      this.logger.warn(`HTTP API disabled`);
    }
    this.httpEnabled = Boolean(config.http);

    this.wss = new WebSocketServer({
      server: this.server,
    });

    if (config.ws) {
      
      // TODO: wire up WS API
      
    } else {
      this.logger.warn(`WS API disabled`);
    }
    this.wsEnabled = Boolean(config.ws);

    if (config.ui) {

      // TODO: wire up UI

    } else {
      this.logger.warn(`Web UI disabled`);
    }
    this.uiEnabled = Boolean(config.ui);

    // If the server was created by the library, start listening
    if (startListening) {
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

    let address = this.server.address();
    if (address === null) {
      address = `[unknown]`;
    } else if (typeof address === "object") {
      address = `${address.address}:${address.port}`
    }
    if (this.httpEnabled) {
      this.logger.log(`HTTP API available at: http://${address}/api`);
    }
    if (this.wsEnabled) {
      this.logger.log(`WS API available at: ws://${address}`);
    }
    if (this.uiEnabled) {
      this.logger.log(`Web UI available at: http://${address}/ui`);
    }

    // Long-running stuff at the end

    if (this.locations.length === 0) {
      this.logger.log(`Discovering local drives...`);
      FavaUtils.findDefaultLocations().then(locations => {
        this.locations = locations;
        this.logger.log(`Discovered ${this.locations.length} local drives`);
        this.logger.debug(`Local drive locations:`, this.locations);
      });
    }

  }

}

// curl http://localhost:6131/api/c:/dev/_Hypericon/fava
const r = {
  "route":"/api/:location/*",
  "locationParam":"c:",
  "reqMethod":"GET",
  "reqOriginalUrl":"/api/c:/dev/_Hypericon/fava",
  "reqPath":"/api/c:/dev/_Hypericon/fava",
  "reqUrl":"/api/c:/dev/_Hypericon/fava"
}
