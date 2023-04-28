
export interface DirInfo {
  dir: FileInfo,
  files: FileInfo[],
}

export interface FileInfo {

  /** The full file path, including the directory path within the location, and full filename with extension */
  fullpath: string,
  /** The directory path within the location, without the filename */
  dirpath: string,
  /** The filename with extension */
  filename: string,
  /** The name of the file, excluding the extension */
  basename: string,
  /** The file extension, if any, including the leading "." */
  ext: string,
  
  /** The mime type of the file, or empty string for folders or unknown extensions */
  mimeType: string,
  /** If the item is a directory */
  isDir: boolean,
  /** The size in bytes */
  size: number,

  /** When the file was created, as millisecond epoch timestamp */
  created: number,
  /** When the contents were modified, as millisecond epoch timestamp */
  modified: number,
  /** When some file metadata changed, as millisecond epoch timestamp */
  changed: number,
  /** When the file was last read, as millisecond epoch timestamp */
  accessed: number,

}
