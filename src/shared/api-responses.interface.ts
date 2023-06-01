import { DirInfo, FileInfo } from "./file-info.interface";
import { FavaLocation } from "./location.interface";

export interface ApiGetLocationsResult {
  locations: FavaLocation[],
}

export interface ApiReadDirResult {
  dirInfo: DirInfo,
}

export interface ApiGetStatsResult {
  fileInfo: FileInfo,
}

export interface ApiPathExistsResult {
  exists: boolean,
}

export type ApiUpdateOp =
  | "append"
  | "copy"
  | "emptyDir"
  | "ensureDir"
  | "ensureFile"
  | "move"
  | "rename"
  | "writeFile"
  | "writeFileChunk"
  | "remove"
  ;

export interface ApiUpdateResult {
  update: ApiUpdateOp,
  done: boolean,
}
