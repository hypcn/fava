import express, { Express } from "express";
import { Server, createServer } from 'http';
import urlJoin from "url-join";
import { WebSocketServer } from 'ws';
import { FavaLocation, FavaLocation_FS } from "../shared";
import { CopyOptions, FileData, MoveOptions, ReadBytesOptions, ReadFileOptions, WriteBytesOptions, WriteFileOptions } from "./adapters/adapter.interface";
import { FavaCore } from "./core";
import { configureHttpApi } from "./http-api";
import { FavaConfig } from "./interfaces/fava-config.interface";
import { configureErrorHandler, configureMiddleware } from "./middleware";
import { configureWebUi } from "./web-ui";
import { Logger, SimpleLogger } from "@hypericon/axe";
import { list } from "drivelist";

const DEFAULT_PORT = 6131;

export class Fava {

  private core: FavaCore = new FavaCore();

  private server!: Server;
  private app!: Express;
  private wss!: WebSocketServer;

  private httpEnabled: boolean = false;
  private wsEnabled: boolean = false;
  private uiEnabled: boolean = false;

  private httpApiPrefix: string = "/api";
  private wsApiPrefix: string = "/ws";
  private webUiPrefix: string = "/";

  private logger = new Logger("Main");
  private getLogger: (context?: string) => SimpleLogger = (ctx) => new Logger(ctx);

  constructor(config: FavaConfig) {

    if (config.logLevel) {
      this.logger.sinkFilter.all = config.logLevel;
    }
    if (config.getLogger) {
      this.getLogger = config.getLogger;
      this.logger = this.getLogger(this.logger.context) as Logger;
    }

    this.init(config);

  }

  private async init(config: FavaConfig) {

    await this.initLocations(config);

    if (config.routePrefix) {
      this.httpApiPrefix = urlJoin(config.routePrefix, this.httpApiPrefix);
      this.wsApiPrefix = urlJoin(config.routePrefix, this.wsApiPrefix);
      this.webUiPrefix = urlJoin(config.routePrefix, this.webUiPrefix);
    }

    this.httpEnabled = Boolean(config.http);
    this.wsEnabled = Boolean(config.ws);
    this.uiEnabled = Boolean(config.ui);
    
    this.initServer(config);
    
    // If the server was created by the library, start listening
    const startListening = !Boolean(config.server);
    if (startListening) {
      this.server.on("error", (err) => {
        this.logger.error(`Fava server error:`, err);
      });

      const port = config.port ?? DEFAULT_PORT;
      this.server.listen(port, () => {
        this.logger.log(`Fava server listening on port: ${port}`);
      });
    } else {
      this.logger.log(`Fava connected to existing HTTP server`);
    }

    this.printInitLogs();

  }

  private async initLocations(config: FavaConfig) {

    if (!config.locations || config.locations.length === 0) {
      this.logger.log(`No locations specified; discovering local drives...`);
      this.core.locations = await this.findDefaultLocations();
      this.logger.log(`Discovered ${this.core.locations.length} local drives`);
      this.logger.debug(`Local drive locations:`, this.core.locations);
    } else {
      this.core.locations = config.locations;
      this.logger.log(`${this.core.locations.length} locations specified`);
    }

  }

  private initServer(config: FavaConfig) {

    if (config.server) {
      this.logger.log(`Using existing HTTP server`);
      this.server = config.server;
    } else {
      this.logger.log(`Creating new HTTP server`);
      this.server = createServer();
    }

    this.app = express();
    configureMiddleware(this.app, config);
    this.server.on("request", this.app);

    if (config.http) {
      configureHttpApi(this.app, this.core, {
        logger: new Logger("HTTP"),
        routePrefix: this.httpApiPrefix,
      });
      this.logger.log(`Configured HTTP API`);
    }

    this.wss = new WebSocketServer({
      server: this.server,
    });

    if (config.ws) {

      // TODO: wire up WS API

    }

    if (config.ui) {
      configureWebUi(this.app, this.core, {
        routePrefix: this.webUiPrefix,
      });
      this.logger.log(`Configured Web UI`);
    }

    // Add error handlers last
    configureErrorHandler(this.app);

  }

  private async findDefaultLocations(): Promise<FavaLocation_FS[]> {

    const fsLocations: FavaLocation_FS[] = [];

    const driveList = await list();

    for (const drive of driveList) {

      let drivePath = drive.mountpoints.at(0)?.path;
      if (!drivePath) continue;

      drivePath = drivePath.replace(/\\/g, "");

      const driveLabel = drive.mountpoints.at(0)?.label ?? drive.description;

      fsLocations.push({
        type: "FS",
        id: drivePath,
        name: driveLabel,
        root: drivePath,
      });
    }

    return fsLocations;

  }

  private printInitLogs() {

    // Print addresses of configured interfaces
    let address = this.server.address();
    if (address === null) {
      address = `[unknown]`;
    } else if (typeof address === "object") {
      const addr = address.address === "::" ? "localhost" : address.address;
      address = `${addr}:${address.port}`
    }

    if (this.httpEnabled) {
      this.logger.log(`HTTP API enabled: ${urlJoin(`http://${address}`, this.httpApiPrefix)}`);
    } else {
      this.logger.warn(`HTTP API disabled (enable with: --http)`);
    }

    if (this.wsEnabled) {
      this.logger.log(`WS API enabled:   ${urlJoin(`ws://${address}`, this.wsApiPrefix)}`);
    } else {
      this.logger.warn(`WS API disabled   (enable with: --ws)`);
    }

    if (this.uiEnabled) {
      this.logger.log(`Web UI enabled:   ${urlJoin(`http://${address}`, this.webUiPrefix)}`);
    } else {
      this.logger.warn(`Web UI disabled   (enable with: --ui)`);
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
