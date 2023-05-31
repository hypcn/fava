import { Logger, SimpleLogger } from "@hypericon/axe";
import { Fava, FavaLocation, FavaLocation_FS, FavaLocation_Fava } from "../../src";
import { join } from "path";
import { ensureDirSync, rmSync } from "fs-extra";
import { FavaAdapter } from "../../src/core/adapters/fava-adapter";
import { FavaCore } from "../../src/core/core";
import { CoreSpy, mockAndSpyOnCore } from "../test-utils";

const testLogger: SimpleLogger = {
  error: (...mgs: any[]) => { /* noop */ },
  debug: (...mgs: any[]) => { /* noop */ },
  log: (...mgs: any[]) => { /* noop */ },
  warn: (...mgs: any[]) => { /* noop */ },
  verbose: (...mgs: any[]) => { /* noop */ },
};

const fsLocationRoot = join(process.cwd(), "__testLocation1");
const fsLocation: FavaLocation_FS = {
  type: "FS",
  id: "fsLocation",
  name: "FS Location",
  root: fsLocationRoot,
};

const favaLocation: FavaLocation_Fava = {
  type: "Fava",
  id: "favaLocation",
  name: "",
  origin: "http://localhost:6131",
  remoteId: fsLocation.id,
};

let targetFava: Fava;
let targetCore: FavaCore;
let targetCoreSpy: CoreSpy;

