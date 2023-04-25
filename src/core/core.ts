import { CopyOptions, FileData, MoveOptions, ReadBytesOptions, ReadFileOptions, WriteBytesOptions, WriteFileOptions } from "./adapters/adapter.interface";
import { FavaFsAdapter } from "./adapters/fs-adapter";
import { FavaLocation } from "./interfaces/location.interface";
import { Logger } from "./utils/logger";

const fsAdapter = new FavaFsAdapter();

export class FavaCore {

  private logger = new Logger("Core");

  locations: FavaLocation[] = [];

  constructor() {}

  findLocation(locId: string): FavaLocation {
    const location = this.locations.find(loc => loc.id === locId);
    if (!location) throw new Error(`No location with ID: ${locId}`);
    return location;
  }

  async copy(srcLocId: string, srcPath: string, destLocId: string, destPath: string, options?: CopyOptions) {
    const srcLoc = this.findLocation(srcLocId);
    const destLoc = this.findLocation(destLocId);
    return fsAdapter.copy(srcLoc, srcPath, destLoc, destPath, options);
  }


  async dir(locId: string, dirPath: string) {
    const loc = this.findLocation(locId);
    return fsAdapter.ls(loc, dirPath);
  }

  async emptyDir(locId: string, dirPath: string) {
    const loc = this.findLocation(locId);
    return fsAdapter.emptyDir(loc, dirPath);
  }

  async ensureFile(locId: string, filePath: string) {
    const loc = this.findLocation(locId);
    return fsAdapter.ensureFile(loc, filePath);
  }

  async ensureDir(locId: string, dirPath: string) {
    const loc = this.findLocation(locId);
    return fsAdapter.ensureDir(loc, dirPath);
  }

  async ls(locId: string, dirPath: string) {
    const loc = this.findLocation(locId);
    return fsAdapter.ls(loc, dirPath);
  }

  async mkdir(locId: string, dirPath: string) {
    const loc = this.findLocation(locId);
    return fsAdapter.ensureDir(loc, dirPath);
  }

  async move(srcLocId: string, srcPath: string, destLocId: string, destPath: string, options?: MoveOptions) {
    const srcLoc = this.findLocation(srcLocId);
    const destLoc = this.findLocation(destLocId);
    return fsAdapter.move(srcLoc, srcPath, destLoc, destPath, options);
  }

  async outputFile(locId: string, filePath: string, data: FileData, options?: WriteFileOptions) {
    const loc = this.findLocation(locId);
    return fsAdapter.outputFile(loc, filePath, data, options);
  }

  async pathExists(locId: string, path: string): Promise<boolean> {
    const loc = this.findLocation(locId);
    return fsAdapter.pathExists(loc, path);
  }

  async read(locId: string, filePath: string, options?: ReadBytesOptions) {
    const loc = this.findLocation(locId);
    return fsAdapter.read(loc, filePath, options);
  }

  async readDir(locId: string, dirPath: string) {
    const loc = this.findLocation(locId);
    return fsAdapter.ls(loc, dirPath);
  }

  async readFile(locId: string, filePath: string, options?: ReadFileOptions) {
    const loc = this.findLocation(locId);
    return fsAdapter.readFile(loc, filePath, options);
  }

  async remove(locId: string, path: string) {
    const loc = this.findLocation(locId);
    return fsAdapter.remove(loc, path);
  }

  async rename(locId: string, oldPath: string, newPath: string) {
    const loc = this.findLocation(locId);
    return fsAdapter.rename(loc, oldPath, newPath);
  }

  async stat(locId: string, path: string) {
    const loc = this.findLocation(locId);
    return fsAdapter.stat(loc, path);
  }

  async touch(locId: string, filePath: string) {
    const loc = this.findLocation(locId);
    return fsAdapter.ensureFile(loc, filePath)
  }

  async write(locId: string, filePath: string, data: FileData, options?: WriteBytesOptions) {
    const loc = this.findLocation(locId);
    return fsAdapter.write(loc, filePath, data, options);
  }

  async writeFile(locId: string, filePath: string, data: FileData, options?: WriteFileOptions) {
    const loc = this.findLocation(locId);
    return fsAdapter.writeFile(loc, filePath, data, options);
  }

}
