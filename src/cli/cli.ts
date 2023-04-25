#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { FavaServer } from "../core/server";
import { FavaServerInterfaceConfig } from "../core/interfaces/server-config.interface";

const argsParser = yargs(hideBin(process.argv))
  .usage(`USAGE:\nTODO`)
  .help('h').alias('h', 'help')
  .option("http", {
    describe: `Enable or configure the HTTP API`,
  })
  .option("ws", {
    describe: "Enable or configure the websocket API",
  })
  .option("ui", {
    describe: "Enable or configure the web interface",
  })
  .option("port", {
    alias: ["p"],
    describe: "Specify the port (default: 6131)",
    number: true,
  })
  .epilog('(https://github.com/hypcn/fava)')
  ;


async function cli() {

  const argv = await argsParser.argv;
  // console.log("argv", argv);

  // Create the server with settings specified in the CLI args
  const Fava = new FavaServer({
    http: argAsInterfaceConfig(argv.http),
    ws: argAsInterfaceConfig(argv.ws),
    ui: argAsInterfaceConfig(argv.ui),
    port: argv.port,
  });

}

cli();

function argAsInterfaceConfig(arg: any): FavaServerInterfaceConfig {

  if (arg === true) {
    return true;
  }

  if (typeof arg === "string") {
    const config: FavaServerInterfaceConfig = {
      read: arg.toLowerCase().includes("read"),
      write: arg.toLowerCase().includes("write"),
    };
    return config;
  }
  
  return false;

}
