import { Logger, SimpleLogger } from "@hypericon/axe";
import { rmSync } from "fs";
import { ensureDirSync } from "fs-extra";
import { join } from "path";
import { FavaLocation } from "../src";
import { IFavaAdapter } from "../src/core/adapters/adapter.interface";
import { FsAdapter } from "../src/core/adapters/fs-adapter";
import { FavaCore } from "../src/core/core";
import { FavaAdapter } from "../src/core/adapters/fava-adapter";

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
  name: "Test Location Two",
  root: testLocationRootTwo,
};
const testLocationFava: FavaLocation = {
  type: "Fava",
  id: "test-location-fava",
  name: "Test Location Fava",
  origin: "http://localhost:6131",
  remoteId: "default",
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

    const fsAdapter = new FsAdapter();
    const favaAdapter = new FavaAdapter();
    const adapters: IFavaAdapter<FavaLocation>[] = [
      fsAdapter,
      favaAdapter,
    ];

    const locations: FavaLocation[] = [
      testLocationOne,
      testLocationTwo,
      testLocationFava,
    ];

    const core = new FavaCore({
      logger: testLogger as Logger,
      adapters,
      locations,
    });

    const adapterSpy_append = jest.spyOn(fsAdapter, "append").mockImplementation(async () => undefined);
    const adapterSpy_copy = jest.spyOn(fsAdapter, "copy").mockImplementation(async () => undefined);
    const adapterSpy_emptyDir = jest.spyOn(fsAdapter, "emptyDir").mockImplementation(async () => undefined);
    const adapterSpy_ensureDir = jest.spyOn(fsAdapter, "ensureDir").mockImplementation(async () => undefined);
    const adapterSpy_ensureFile = jest.spyOn(fsAdapter, "ensureFile").mockImplementation(async () => undefined);
    const adapterSpy_exists = jest.spyOn(fsAdapter, "exists").mockImplementation(async () => (undefined as any));
    const adapterSpy_ls = jest.spyOn(fsAdapter, "ls").mockImplementation(async () => (undefined as any));
    const adapterSpy_move = jest.spyOn(fsAdapter, "move").mockImplementation(async () => undefined);
    const adapterSpy_outputFile = jest.spyOn(fsAdapter, "outputFile").mockImplementation(async () => undefined);
    const adapterSpy_readBytes = jest.spyOn(fsAdapter, "readBytes").mockImplementation(async () => (undefined as any));
    const adapterSpy_readFile = jest.spyOn(fsAdapter, "readFile").mockImplementation(async () => (undefined as any));
    const adapterSpy_remove = jest.spyOn(fsAdapter, "remove").mockImplementation(async () => undefined);
    const adapterSpy_rename = jest.spyOn(fsAdapter, "rename").mockImplementation(async () => undefined);
    const adapterSpy_stat = jest.spyOn(fsAdapter, "stat").mockImplementation(async () => (undefined as any));
    const adapterSpy_writeBytes = jest.spyOn(fsAdapter, "writeBytes").mockImplementation(async () => (undefined as any));
    const adapterSpy_writeFile = jest.spyOn(fsAdapter, "writeFile").mockImplementation(async () => undefined);

    await core.append(testLocationOne.id, "file.txt", "data");
    expect(adapterSpy_append).toHaveBeenCalled();

    await core.copy(testLocationOne.id, "file.txt", testLocationTwo.id, "file.txt");
    expect(adapterSpy_copy).toHaveBeenCalled();
    // TODO: implement copying between location types
    expect(core.copy(testLocationOne.id, "file.txt", testLocationFava.id, "file.txt")).rejects.toThrow();

    await core.emptyDir(testLocationOne.id, "dir");
    expect(adapterSpy_emptyDir).toHaveBeenCalled();

    await core.ensureDir(testLocationOne.id, "dir");
    expect(adapterSpy_ensureDir).toHaveBeenCalled();

    await core.ensureFile(testLocationOne.id, "file.txt");
    expect(adapterSpy_ensureFile).toHaveBeenCalled();

    await core.exists(testLocationOne.id, "file.txt");
    expect(adapterSpy_exists).toHaveBeenCalled();

    // await core.ls(testLocationOne.id, "dir");
    // expect(adapterSpy_ls).toHaveBeenCalled();

    // await core.mkdir(testLocationOne.id, "dir");
    // expect(adapterSpy_ensureDir).toHaveBeenCalled();

    await core.move(testLocationOne.id, "file.txt", testLocationTwo.id, "file.txt");
    expect(adapterSpy_move).toHaveBeenCalled();
    // TODO: implement moving between location types
    expect(core.move(testLocationOne.id, "file.txt", testLocationFava.id, "file.txt")).rejects.toThrow();

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
