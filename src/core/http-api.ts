import express, { Express } from "express";
import urlJoin from "url-join";
import { list } from "drivelist";

// const router = express.Router();

// // middleware that is specific to this router
// router.use((req, res, next) => {
//   console.log('Time: ', Date.now())
//   next()
// })
// // define the home page route
// router.get('/', (req, res) => {
//   res.send('Birds home page')
// })
// // define the about route
// router.get('/about', (req, res) => {
//   res.send('About birds')
// })

// module.exports = router;

export function configureHttpApi(app: Express, options: {
  routePrefix: string,
}) {

  const route = options.routePrefix + "/:location/*";

  app.get(route, (req, res) => {

    // const driveList = await list();
    // console.log(driveList);

    // req.body
    // req.headers
    req.originalUrl
    req.path
    req.url
    res.json({
      route,
      locationParam: req.params.location,
      reqMethod: req.method,
      reqOriginalUrl: req.originalUrl,
      reqPath: req.path,
      reqUrl: req.url,
      // reqRoute: req.route,
      // driveList,
    });

  });

}

const r = {

  "route": "/api/:location/*",
  "locationParam": "locationwow",
  "reqMethod": "GET",
  "reqOriginalUrl": "/api/locationwow/bum/whole/piss.txt",
  "reqPath": "/api/locationwow/bum/whole/piss.txt",
  "reqUrl": "/api/locationwow/bum/whole/piss.txt",

  "driveList": [
    {
      "enumerator": "USBSTOR",
      "busType": "USB",
      "busVersion": "2.0",
      "device": "\\\\.\\PhysicalDrive3",
      "devicePath": null,
      "raw": "\\\\.\\PhysicalDrive3",
      "description": "Samsung Flash Drive FIT USB Device",
      "partitionTableType": "mbr",
      "error": null,
      "size": 256641603584,
      "blockSize": 512,
      "logicalBlockSize": 512,
      "mountpoints": [{ "path": "F:\\" }],
      "isReadOnly": false,
      "isSystem": false,
      "isVirtual": false,
      "isRemovable": true,
      "isCard": false,
      "isSCSI": false,
      "isUSB": true,
      "isUAS": false
    },
    {
      "enumerator": "SCSI",
      "busType": "SATA",
      "busVersion": "2.0",
      "device": "\\\\.\\PhysicalDrive1",
      "devicePath": null,
      "raw": "\\\\.\\PhysicalDrive1",
      "description": "Samsung SSD 870 EVO 2TB",
      "partitionTableType": "gpt",
      "error": null,
      "size": 2000398934016,
      "blockSize": 512,
      "logicalBlockSize": 512,
      "mountpoints": [{ "path": "H:\\" }],
      "isReadOnly": false,
      "isSystem": false,
      "isVirtual": false,
      "isRemovable": true,
      "isCard": false,
      "isSCSI": true,
      "isUSB": false,
      "isUAS": false
    },
    {
      "enumerator": "SCSI",
      "busType": "INVALID",
      "busVersion": "2.0",
      "device": "\\\\.\\PhysicalDrive2",
      "devicePath": null,
      "raw": "\\\\.\\PhysicalDrive2",
      "description": "Samsung SSD 970 EVO 1TB",
      "partitionTableType": "gpt",
      "error": null,
      "size": 1000204886016,
      "blockSize": 4096,
      "logicalBlockSize": 512,
      "mountpoints": [{ "path": "C:\\" }],
      "isReadOnly": false,
      "isSystem": true,
      "isVirtual": false,
      "isRemovable": false,
      "isCard": false,
      "isSCSI": true,
      "isUSB": false,
      "isUAS": false
    },
    {
      "enumerator": "SCSI",
      "busType": "SATA",
      "busVersion": "2.0",
      "device": "\\\\.\\PhysicalDrive0",
      "devicePath": null,
      "raw": "\\\\.\\PhysicalDrive0",
      "description": "Samsung SSD 860 EVO 2TB",
      "partitionTableType": "gpt",
      "error": null,
      "size": 2000398934016,
      "blockSize": 512,
      "logicalBlockSize": 512,
      "mountpoints": [{ "path": "G:\\" },
      { "path": "O:\\" }],
      "isReadOnly": false,
      "isSystem": false,
      "isVirtual": false,
      "isRemovable": true,
      "isCard": false,
      "isSCSI": true,
      "isUSB": false,
      "isUAS": false
    }
  ]
}