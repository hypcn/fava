import { DirInfo, FileInfo } from "./file-info.interface";
import { FavaLocation } from "./location.interface";

export interface GetLocationsResult {
  locations: FavaLocation[],
}

export interface ReadDirResult {
  dirInfo: DirInfo,
}

export interface GetStatsResult {
  fileInfo: FileInfo,
}

export interface PathExistsResult {
  exists: boolean,
}

export type UpdateOp =
  | "move"
  | "copy"
  | "rename"
  | "ensureDir"
  | "ensureFile"
  | "write"
  | "append"
  | "write"
  | "emptyDir"
  | "remove";

export interface UpdateResult {
  update: UpdateOp,
  done: boolean,
}
