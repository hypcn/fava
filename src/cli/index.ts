#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const argsParser = yargs(hideBin(process.argv))
  .usage(`USAGE:\nTODO`)
  .help('h').alias('h', 'help')
  .option("image", {
    boolean: true,
    alias: ["img", "i"],
    describe: "Use the prompt to generate an image instead of a chat message",
  })
  .option("count", {
    alias: ["n"],
    describe: "Specify how many images to generate",
  })
  .epilog('(https://github.com/hypericon/fava)')
  ;


async function cli() {

  const argv = await argsParser.argv;

  // TODO: create server based on args

}

cli();
