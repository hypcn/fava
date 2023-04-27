
export type FavaLocationType =
  | "FS"
  | "Fava"
  // | "S3"
  // | "FTP"
  // | "SFTP"
  // | "Dropbox"
  // | "Onedrive"
  // | "GoogleDrive"
  ;

export type FavaLocation =
  | FavaLocation_FS
  | FavaLocation_Fava
  ;

export interface IFavaLocation {
  type: FavaLocationType,
  /** The unique ID of the location, used to select it */
  id: string,
  /** A human-readable display name */
  name: string,
}

export interface FavaLocation_FS extends IFavaLocation {
  type: "FS",
  id: string,
  name: string,
  root: string,
}

export interface FavaLocation_Fava extends IFavaLocation {
  type: "Fava",
  id: string,
  /** The ID od the target location on the remote Fava server */
  remoteId: string,
  name: string,
  origin: string,
  routePrefix?: string,
}
