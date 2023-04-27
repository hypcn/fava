import { FavaLocation } from "../shared";
import { FavaClient } from "./client";

export interface FavaExplorerConfig {
  client: FavaClient,
}

export class FavaExplorer {

  private client: FavaClient;

  location: FavaLocation | undefined;

  currentPath: string | undefined;

  constructor(config: FavaExplorerConfig) {
    this.client = config.client;
  }

  navitageTo(path: string) {}

  selectLocation(location: FavaLocation) {}

}
