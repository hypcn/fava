import { Logger, SimpleLogger } from "@hypericon/axe";
import { rmSync } from "fs";
import { ensureDirSync } from "fs-extra";
import { join } from "path";
import { FavaLocation } from "../src";
import { IFavaAdapter } from "../src/core/adapters/adapter.interface";
import { FsAdapter } from "../src/core/adapters/fs-adapter";
import { FavaCore } from "../src/core/core";

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
  id: "test-location-one",
  name: "Test Location One",
  root: testLocationRootOne,
};
const testLocationTwo: FavaLocation = {
  type: "FS",
  id: "test-location-two",
  name: "Test Location two",
  root: testLocationRootTwo,
};

describe("Fava core", () => {

  beforeAll(() => {
    ensureDirSync(testLocationRootOne);
    ensureDirSync(testLocationRootTwo);
  });

  afterAll(() => {
    rmSync(testLocationRootOne, { force: true, recursive: true });
    rmSync(testLocationRootTwo, { force: true, recursive: true });
  });

  test("can be created", () => {
    const core = new FavaCore();

    expect(core).toBeDefined();
    expect(core.adapters.length).toBe(0);
    expect(core.locations.length).toBe(0);
  });

  test("can be created with options", () => {

    const adapters: IFavaAdapter<FavaLocation>[] = [
      new FsAdapter(),
    ];

    const locations: FavaLocation[] = [
      testLocationOne,
      testLocationTwo,
    ];

    const core = new FavaCore({
      logger: testLogger as Logger,
      adapters,
      locations,
    });

    expect(core).toBeDefined();
    expect(core.adapters).toMatchObject(adapters);
    expect(core.locations).toMatchObject(locations);

  });

  test("can find locations and adapters", () => {

    const adapters: IFavaAdapter<FavaLocation>[] = [
      new FsAdapter(),
    ];

    const locations: FavaLocation[] = [
      testLocationOne,
      testLocationTwo,
    ];

    const core = new FavaCore({
      logger: testLogger as Logger,
      adapters,
      locations,
    });

    expect(core.getLocations()).toMatchObject(locations);

    expect(core.findLocation(locations[0].id)).toMatchObject(locations[0]);
    expect(() => core.findLocation("unknown-id")).toThrow();

    expect(core.getAdapter(locations[0])).toMatchObject(adapters[0]);
    expect(() => core.getAdapter({ type: "unknown" } as any as FavaLocation)).toThrow();

  });

  test("Implements file management API", async () => {

    const adapter = new FsAdapter();
    const adapters: IFavaAdapter<FavaLocation>[] = [adapter];

    const locations: FavaLocation[] = [
      testLocationOne,
      testLocationTwo,
    ];

    const core = new FavaCore({
      logger: testLogger as Logger,
      adapters,
      locations,
    });

    
    const adapterSpy_append = jest.spyOn(adapter, "append").mockImplementation(async () => undefined);
    const adapterSpy_copy = jest.spyOn(adapter, "copy").mockImplementation(async () => undefined);
    const adapterSpy_emptyDir = jest.spyOn(adapter, "emptyDir").mockImplementation(async () => undefined);
    const adapterSpy_ensureDir = jest.spyOn(adapter, "ensureDir").mockImplementation(async () => undefined);
    const adapterSpy_ensureFile = jest.spyOn(adapter, "ensureFile").mockImplementation(async () => undefined);
    const adapterSpy_exists = jest.spyOn(adapter, "exists").mockImplementation(async () => (undefined as any));
    const adapterSpy_ls = jest.spyOn(adapter, "ls").mockImplementation(async () => (undefined as any));
    const adapterSpy_move = jest.spyOn(adapter, "move").mockImplementation(async () => undefined);
    const adapterSpy_outputFile = jest.spyOn(adapter, "outputFile").mockImplementation(async () => undefined);
    const adapterSpy_readBytes = jest.spyOn(adapter, "readBytes").mockImplementation(async () => (undefined as any));
    const adapterSpy_readFile = jest.spyOn(adapter, "readFile").mockImplementation(async () => (undefined as any));
    const adapterSpy_remove = jest.spyOn(adapter, "remove").mockImplementation(async () => undefined);
    const adapterSpy_rename = jest.spyOn(adapter, "rename").mockImplementation(async () => undefined);
    const adapterSpy_stat = jest.spyOn(adapter, "stat").mockImplementation(async () => (undefined as any));
    const adapterSpy_writeBytes = jest.spyOn(adapter, "writeBytes").mockImplementation(async () => (undefined as any));
    const adapterSpy_writeFile = jest.spyOn(adapter, "writeFile").mockImplementation(async () => undefined);

    await core.append(testLocationOne.id, "file.txt", "data");
    expect(adapterSpy_append).toHaveBeenCalled();

    await core.copy(testLocationOne.id, "file.txt", testLocationTwo.id, "file.txt");
    expect(adapterSpy_copy).toHaveBeenCalled();

    await core.emptyDir(testLocationOne.id, "dir");
    expect(adapterSpy_emptyDir).toHaveBeenCalled();

    await core.ensureDir(testLocationOne.id, "dir");
    expect(adapterSpy_ensureDir).toHaveBeenCalled();

    await core.ensureFile(testLocationOne.id, "file.txt");
    expect(adapterSpy_ensureFile).toHaveBeenCalled();

    await core.exists(testLocationOne.id, "file.txt");
    expect(adapterSpy_exists).toHaveBeenCalled();

    await core.ls(testLocationOne.id, "dir");
    expect(adapterSpy_ls).toHaveBeenCalled();

    await core.mkdir(testLocationOne.id, "dir");
    expect(adapterSpy_ensureDir).toHaveBeenCalled();

    await core.move(testLocationOne.id, "file.txt", testLocationTwo.id, "file.txt");
    expect(adapterSpy_move).toHaveBeenCalled();

    await core.outputFile(testLocationOne.id, "file.txt", "data");
    expect(adapterSpy_outputFile).toHaveBeenCalled();

    await core.readBytes(testLocationOne.id, "file.txt");
    expect(adapterSpy_readBytes).toHaveBeenCalled();

    await core.readDir(testLocationOne.id, "dir");
    expect(adapterSpy_ls).toHaveBeenCalled();

    await core.readFile(testLocationOne.id, "file.txt");
    expect(adapterSpy_readFile).toHaveBeenCalled();

    await core.remove(testLocationOne.id, "file.txt");
    expect(adapterSpy_remove).toHaveBeenCalled();

    await core.rename(testLocationOne.id, "file.txt", "file2.txt");
    expect(adapterSpy_rename).toHaveBeenCalled();

    await core.stat(testLocationOne.id, "dir");
    expect(adapterSpy_stat).toHaveBeenCalled();

    await core.touch(testLocationOne.id, "file.txt");
    expect(adapterSpy_ensureFile).toHaveBeenCalled();

    await core.writeBytes(testLocationOne.id, "file.txt", "data");
    expect(adapterSpy_writeBytes).toHaveBeenCalled();

    await core.writeFile(testLocationOne.id, "file.txt", "data");
    expect(adapterSpy_writeFile).toHaveBeenCalled();

    jest.clearAllMocks();

  });

});
