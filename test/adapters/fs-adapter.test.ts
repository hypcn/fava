import { Logger, SimpleLogger } from "@hypericon/axe";
import { FsAdapter } from "../../src/core/adapters/fs-adapter";
import { join } from "path";
import { FavaLocation } from "../../src";
import { ensureDirSync, remove, rmSync } from "fs-extra";
import { writeFile } from "fs/promises";
import { readFileSync } from "fs";

const testLogger: SimpleLogger = {
  error: (...mgs: any[]) => { /* noop */ },
  debug: (...mgs: any[]) => { /* noop */ },
  log: (...mgs: any[]) => { /* noop */ },
  warn: (...mgs: any[]) => { /* noop */ },
  verbose: (...mgs: any[]) => { /* noop */ },
};

const testLocationRootOne = join(process.cwd(), "__testLocation1");
const testLocationRootTwo = join(process.cwd(), "__testLocation2");

const testLocationOne: FavaLocation = {
  type: "FS",
  id: "testLocationOne",
  name: "Test Location One",
  root: testLocationRootOne,
};
const testLocationTwo: FavaLocation = {
  type: "FS",
  id: "testLocationTwo",
  name: "Test Location Two",
  root: testLocationRootTwo,
};

describe("FS Adapter", () => {

  beforeAll(() => {
    ensureDirSync(testLocationRootOne);
    ensureDirSync(testLocationRootTwo);
  });

  afterAll(() => {
    rmSync(testLocationRootOne, { force: true, recursive: true });
    rmSync(testLocationRootTwo, { force: true, recursive: true });
  });

  test("can be created", () => {
    const adapter = new FsAdapter();

    expect(adapter).toBeDefined();
    expect(adapter.getType()).toBe("FS");
  });

  test("can be created with options", () => {
    const adapter = new FsAdapter({
      logger: testLogger as any as Logger,
    });

    expect((adapter as any).logger).toBe(testLogger);
  });

  test("implements append", async () => {
    const adapter = new FsAdapter();

    const filePath = join(testLocationRootOne, "file.txt");
    const data = "data\n";
    await writeFile(filePath, "", { encoding: "utf8" });

    await adapter.append(testLocationOne, "file.txt", data);
    await adapter.append(testLocationOne, "file.txt", data);

    expect(readFileSync(filePath, { encoding: "utf8" })).toBe(data + data);
  });

  test("implements copy", async () => {
    const adapter = new FsAdapter();

    const filePath1 = join(testLocationRootOne, "file.txt");
    const filePath2 = join(testLocationRootTwo, "file2.txt");
    const data = "data\n";

    await writeFile(filePath1, data, { encoding: "utf8" });
    await remove(filePath2);

    await adapter.copy(testLocationOne, "file.txt", testLocationTwo, "file2.txt");

    expect(readFileSync(filePath2, { encoding: "utf8" })).toBe(data);
  });

});
