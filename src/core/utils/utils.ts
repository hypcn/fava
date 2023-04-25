import { FavaLocationFS } from "../interfaces/location.interface";
import { list } from "drivelist";

export class FavaUtils {

  static async findDefaultLocations(): Promise<FavaLocationFS[]> {

    const fsLocations: FavaLocationFS[] = [];

    const driveList = await list();
     
    for (const drive of driveList) {

      let drivePath = drive.mountpoints.at(0)?.path;
      if (!drivePath) continue;

      drivePath = drivePath.replace(/\\/g, "");

      const driveLabel = drive.mountpoints.at(0)?.label ?? drive.description;

      fsLocations.push({
        type: "FS",
        id: drivePath,
        name: driveLabel,
        root: drivePath,
      });
    }
    
    return fsLocations;

  }

}