describe("Fava Adapter", () => {

  beforeAll(async () => {
    ensureDirSync(fsLocationRoot);

    targetFava = new Fava({
      getLogger: (_) => testLogger,
      http: true,
    });
    await targetFava.onReady;

    targetCore = (targetFava as any).core;
    targetCoreSpy = mockAndSpyOnCore(targetCore);
  });

  afterAll(async () => {
    await targetFava.destroy();
    
    jest.clearAllMocks();

    rmSync(fsLocationRoot, { force: true, recursive: true });
  });

  test("can be created", () => {
    const adapter = new FavaAdapter();

    expect(adapter).toBeDefined();
    expect(adapter.getType()).toBe("Fava");
  });

  test("can be created with options", () => {
    const adapter = new FavaAdapter({
      logger: testLogger as any as Logger,
    });

    expect((adapter as any).logger).toBe(testLogger);
  });

  test("implements append", async () => {
    const adapter = new FavaAdapter();
    await adapter.append(favaLocation, "file.txt", "data");

    expect(targetCoreSpy.append).toHaveBeenCalledTimes(1);
    // expect(targetCoreSpy.append).toHaveBeenCalledWith(fsLocation.id, "file.txt", "data");
  });

  test("implements copy", async () => {
    const adapter = new FavaAdapter();
    await adapter.copy(favaLocation, "file.txt", favaLocation, "file2.txt");

    expect(targetCoreSpy.copy).toHaveBeenCalledTimes(1);
    // expect(targetCoreSpy.copy).toHaveBeenCalledWith(fsLocation.id, "file.txt", fsLocation.id, "file2.txt");
  });

  test("implements emptyDir", async () => {
    const adapter = new FavaAdapter();
    await adapter.emptyDir(favaLocation, "dir");

    expect(targetCoreSpy.emptyDir).toHaveBeenCalledTimes(1);
    // expect(targetCoreSpy.emptyDir).toHaveBeenCalledWith(fsLocation.id, "dir");
  });

  test("implements ensureDir", async () => {
    const adapter = new FavaAdapter();
    await adapter.ensureDir(favaLocation, "dir");

    expect(targetCoreSpy.ensureDir).toHaveBeenCalledTimes(1);
    // expect(targetCoreSpy.ensureDir).toHaveBeenCalledWith(fsLocation.id, "dir");
  });

  test("implements ensureFile", async () => {
    const adapter = new FavaAdapter();
    await adapter.ensureFile(favaLocation, "file.txt");

    expect(targetCoreSpy.ensureFile).toHaveBeenCalledTimes(1);
    // expect(targetCoreSpy.ensureFile).toHaveBeenCalledWith(fsLocation.id, "file.txt");
  });

  test("implements exists", async () => {
    const adapter = new FavaAdapter();
    await adapter.exists(favaLocation, "file.txt");

    expect(targetCoreSpy.exists).toHaveBeenCalledTimes(1);
    // expect(targetCoreSpy.exists).toHaveBeenCalledWith(fsLocation.id, "file.txt");
  });

  test("implements move", async () => {
    const adapter = new FavaAdapter();
    await adapter.move(favaLocation, "file.txt", favaLocation, "file2.txt");

    expect(targetCoreSpy.move).toHaveBeenCalledTimes(1);
    // expect(targetCoreSpy.move).toHaveBeenCalledWith(fsLocation.id, "file.txt", fsLocation.id, "file2.txt");
  });

  test("implements readDir", async () => {
    const adapter = new FavaAdapter();
    await adapter.readDir(favaLocation, "dir");

    expect(targetCoreSpy.readDir).toHaveBeenCalledTimes(1);
    // expect(targetCoreSpy.readDir).toHaveBeenCalledWith(fsLocation.id, "dir");
  });

  test("implements readFile", async () => {
    const adapter = new FavaAdapter();
    await adapter.readFile(favaLocation, "file.txt");

    expect(targetCoreSpy.readFile).toHaveBeenCalledTimes(1);
    // expect(targetCoreSpy.readFile).toHaveBeenCalledWith(fsLocation.id, "file.txt");
  });

  test("implements readFileChunk", async () => {
    const adapter = new FavaAdapter();
    await adapter.readFileChunk(favaLocation, "file.txt", { encoding: "utf8" });

    expect(targetCoreSpy.readFileChunk).toHaveBeenCalledTimes(1);
    // expect(targetCoreSpy.readFileChunk).toHaveBeenCalledWith(fsLocation.id, "file.txt", { encoding: "utf8" });
  });

  test("implements remove", async () => {
    const adapter = new FavaAdapter();
    await adapter.remove(favaLocation, "file.txt");

    expect(targetCoreSpy.remove).toHaveBeenCalledTimes(1);
    // expect(targetCoreSpy.remove).toHaveBeenCalledWith(fsLocation.id, "file.txt");
  });

  test("implements rename", async () => {
    const adapter = new FavaAdapter();
    await adapter.rename(favaLocation, "file.txt", "file2.txt");

    expect(targetCoreSpy.rename).toHaveBeenCalledTimes(1);
    // expect(targetCoreSpy.rename).toHaveBeenCalledWith(fsLocation.id, "file.txt", "file2.txt");
  });

  test("implements stat", async () => {
    const adapter = new FavaAdapter();
    await adapter.stat(favaLocation, "file.txt");

    expect(targetCoreSpy.stat).toHaveBeenCalledTimes(1);
    // expect(targetCoreSpy.stat).toHaveBeenCalledWith(fsLocation.id, "file.txt");
  });

  test("implements writeFile", async () => {
    const adapter = new FavaAdapter();
    await adapter.writeFile(favaLocation, "file.txt", "data");

    expect(targetCoreSpy.writeFile).toHaveBeenCalledTimes(1);
    // expect(targetCoreSpy.writeFile).toHaveBeenCalledWith(fsLocation.id, "file.txt", "data");
  });

  test("implements writeFileChunk", async () => {
    const adapter = new FavaAdapter();
    await adapter.writeFileChunk(favaLocation, "file.txt", "data", { encoding: "utf8", position: 5 });

    expect(targetCoreSpy.writeFileChunk).toHaveBeenCalledTimes(1);
    // expect(targetCoreSpy.writeFileChunk).toHaveBeenCalledWith(fsLocation.id, "file.txt", "data", { encoding: "utf8", position: 5 });
  });


});
