import { FavaLogger } from "../interfaces/logger.interface";
import chalk from "chalk";
import { format } from "util";

export type LogLevel = "verbose" | "debug" | "log" | "warn" | "error";

export interface LoggingOptions {
  context?: string,
  level?: boolean,
  timestamp?: boolean,
}

const DEFAULT_LOGGING_OPTIONS: LoggingOptions = {
  level: true,
  timestamp: true,
};

/** @internal */
export class Logger {

  private options: LoggingOptions;

  static logLevel: LogLevel = "log";

  static customLogger: FavaLogger | undefined;

  constructor(opts?: LoggingOptions | string) {
    this.options = JSON.parse(JSON.stringify(DEFAULT_LOGGING_OPTIONS));
    if (opts) {
      if (typeof opts === "string") this.options.context = opts;
      if (typeof opts === "object") this.options = opts;
    }
  }

  verbose(...msgs: any[]) {
    Logger.logMessages("verbose", this.options, ...msgs);
  }

  debug(...msgs: any[]) {
    Logger.logMessages("debug", this.options, ...msgs);
  }

  log(...msgs: any[]) {
    Logger.logMessages("log", this.options, ...msgs);
  }

  warn(...msgs: any[]) {
    Logger.logMessages("warn", this.options, ...msgs);
  }

  error(...msgs: any[]) {
    Logger.logMessages("error", this.options, ...msgs);
  }

  static logMessages(level: LogLevel, opts: LoggingOptions | undefined, ...msgs: any[]) {

    if (this.customLogger) {
      return this.customLogger[level](...msgs);
    }

    if (!this.levelSatisfiesLevel(level, this.logLevel)) return;

    msgs = Logger.addMsgsPrefixes(level, opts, ...msgs)

    const levelColourFn = {
      verbose: chalk.gray,
      debug: chalk.magentaBright,
      log: chalk.cyanBright,
      warn: chalk.yellowBright,
      error: chalk.redBright,
    };
    const colourFn = levelColourFn[level];

    console.log(colourFn(format(...msgs)));

  }

  static addMsgsPrefixes(level: LogLevel, opts: LoggingOptions | undefined, ...msgs: any[]): any[] {

    const options: LoggingOptions = opts ?? DEFAULT_LOGGING_OPTIONS;

    const space = " ";
    if (options.context) {
      msgs.unshift(`${options.context}` + space);
    }
    if (options.level) {
      const lv = level.toUpperCase().padEnd(5, " ");
      msgs.unshift(`${lv}` + space);
    }
    if (options.timestamp) {
      const ts = new Date().toISOString()
      msgs.unshift(`${ts}` + space);
    }

    return msgs;
  }

  static levelSatisfiesLevel(test: LogLevel, against: LogLevel) {
    if (against === "error") {
      if (test === "error") return true;
    } else if (against === "warn") {
      if (test === "error" || test === "warn") return true;
    } else if (against === "log") {
      if (test === "error" || test === "warn" || test === "log") return true;
    } else if (against === "debug") {
      if (test === "error" || test === "warn" || test === "log" || test === "debug") return true;
    } else if (against === "verbose") {
      return true;
    }
    return false;
  }

}
