
export type FavaLocationType =
  | "FS"
  | "S3"
  | "FTP"
  | "SFTP"
  | "Dropbox"
  | "Onedrive"
  | "GoogleDrive"
  ;

export type FavaLocation =
  | FavaLocationFS
  ;

export interface FavaLocationBase {
  type: FavaLocationType,
  id: string,
  name: string,
}

export interface FavaLocationFS extends FavaLocationBase {
  type: "FS",
  id: string,
  name: string,
  root: string,
}
