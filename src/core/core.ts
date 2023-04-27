import { CopyOptions, FileData, MoveOptions, ReadBytesOptions, ReadFileOptions, WriteBytesOptions, WriteFileOptions } from "./adapters/adapter.interface";
import { FavaFsAdapter } from "./adapters/fs-adapter";
import { FavaLocation } from "../shared";
import { Logger } from "./utils/logger";

const fsAdapter = new FavaFsAdapter();

export class FavaCore {

  private logger = new Logger("Core");

  locations: FavaLocation[] = [];

  constructor() {}

  getLocations(): FavaLocation[] {
    return this.locations;
  }

  findLocation(locId: string): FavaLocation {
    const location = this.locations.find(loc => loc.id === locId);
    if (!location) throw new Error(`No location with ID: ${locId}`);
    return location;
  }

  async append(locId: string, filePath: string, data: FileData, options?: WriteFileOptions) {
    this.logger.debug(`append`, locId, filePath, data, options);
    const loc = this.findLocation(locId);
    return fsAdapter.append(loc, filePath, data, options);
  }

  async copy(srcLocId: string, srcPath: string, destLocId: string, destPath: string, options?: CopyOptions) {
    this.logger.debug(`copy`, srcLocId, srcPath, destLocId, destPath, options);
    const srcLoc = this.findLocation(srcLocId);
    const destLoc = this.findLocation(destLocId);
    return fsAdapter.copy(srcLoc, srcPath, destLoc, destPath, options);
  }

  async dir(locId: string, dirPath: string) {
    this.logger.debug(`dir`, locId, dirPath);
    const loc = this.findLocation(locId);
    return fsAdapter.ls(loc, dirPath);
  }

  async emptyDir(locId: string, dirPath: string) {
    this.logger.debug(`emptyDir`, locId, dirPath);
    const loc = this.findLocation(locId);
    return fsAdapter.emptyDir(loc, dirPath);
  }

  async ensureFile(locId: string, filePath: string) {
    this.logger.debug(`ensureFile`, locId, filePath);
    const loc = this.findLocation(locId);
    return fsAdapter.ensureFile(loc, filePath);
  }

  async ensureDir(locId: string, dirPath: string) {
    this.logger.debug(`ensureDir`, locId, dirPath);
    const loc = this.findLocation(locId);
    return fsAdapter.ensureDir(loc, dirPath);
  }

  async ls(locId: string, dirPath: string) {
    this.logger.debug(`ls`, locId, dirPath);
    const loc = this.findLocation(locId);
    return fsAdapter.ls(loc, dirPath);
  }

  async mkdir(locId: string, dirPath: string) {
    this.logger.debug(`mkdir`, locId, dirPath);
    const loc = this.findLocation(locId);
    return fsAdapter.ensureDir(loc, dirPath);
  }

  async move(srcLocId: string, srcPath: string, destLocId: string, destPath: string, options?: MoveOptions) {
    this.logger.debug(`move`, srcLocId, srcPath, destLocId, destPath, options);
    const srcLoc = this.findLocation(srcLocId);
    const destLoc = this.findLocation(destLocId);
    return fsAdapter.move(srcLoc, srcPath, destLoc, destPath, options);
  }

  async outputFile(locId: string, filePath: string, data: FileData, options?: WriteFileOptions) {
    this.logger.debug(`outputFile`, locId, filePath, data, options);
    const loc = this.findLocation(locId);
    return fsAdapter.outputFile(loc, filePath, data, options);
  }

  async pathExists(locId: string, path: string): Promise<boolean> {
    this.logger.debug(`pathExists`, locId, path);
    const loc = this.findLocation(locId);
    return fsAdapter.pathExists(loc, path);
  }

  async read(locId: string, filePath: string, options?: ReadBytesOptions) {
    this.logger.debug(`read`, locId, filePath, options);
    const loc = this.findLocation(locId);
    return fsAdapter.read(loc, filePath, options);
  }

  async readDir(locId: string, dirPath: string) {
    this.logger.debug(`readDir`, locId, dirPath);
    const loc = this.findLocation(locId);
    return fsAdapter.ls(loc, dirPath);
  }

  async readFile(locId: string, filePath: string, options?: ReadFileOptions) {
    this.logger.debug(`readFile`, locId, filePath, options);
    const loc = this.findLocation(locId);
    return fsAdapter.readFile(loc, filePath, options);
  }

  async remove(locId: string, path: string) {
    this.logger.debug(`remove`, locId, path);
    const loc = this.findLocation(locId);
    return fsAdapter.remove(loc, path);
  }

  async rename(locId: string, oldPath: string, newPath: string) {
    this.logger.debug(`rename`, locId, oldPath, newPath);
    const loc = this.findLocation(locId);
    return fsAdapter.rename(loc, oldPath, newPath);
  }

  async stat(locId: string, path: string) {
    this.logger.debug(`stat`, locId, path);
    const loc = this.findLocation(locId);
    return fsAdapter.stat(loc, path);
  }

  async touch(locId: string, filePath: string) {
    this.logger.debug(`touch`, locId, filePath);
    const loc = this.findLocation(locId);
    return fsAdapter.ensureFile(loc, filePath)
  }

  async write(locId: string, filePath: string, data: FileData, options?: WriteBytesOptions) {
    this.logger.debug(`write`, locId, filePath, data, options);
    const loc = this.findLocation(locId);
    return fsAdapter.write(loc, filePath, data, options);
  }

  async writeFile(locId: string, filePath: string, data: FileData, options?: WriteFileOptions) {
    this.logger.debug(`writeFile`, locId, filePath, data, options);
    const loc = this.findLocation(locId);
    return fsAdapter.writeFile(loc, filePath, data, options);
  }

}
