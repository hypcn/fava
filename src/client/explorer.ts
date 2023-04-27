import { FavaLocation, FileInfo } from "../shared";
import { FavaClient } from "./client";

export interface FavaExplorerConfig {
  client: FavaClient,
}

export class FavaExplorer {

  private client: FavaClient;

  location: FavaLocation | undefined;

  currentDir: {
    path: string,
    info: FileInfo,
    files: FileInfo[],
  } | undefined;

  selection: string[] = [];

  constructor(config: FavaExplorerConfig) {
    this.client = config.client;
  }

  navitageTo(path: string) {}

  selectLocation(location: FavaLocation) {}

}
