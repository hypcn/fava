import { FavaLocation, FileInfo } from "../shared";
import { FavaClient } from "./client";

export class ListView {

  private client: FavaClient;

  private _location: FavaLocation | undefined;
  private _path: string = "/";
  private _dirInfo: FileInfo | undefined = undefined;
  private _files: FileInfo[] | undefined = undefined;

  get location() { return this._location; }
  get path() { return this._path; }
  get dirInfo() { return this._dirInfo; }
  get files() { return this._files; }

  private selected: FileInfo[] = [];
  private selectRangeStart: number | undefined;
  // private selectRangeEnd: number | undefined;

  get selection() { return this.selected ?? []; }

  // TODO: history enabling a back button

  constructor(client: FavaClient, location: FavaLocation | undefined) {
    this.client = client;
    this.selectLocation(location);
  }

  async navitageTo(path: string) {
    if (!this._location) return;

    console.log(`Navigating to path: ${path} (location: ${this._location.id})`);
    this._path = path;
    this._files = undefined;

    const result = await this.client.readDir(this._location.id, this._path);
    this._dirInfo = result.dirInfo.dir;
    this._files = result.dirInfo.files;

    this.sortFiles();
    this.clearSelection();
  }

  async selectLocation(location: FavaLocation | undefined) {
    console.log(`Select location:`, location);
    this._location = location;
    await this.navitageTo("/");
  }

  // TODO: add arguments
  sortFiles() {
    if (!this._files) return;
    this._files.sort((a, b) => {
      if (a.isDir && !b.isDir) return -1;
      if (!a.isDir && b.isDir) return 1;
      return a.filename < b.filename ? -1 : 1;
    });
  }

  select(file: FileInfo) {
    this.selected = [file];
    this.selectRangeStart = this._files?.indexOf(file);
  }

  toggleSelected(file: FileInfo) {
    if (this.selected.includes(file)) {
      this.selected = this.selected.filter(s => s !== file);
    } else {
      this.selected.push(file);
    }
    this.selectRangeStart = this._files?.indexOf(file);
  }

  selectTo(file: FileInfo) {
    if (!this._files) return;

    if (!this.selectRangeStart) {
      this.select(file);
      return;
    }

    const selectRangeEnd = this._files.indexOf(file);
    if (selectRangeEnd < 0) return;

    const from = Math.min(this.selectRangeStart, selectRangeEnd);
    const to = Math.max(this.selectRangeStart, selectRangeEnd);
    this.selected = [];
    for (let i = from; i <= to; i++) {
      this.selected.push(this._files[i]);
    }
  }

  clearSelection() {
    this.selected = [];
    this.selectRangeStart = undefined;
  }

}
