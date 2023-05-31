import { Logger } from "@hypericon/axe";
import { FavaLocation, FavaLocationType } from "../shared";
import { CopyOptions, FileData, IFavaAdapter, MoveOptions, ReadBytesOptions, ReadFileOptions, WriteBytesOptions, WriteFileOptions } from "./adapters/adapter.interface";
import { FavaAdapter } from "./adapters/fava-adapter";
import { FsAdapter } from "./adapters/fs-adapter";

const adapters: { [key in FavaLocationType]: IFavaAdapter<FavaLocation> } = {
  FS: new FsAdapter(),
  Fava: new FavaAdapter(),
};

/**
 * @internal
 */
export class FavaCore {

  private logger = new Logger("Core");

  adapters: IFavaAdapter<FavaLocation>[] = [];
  
  locations: FavaLocation[] = [];

  constructor(options?: {
    logger?: Logger,
    locations?: FavaLocation[],
    adapters?: IFavaAdapter<FavaLocation>[],
  }) {
    if (options?.logger) this.logger = options.logger;

    if (options?.adapters) this.adapters.push(...options.adapters);
    if (options?.locations) this.locations.push(...options.locations);
  }

  getLocations(): FavaLocation[] {
    return this.locations;
  }

  findLocation(locId: string): FavaLocation {
    const location = this.locations.find(loc => loc.id === locId);
    if (!location) throw new Error(`No location with ID: ${locId}`);
    return location;
  }

  getAdapter(location: FavaLocation): IFavaAdapter<FavaLocation> {
    const adapter = this.adapters.find(a => a.getType() === location.type);
    if (!adapter) throw new Error(`Adapter not found for location type: ${location.type}`);
    return adapter;
  }

  // ========== READ

  async exists(locId: string, path: string): Promise<boolean> {
    this.logger.debug(`pathExists`, locId, path);
    const loc = this.findLocation(locId);
    const adapter = this.getAdapter(loc);
    return adapter.exists(loc, path);
  }

  async readBytes(locId: string, filePath: string, options?: ReadBytesOptions) {
    this.logger.debug(`read`, locId, filePath, options);
    const loc = this.findLocation(locId);
    const adapter = this.getAdapter(loc);
    return adapter.readBytes(loc, filePath, options);
  }

  async readDir(locId: string, dirPath: string) {
    this.logger.debug(`readDir`, locId, dirPath);
    const loc = this.findLocation(locId);
    const adapter = this.getAdapter(loc);
    return adapter.ls(loc, dirPath);
  }

  async readFile(locId: string, filePath: string, options?: ReadFileOptions) {
    this.logger.debug(`readFile`, locId, filePath, options);
    const loc = this.findLocation(locId);
    const adapter = this.getAdapter(loc);
    return adapter.readFile(loc, filePath, options);
  }

  async stat(locId: string, path: string) {
    this.logger.debug(`stat`, locId, path);
    const loc = this.findLocation(locId);
    const adapter = this.getAdapter(loc);
    return adapter.stat(loc, path);
  }

  // ========== UPDATE

  async append(locId: string, filePath: string, data: FileData, options?: WriteFileOptions) {
    this.logger.debug(`append`, locId, filePath, data, options);
    const loc = this.findLocation(locId);
    const adapter = this.getAdapter(loc);
    return adapter.append(loc, filePath, data, options);
  }

  async copy(fromLocId: string, fromPath: string, toLocId: string, toPath: string, options?: CopyOptions) {
    this.logger.debug(`copy`, fromLocId, fromPath, toLocId, toPath, options);

    const fromLoc = this.findLocation(fromLocId);
    const toLoc = this.findLocation(toLocId);
    const fromAdapter = this.getAdapter(fromLoc);
    const toAdapter = this.getAdapter(toLoc);

    if (fromAdapter.getType() === toAdapter.getType()) {
      return fromAdapter.copy(fromLoc, fromPath, toLoc, toPath, options);
    } else {
      throw new Error(`Copying between location types is not implemented`);
    }
  }

  async ensureFile(locId: string, filePath: string) {
    this.logger.debug(`ensureFile`, locId, filePath);
    const loc = this.findLocation(locId);
    const adapter = this.getAdapter(loc);
    return adapter.ensureFile(loc, filePath);
  }

  async ensureDir(locId: string, dirPath: string) {
    this.logger.debug(`ensureDir`, locId, dirPath);
    const loc = this.findLocation(locId);
    const adapter = this.getAdapter(loc);
    return adapter.ensureDir(loc, dirPath);
  }

  async move(fromLocId: string, fromPath: string, toLocId: string, toPath: string, options?: MoveOptions) {
    this.logger.debug(`move`, fromLocId, fromPath, toLocId, toPath, options);

    const fromLoc = this.findLocation(fromLocId);
    const toLoc = this.findLocation(toLocId);
    const fromAdapter = this.getAdapter(fromLoc);
    const toAdapter = this.getAdapter(toLoc);

    if (fromAdapter.getType() === toAdapter.getType()) {
      return fromAdapter.move(fromLoc, fromPath, toLoc, toPath, options);
    } else {
      throw new Error(`Moving between location types is not implemented`);
    }
  }

  async outputFile(locId: string, filePath: string, data: FileData, options?: WriteFileOptions) {
    this.logger.debug(`outputFile`, locId, filePath, data, options);
    const loc = this.findLocation(locId);
    const adapter = this.getAdapter(loc);
    return adapter.outputFile(loc, filePath, data, options);
  }

  async rename(locId: string, oldPath: string, newPath: string) {
    this.logger.debug(`rename`, locId, oldPath, newPath);
    const loc = this.findLocation(locId);
    const adapter = this.getAdapter(loc);
    return adapter.rename(loc, oldPath, newPath);
  }

  async touch(locId: string, filePath: string) {
    this.logger.debug(`touch`, locId, filePath);
    const loc = this.findLocation(locId);
    const adapter = this.getAdapter(loc);
    return adapter.ensureFile(loc, filePath)
  }

  async writeBytes(locId: string, filePath: string, data: FileData, options?: WriteBytesOptions) {
    this.logger.debug(`writeBytes`, locId, filePath, data, options);
    const loc = this.findLocation(locId);
    const adapter = this.getAdapter(loc);
    return adapter.writeBytes(loc, filePath, data, options);
  }

  async writeFile(locId: string, filePath: string, data: FileData, options?: WriteFileOptions) {
    this.logger.debug(`writeFile`, locId, filePath, data, options);
    const loc = this.findLocation(locId);
    const adapter = this.getAdapter(loc);
    return adapter.writeFile(loc, filePath, data, options);
  }

  // ========== DELETE

  async emptyDir(locId: string, dirPath: string) {
    this.logger.debug(`emptyDir`, locId, dirPath);
    const loc = this.findLocation(locId);
    const adapter = this.getAdapter(loc);
    return adapter.emptyDir(loc, dirPath);
  }

  async remove(locId: string, path: string) {
    this.logger.debug(`remove`, locId, path);
    const loc = this.findLocation(locId);
    const adapter = this.getAdapter(loc);
    return adapter.remove(loc, path);
  }

}
