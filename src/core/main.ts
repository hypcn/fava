import { Logger, SimpleLogger } from "@hypericon/axe";
import { dereference } from "@hypericon/utils";
import { list } from "drivelist";
import express, { Express } from "express";
import { Server, createServer } from 'http';
import { BehaviorSubject, filter, firstValueFrom, map } from "rxjs";
import urlJoin from "url-join";
import { WebSocketServer } from 'ws';
import { FavaLocation, FavaLocation_FS } from "../shared";
import { CopyOptions, FileData, MoveOptions, ReadBytesOptions, ReadFileOptions, WriteBytesOptions, WriteFileOptions } from "./adapters/adapter.interface";
import { FavaAdapter } from "./adapters/fava-adapter";
import { FsAdapter } from "./adapters/fs-adapter";
import { FavaCore } from "./core";
import { configureHttpApi } from "./http-api";
import { FavaConfig, FavaInterfaceInfo } from "./interfaces";
import { configureErrorHandler, configureMiddleware } from "./middleware";
import { configureWebUi } from "./web-ui";

const DEFAULT_PORT = 6131;

export class Fava {

  private core: FavaCore = new FavaCore();

  /** Whether Fava is managing its own server */
  private ownServer: boolean = true;
  private server!: Server;
  private app!: Express;
  private wss!: WebSocketServer;

  private httpInfo: FavaInterfaceInfo = { enabled: false, canRead: false, canWrite: false };
  private wsInfo: FavaInterfaceInfo = { enabled: false, canRead: false, canWrite: false };
  private uiInfo: FavaInterfaceInfo = { enabled: false, canRead: false, canWrite: false };

  private httpApiPrefix: string = "/api";
  private wsApiPrefix: string = "/ws";
  private webUiPrefix: string = "/";

  private logger = new Logger("Main");
  private getLogger: (context?: string) => SimpleLogger = (ctx) => new Logger(ctx);

  /** Whether the class is ready */
  private _isReady = new BehaviorSubject(false);
  /** Observable emitting whether the class is ready */
  public isReady$ = this._isReady.asObservable();
  /** Get whether the class is currently ready */
  get isReady() { return this._isReady.value; }
  /** Get a promise that resolves when the class is ready */
  get onReady(): Promise<void> {
    if (this.isReady) return Promise.resolve();
    const onReady$ = this.isReady$.pipe(
      filter(isReady => isReady),
      map(_ => { return; })
    );
    return firstValueFrom(onReady$);
  }

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

  // ========== Initialisation & Destruction

