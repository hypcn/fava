import { FavaLocation, FileInfo } from "../shared";
import { FavaClient } from "./client";

export class ListView {

  private client: FavaClient;

  private location: FavaLocation | undefined;

  private _path: string = "/";
  private _dirInfo: FileInfo | undefined = undefined;
  private _files: FileInfo[] | undefined = undefined;

  get path() { return this._path; }
  get dirInfo() { return this._dirInfo; }
  get files() { return this._files; }

  selection: string[] = [];

  // TODO: history enabling a back button

  constructor(client: FavaClient, location: FavaLocation | undefined) {
    this.client = client;
    this.selectLocation(location);
  }

  async navitageTo(path: string) {
    if (!this.location) return;

    console.log(`Navigating to path: ${path} (location: ${this.location.id})`);
    this._path = path;

    const result = await this.client.readDir(this.location.id, this._path);
    this._dirInfo = result.dirInfo.dir;
    this._files = result.dirInfo.files;
  }

  async selectLocation(location: FavaLocation | undefined) {
    console.log(`Select location:`, location);
    this.location = location;
    await this.navitageTo("/");
  }

}
