#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { Fava } from "../core/main";
import { FavaServerInterfaceConfig } from "../core/interfaces/server-config.interface";
import { LogLevel } from "@hypericon/axe";

const argsParser = yargs(hideBin(process.argv))
  .usage(`USAGE:
Enable features with "read" or "write" to configure permissions,
or leave blank for default (read & write)
E.g.: \`fava --http --ws=read --ui=write\``)
  .help('h').alias('h', 'help')
  .option("http", {
    type: "string",
    describe: `Enable or configure the HTTP API`,
  })
  .option("ws", {
    type: "string",
    describe: `Enable or configure the websocket API`,
  })
  .option("ui", {
    type: "string",
    describe: `Enable or configure the web interface`,
  })
  .option("port", {
    alias: ["p"],
    type: "number",
    describe: "Specify the port (default: 6131)",
  })
  .option("loglevel", {
    type: "string",
    describe: `Specify the log level, one of: error, warn, log (default), debug`,
  })
  .epilog('(https://github.com/hypcn/fava)')
  ;


async function cli() {

  const argv = await argsParser.argv;
  // console.log("argv", argv);

  // Create the server with settings specified in the CLI args
  const fava = new Fava({
    http: argAsInterfaceConfig(argv.http),
    ws: argAsInterfaceConfig(argv.ws),
    ui: argAsInterfaceConfig(argv.ui),
    port: argv.port,
    logLevel: argv.loglevel as LogLevel,
  });

}

cli();

function argAsInterfaceConfig(arg: any): FavaServerInterfaceConfig {

  if (arg === true) {
    return true;
  }

  if (typeof arg === "string") {
    const config: FavaServerInterfaceConfig = {
      read: arg.toLowerCase().includes("read") || arg.toLowerCase().includes("write"),
      write: arg.toLowerCase().includes("write"),
    };
    return config;
  }
  
  return false;

}