  private async init(config: FavaConfig) {

    this._isReady.next(false);

    await this.initLocations(config);

    this.initAdapters();

    if (config.routePrefix) {
      this.httpApiPrefix = urlJoin(config.routePrefix, this.httpApiPrefix);
      this.wsApiPrefix = urlJoin(config.routePrefix, this.wsApiPrefix);
      this.webUiPrefix = urlJoin(config.routePrefix, this.webUiPrefix);
    }

    this.httpInfo.enabled = Boolean(config.http);
    if (config.http) {
      this.httpInfo.canRead = config.http === true || ("canRead" in config.http && config.http.canRead === true);
      this.httpInfo.canWrite = config.http === true || ("canWrite" in config.http && config.http.canWrite === true);
    }

    this.wsInfo.enabled = Boolean(config.ws);
    if (config.ws) {
      this.wsInfo.canRead = config.ws === true || ("canRead" in config.ws && config.ws.canRead === true);
      this.wsInfo.canWrite = config.ws === true || ("canWrite" in config.ws && config.ws.canWrite === true);
    }

    this.uiInfo.enabled = Boolean(config.ui);
    if (config.ui) {
      this.uiInfo.canRead = config.ui === true || ("canRead" in config.ui && config.ui.canRead === true);
      this.uiInfo.canWrite = config.ui === true || ("canWrite" in config.ui && config.ui.canWrite === true);
    }
    
    this.initServer(config);
    
    // If the server was created by the library, start listening
    this.ownServer = !Boolean(config.server);
    if (this.ownServer) {
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

    this._isReady.next(true);

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

  private initAdapters() {
    this.core.adapters = [
      new FsAdapter(),
      new FavaAdapter(),
    ];
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

    if (this.httpInfo.enabled) {
      this.logger.log(`HTTP API enabled: ${urlJoin(`http://${address}`, this.httpApiPrefix)}`);
    } else {
      this.logger.warn(`HTTP API disabled (enable with: --http)`);
    }

    if (this.wsInfo.enabled) {
      this.logger.log(`WS API enabled:   ${urlJoin(`ws://${address}`, this.wsApiPrefix)}`);
    } else {
      this.logger.warn(`WS API disabled   (enable with: --ws)`);
    }

    if (this.uiInfo.enabled) {
      this.logger.log(`Web UI enabled:   ${urlJoin(`http://${address}`, this.webUiPrefix)}`);
    } else {
      this.logger.warn(`Web UI disabled   (enable with: --ui)`);
    }

  }

  async destroy() {

    this._isReady.next(false);

    if (this.ownServer) {

      return new Promise<void>((resolve, reject) => {
        this.server.closeAllConnections?.();
        this.server.unref();
        this.server.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });

    } else {

      // remove listeners from toher server?

    }

  }

  // ========== Interfaces

  getInterfaceInfo(): {
    http: FavaInterfaceInfo,
    ws: FavaInterfaceInfo,
    ui: FavaInterfaceInfo,
  } {
    return {
      http: {
        enabled: this.httpInfo.enabled,
        canRead: this.httpInfo.canRead,
        canWrite: this.httpInfo.canWrite,
      },
      ws: {
        enabled: this.wsInfo.enabled,
        canRead: this.wsInfo.canRead,
        canWrite: this.wsInfo.canWrite,
      },
      ui: {
        enabled: this.uiInfo.enabled,
        canRead: this.uiInfo.canRead,
        canWrite: this.uiInfo.canWrite,
      },
    };
  }

  // ========== Locations

  /**
   * Find the location with the given ID
   * @param locId 
   * @returns 
   * @throws if the location is not found
   */
  findLocation(locId: string): FavaLocation {
    return this.core.findLocation(locId);
  }

  /**
   * Add a new location
   * @param location 
   */
  addLocation(location: FavaLocation) {
    const existing = this.core.locations.find(loc => loc.id === location.id);
    if (existing) throw new Error(`Location already exists with ID: ${location.id}`);
    this.core.locations.push(location);
  }

  /**
   * Get the list of defined locations
   * @returns 
   */
  getLocations(): FavaLocation[] {
    return dereference(this.core.locations);
  }

  /**
   * Remove a location by ID
   * @param location 
   */
  removeLocation(location: string) {
    this.core.locations = this.core.locations.filter(loc => loc.id !== location);
  }

  // ========== API for consumption by the application when using Fava as a library

  async append(locId: string, filePath: string, data: FileData, options?: WriteFileOptions) {
    return this.core.append(locId, filePath, data, options);
  }
  async copy(srcLocId: string, srcPath: string, destLocId: string, destPath: string, options?: CopyOptions) {
    return this.core.copy(srcLocId, srcPath, destLocId, destPath, options);
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
  async exists(locId: string, path: string): Promise<boolean> {
    return this.core.exists(locId, path);
  }
  async ls(locId: string, dirPath: string) {
    return this.core.readDir(locId, dirPath);
  }
  async mkdir(locId: string, dirPath: string) {
    return this.core.ensureDir(locId, dirPath);
  }
  async move(srcLocId: string, srcPath: string, destLocId: string, destPath: string, options?: MoveOptions) {
    return this.core.move(srcLocId, srcPath, destLocId, destPath, options);
  }
  async readBytes(locId: string, filePath: string, options?: ReadBytesOptions) {
    return this.core.readBytes(locId, filePath, options);
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
  async writeBytes(locId: string, filePath: string, data: FileData, options?: WriteBytesOptions) {
    return this.core.writeBytes(locId, filePath, data, options);
  }
  async writeFile(locId: string, filePath: string, data: FileData, options?: WriteFileOptions) {
    return this.core.writeFile(locId, filePath, data, options);
  }

}
