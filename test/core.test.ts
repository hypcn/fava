import { Logger, SimpleLogger } from "@hypericon/axe";
import { rmSync } from "fs";
import { ensureDirSync } from "fs-extra";
import { join } from "path";
import { FavaLocation } from "../src";
import { IFavaAdapter } from "../src/core/adapters/adapter.interface";
import { FsAdapter } from "../src/core/adapters/fs-adapter";
import { FavaCore } from "../src/core/core";
import { FavaAdapter } from "../src/core/adapters/fava-adapter";
import { mockAndSpyOnAdapter } from "./test-utils";

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

    const adapterSpy = mockAndSpyOnAdapter(fsAdapter);

    await core.append(testLocationOne.id, "file.txt", "data");
    expect(adapterSpy.append).toHaveBeenCalled();

    await core.copy(testLocationOne.id, "file.txt", testLocationTwo.id, "file.txt");
    expect(adapterSpy.copy).toHaveBeenCalled();
    // TODO: implement copying between location types
    expect(core.copy(testLocationOne.id, "file.txt", testLocationFava.id, "file.txt")).rejects.toThrow();

    await core.emptyDir(testLocationOne.id, "dir");
    expect(adapterSpy.emptyDir).toHaveBeenCalled();

    await core.ensureDir(testLocationOne.id, "dir");
    expect(adapterSpy.ensureDir).toHaveBeenCalled();

    await core.ensureFile(testLocationOne.id, "file.txt");
    expect(adapterSpy.ensureFile).toHaveBeenCalled();

    await core.exists(testLocationOne.id, "file.txt");
    expect(adapterSpy.exists).toHaveBeenCalled();

    await core.move(testLocationOne.id, "file.txt", testLocationTwo.id, "file.txt");
    expect(adapterSpy.move).toHaveBeenCalled();
    // TODO: implement moving between location types
    expect(core.move(testLocationOne.id, "file.txt", testLocationFava.id, "file.txt")).rejects.toThrow();

    await core.outputFile(testLocationOne.id, "file.txt", "data");
    expect(adapterSpy.outputFile).toHaveBeenCalled();

    await core.readBytes(testLocationOne.id, "file.txt");
    expect(adapterSpy.readBytes).toHaveBeenCalled();

    await core.readDir(testLocationOne.id, "dir");
    expect(adapterSpy.ls).toHaveBeenCalled();

    await core.readFile(testLocationOne.id, "file.txt");
    expect(adapterSpy.readFile).toHaveBeenCalled();

    await core.remove(testLocationOne.id, "file.txt");
    expect(adapterSpy.remove).toHaveBeenCalled();

    await core.rename(testLocationOne.id, "file.txt", "file2.txt");
    expect(adapterSpy.rename).toHaveBeenCalled();

    await core.stat(testLocationOne.id, "dir");
    expect(adapterSpy.stat).toHaveBeenCalled();

    await core.touch(testLocationOne.id, "file.txt");
    expect(adapterSpy.ensureFile).toHaveBeenCalled();

    await core.writeBytes(testLocationOne.id, "file.txt", "data");
    expect(adapterSpy.writeBytes).toHaveBeenCalled();

    await core.writeFile(testLocationOne.id, "file.txt", "data");
    expect(adapterSpy.writeFile).toHaveBeenCalled();

    jest.clearAllMocks();

  });

});
