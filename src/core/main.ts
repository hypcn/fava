import express, { Express } from "express";
import { Server, createServer } from 'http';
import urlJoin from "url-join";
import { WebSocketServer } from 'ws';
import { FavaLocation } from "../shared";
import { CopyOptions, FileData, MoveOptions, ReadBytesOptions, ReadFileOptions, WriteBytesOptions, WriteFileOptions } from "./adapters/adapter.interface";
import { FavaCore } from "./core";
import { configureHttpApi } from "./http-api";
import { FavaServerConfig } from "./interfaces/server-config.interface";
import { configureErrorHandler, configureMiddleware } from "./middleware";
import { Logger } from "./utils/logger";
import { FavaUtils } from "./utils/utils";
import { configureWebUi } from "./web-ui";

const DEFAULT_PORT = 6131;

export class Fava {

  private core: FavaCore = new FavaCore();

  private server!: Server;
  private app!: Express;
  private wss!: WebSocketServer;

  private httpEnabled: boolean = false;
  private wsEnabled: boolean = false;
  private uiEnabled: boolean = false;

  private logger = new Logger("Main");

  constructor(config: FavaServerConfig) {

    if (config.logLevel) {
      Logger.logLevel = config.logLevel;
    }
    if (config.logger) {
      Logger.customLogger = config.logger;
    }

    this.init(config);

  }

  private async init(config: FavaServerConfig) {

    if (!config.locations || config.locations.length === 0) {
      this.logger.log(`No locations specified; discovering local drives...`);
      this.core.locations = await FavaUtils.findDefaultLocations();
      this.logger.log(`Discovered ${this.core.locations.length} local drives`);
      this.logger.debug(`Local drive locations:`, this.core.locations);
    } else {
      this.core.locations = config.locations;
      this.logger.log(`${this.core.locations.length} locations specified`);
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
    configureMiddleware(this.app);
    this.server.on("request", this.app);

    const httpApiPrefix = config.routePrefix ? urlJoin(config.routePrefix, "/api") : "/api";
    const wsApiPrefix = config.routePrefix ? urlJoin(config.routePrefix, "/ws") : "/ws";
    const webUiPrefix = config.routePrefix ? urlJoin(config.routePrefix, "/") : "/";

    if (config.http) {
      configureHttpApi(this.app, this.core, {
        routePrefix: httpApiPrefix,
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
      configureWebUi(this.app, this.core, {
        routePrefix: webUiPrefix,
      });
      this.logger.log(`Configured Web UI`);
    } else {
      this.logger.warn(`Web UI disabled`);
    }
    this.uiEnabled = Boolean(config.ui);

    // Add error handlers last
    configureErrorHandler(this.app);

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

    // Print addresses of configured interfaces
    let address = this.server.address();
    if (address === null) {
      address = `[unknown]`;
    } else if (typeof address === "object") {
      const addr = address.address === "::" ? "localhost" : address.address;
      address = `${addr}:${address.port}`
    }
    if (this.httpEnabled) {
      this.logger.log(`HTTP API: ${urlJoin(`http://${address}`, httpApiPrefix)}`);
    }
    if (this.wsEnabled) {
      this.logger.log(`WS API:   ${urlJoin(`ws://${address}`, wsApiPrefix)}`);
    }
    if (this.uiEnabled) {
      this.logger.log(`Web UI:   ${urlJoin(`http://${address}`, webUiPrefix)}`);
    }

  }

  // ========== Locations

  findLocation(locId: string): FavaLocation {
    return this.core.findLocation(locId);
  }

  addLocation(location: FavaLocation) {
    const existing = this.findLocation(location.id);
    if (existing) throw new Error(`Location already exists with ID: ${location.id}`);
    this.core.locations.push(location);
  }

  addLocations(locations: FavaLocation[]) {
    for (const location of locations) {
      this.addLocation(location);
    }
  }

  getLocations(): FavaLocation[] {
    return this.core.locations;
  }

  removeLocation(location: string | FavaLocation) {
    if (typeof location === "string") {
      this.core.locations = this.core.locations.filter(loc => loc.id !== location);
    } else {
      this.core.locations = this.core.locations.filter(loc => loc !== location);
    }
  }

  // ========== API for consumption by the application when using Fava as a library

  async copy(srcLocId: string, srcPath: string, destLocId: string, destPath: string, options?: CopyOptions) {
    return this.core.copy(srcLocId, srcPath, destLocId, destPath, options);
  }
  async dir(locId: string, dirPath: string) {
    return this.core.dir(locId, dirPath);
  }
  async emptyDir(locId: string, dirPath: string) {
    return this.core.emptyDir(locId, dirPath);
  }
  async ensureFile(locId: string, filePath: string) {
    return this.core.ensureFile(locId, filePath);
  }
  async ensureDir(locId: string, dirPath: string) {
    return this.core.ensureDir(locId, dirPath);
  }
  async ls(locId: string, dirPath: string) {
    return this.core.ls(locId, dirPath);
  }
  async mkdir(locId: string, dirPath: string) {
    return this.core.mkdir(locId, dirPath);
  }
  async move(srcLocId: string, srcPath: string, destLocId: string, destPath: string, options?: MoveOptions) {
    return this.core.move(srcLocId, srcPath, destLocId, destPath, options);
  }
  async outputFile(locId: string, filePath: string, data: FileData, options?: WriteFileOptions) {
    return this.core.outputFile(locId, filePath, data, options);
  }
  async pathExists(locId: string, path: string): Promise<boolean> {
    return this.core.pathExists(locId, path);
  }
  async read(locId: string, filePath: string, options?: ReadBytesOptions) {
    return this.core.read(locId, filePath, options);
  }
  async readDir(locId: string, dirPath: string) {
    return this.core.readDir(locId, dirPath);
  }
  async readFile(locId: string, filePath: string, options?: ReadFileOptions) {
    return this.core.readFile(locId, filePath, options);
  }
  async remove(locId: string, path: string) {
    return this.core.remove(locId, path);
  }
  async rename(locId: string, oldPath: string, newPath: string) {
    return this.core.rename(locId, oldPath, newPath);
  }
  async stat(locId: string, path: string) {
    return this.core.stat(locId, path);
  }
  async touch(locId: string, filePath: string) {
    return this.core.touch(locId, filePath);
  }
  async write(locId: string, filePath: string, data: FileData, options?: WriteBytesOptions) {
    return this.core.write(locId, filePath, data, options);
  }
  async writeFile(locId: string, filePath: string, data: FileData, options?: WriteFileOptions) {
    return this.core.writeFile(locId, filePath, data, options);
  }

}
