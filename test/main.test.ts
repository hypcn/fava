import { SimpleLogger } from "@hypericon/axe";
import { rmSync } from "fs";
import { ensureDirSync } from "fs-extra";
import { join } from "path";
import { Fava, FavaLocation } from "../src";
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

describe("Fava", () => {

  beforeAll(() => {
    ensureDirSync(testLocationRootOne);
    ensureDirSync(testLocationRootTwo);
  });

  afterAll(() => {
    rmSync(testLocationRootOne, { force: true, recursive: true });
    rmSync(testLocationRootTwo, { force: true, recursive: true });
  });

  test("can be created without interfaces", async () => {
    const fava = new Fava({
      getLogger: (_) => testLogger,
    });
    await fava.onReady;
    const interfaceInfo = fava.getInterfaceInfo();

    expect(fava).toBeDefined();

    expect(interfaceInfo.http.enabled).toBe(false);
    expect(interfaceInfo.http.canRead).toBe(false);
    expect(interfaceInfo.http.canWrite).toBe(false);

    expect(interfaceInfo.ws.enabled).toBe(false);
    expect(interfaceInfo.ws.canRead).toBe(false);
    expect(interfaceInfo.ws.canWrite).toBe(false);

    expect(interfaceInfo.ui.enabled).toBe(false);
    expect(interfaceInfo.ui.canRead).toBe(false);
    expect(interfaceInfo.ui.canWrite).toBe(false);

    await fava.destroy();
  });

  test("can be created with interfaces", async () => {
    const fava = new Fava({
      getLogger: (_) => testLogger,
      http: true,
      ws: true,
      ui: true,
    });
    await fava.onReady;
    const interfaceInfo = fava.getInterfaceInfo();

    expect(fava).toBeDefined();

    expect(interfaceInfo.http.enabled).toBe(true);
    expect(interfaceInfo.http.canRead).toBe(true);
    expect(interfaceInfo.http.canWrite).toBe(true);

    expect(interfaceInfo.ws.enabled).toBe(true);
    expect(interfaceInfo.ws.canRead).toBe(true);
    expect(interfaceInfo.ws.canWrite).toBe(true);

    expect(interfaceInfo.ui.enabled).toBe(true);
    expect(interfaceInfo.ui.canRead).toBe(true);
    expect(interfaceInfo.ui.canWrite).toBe(true);

    await fava.destroy();
  });

  test("can be created with locations", async () => {

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

    const fava = new Fava({
      getLogger: (_) => testLogger,
      locations: [
        testLocationOne,
        testLocationTwo,
      ],
    });
    await fava.onReady;

    const locations = fava.getLocations();
    expect(locations.length).toBe(2);
    expect(locations).toMatchObject([
      testLocationOne,
      testLocationTwo,
    ]);

    await fava.destroy();
  });

  test("location API works", async () => {
    const fava = new Fava({
      getLogger: (_) => testLogger,
    });
    await fava.onReady;

    // List
    const locations = fava.getLocations();
    expect(locations.length).toBeGreaterThan(0);

    // Find
    const first = locations[0];
    expect(first.id).toBeTruthy();
    expect(fava.findLocation(first.id)).toMatchObject(first);

    // Add
    const oldLength = locations.length;
    const testLocation: FavaLocation = {
      type: "FS",
      id: "testLocation",
      name: "Test Location",
      root: testLocationRootOne,
    };
    fava.addLocation(testLocation);
    expect(fava.getLocations().length).toBe(oldLength + 1);
    expect(fava.findLocation(testLocation.id)).toMatchObject(testLocation);

    // Remove
    fava.removeLocation(testLocation.id);
    expect(fava.getLocations().length).toBe(oldLength);

    await fava.destroy();
  });

  test("file API works", async () => {

    const testLocationOne: FavaLocation = {
      type: "FS",
      id: "testLocationOneId",
      name: "Test Location One",
      root: testLocationRootOne,
    };
    const testLocationTwo: FavaLocation = {
      type: "FS",
      id: "testLocationTwoId",
      name: "Test Location Two",
      root: testLocationRootTwo,
    };

    const fava = new Fava({
      getLogger: (_) => testLogger,
      locations: [
        testLocationOne,
        testLocationTwo,
      ],
    });
    await fava.onReady;

    const core = (fava as any).core as FavaCore;

    const coreSpy_append = jest.spyOn(core, "append").mockImplementation(async () => undefined);
    const coreSpy_copy = jest.spyOn(core, "copy").mockImplementation(async () => undefined);
    const coreSpy_emptyDir = jest.spyOn(core, "emptyDir").mockImplementation(async () => undefined);
    const coreSpy_ensureDir = jest.spyOn(core, "ensureDir").mockImplementation(async () => undefined);
    const coreSpy_ensureFile = jest.spyOn(core, "ensureFile").mockImplementation(async () => undefined);
    const coreSpy_exists = jest.spyOn(core, "exists").mockImplementation(async () => (undefined as any));
    const coreSpy_move = jest.spyOn(core, "move").mockImplementation(async () => undefined);
    const coreSpy_outputFile = jest.spyOn(core, "outputFile").mockImplementation(async () => undefined);
    const coreSpy_readBytes = jest.spyOn(core, "readBytes").mockImplementation(async () => (undefined as any));
    const coreSpy_readDir = jest.spyOn(core, "readDir").mockImplementation(async () => (undefined as any));
    const coreSpy_readFile = jest.spyOn(core, "readFile").mockImplementation(async () => (undefined as any));
    const coreSpy_remove = jest.spyOn(core, "remove").mockImplementation(async () => undefined);
    const coreSpy_rename = jest.spyOn(core, "rename").mockImplementation(async () => undefined);
    const coreSpy_stat = jest.spyOn(core, "stat").mockImplementation(async () => (undefined as any));
    const coreSpy_writeBytes = jest.spyOn(core, "writeBytes").mockImplementation(async () => (undefined as any));
    const coreSpy_writeFile = jest.spyOn(core, "writeFile").mockImplementation(async () => undefined);

    await fava.append(testLocationOne.id, "/file.txt", "data");
    expect(coreSpy_append).toHaveBeenCalled();

    await fava.copy(testLocationOne.id, "test.txt", testLocationTwo.id, "test2.txt");
    expect(coreSpy_copy).toHaveBeenCalled();

    await fava.emptyDir(testLocationOne.id, "dir");
    expect(coreSpy_emptyDir).toHaveBeenCalled();

    await fava.ensureDir(testLocationOne.id, "dir");
    expect(coreSpy_ensureDir).toHaveBeenCalled();

    await fava.ensureFile(testLocationOne.id, "test.txt");
    expect(coreSpy_ensureFile).toHaveBeenCalled();

    await fava.exists(testLocationOne.id, "dir/file.txt");
    expect(coreSpy_exists).toHaveBeenCalled();

    await fava.ls(testLocationOne.id, "dir");
    expect(coreSpy_readDir).toHaveBeenCalled();

    await fava.move(testLocationOne.id, "file.txt", testLocationTwo.id, "dir/file.txt");
    expect(coreSpy_move).toHaveBeenCalled();

    await fava.outputFile(testLocationOne.id, "file.txt", "data");
    expect(coreSpy_outputFile).toHaveBeenCalled();

    await fava.readBytes(testLocationOne.id, "file.txt", { length: 1, position: 1 });
    expect(coreSpy_readBytes).toHaveBeenCalled();

    await fava.readDir(testLocationOne.id, "dir");
    expect(coreSpy_readDir).toHaveBeenCalled();

    await fava.readFile(testLocationOne.id, "file.txt");
    expect(coreSpy_readFile).toHaveBeenCalled();

    await fava.remove(testLocationOne.id, "file.txt");
    expect(coreSpy_remove).toHaveBeenCalled();

    await fava.rename(testLocationOne.id, "file.txt", "renamed.txt");
    expect(coreSpy_rename).toHaveBeenCalled();

    await fava.stat(testLocationOne.id, "file.txt");
    expect(coreSpy_stat).toHaveBeenCalled();

    await fava.writeBytes(testLocationOne.id, "file.txt", "data", { position: 1 });
    expect(coreSpy_writeBytes).toHaveBeenCalled();

    await fava.writeFile(testLocationOne.id, "file.txt", "data");
    expect(coreSpy_writeFile).toHaveBeenCalled();
    
    jest.clearAllMocks();
    await fava.destroy();
  });

});
