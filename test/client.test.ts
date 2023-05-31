import { SimpleLogger } from "@hypericon/axe";
import { rmSync } from "fs";
import { ensureDirSync } from "fs-extra";
import { join } from "path";
import urljoin from "url-join";
import { Fava, FavaLocation } from "../src";
import { FavaClient } from "../src/client";
import { FavaCore } from "../src/core/core";
import { mockAndSpyOnCore } from "./test-utils";

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

describe("Fava client", () => {

  beforeAll(() => {
    ensureDirSync(testLocationRootOne);
    ensureDirSync(testLocationRootTwo);
  });

  afterAll(() => {
    rmSync(testLocationRootOne, { force: true, recursive: true });
    rmSync(testLocationRootTwo, { force: true, recursive: true });
  });

  test("can be created", () => {
    const favaClient = new FavaClient();
    expect(favaClient).toBeDefined();
  });

  test("can be created with options", () => {
    const origin = "http://example.com";
    const routePrefix = "a/route/prefix";

    const favaClient = new FavaClient({
      origin: "http://example.com",
      routePrefix: "a/route/prefix",
    });

    expect(favaClient).toBeDefined();
    expect(favaClient.apiPrefix).toBe(urljoin(origin, routePrefix, "api"));
  });

  test("calls the Fava HTTP API", async () => {

    const fava = new Fava({
      getLogger: (_) => testLogger,
      http: true,
      locations: [
        testLocationOne,
        testLocationTwo,
      ],
    });
    await fava.onReady;

    const favaClient = new FavaClient();

    const core = (fava as any).core as FavaCore;
    const coreSpy = mockAndSpyOnCore(core);

    const getLocationsRes = await favaClient.getLocations();
    expect(getLocationsRes.locations).toMatchObject(fava.getLocations());

    const appendRes = await favaClient.append(testLocationOne.id, "file.txt", { data: "data", mimeType: "text/plain" });
    await fava.append(testLocationOne.id, "file.txt", "data");
    expect(coreSpy.append).toHaveBeenCalledTimes(2);

    const copyRes = await favaClient.copy(testLocationOne.id, "file.txt", testLocationTwo.id, "file2.txt");
    await fava.copy(testLocationOne.id, "file.txt", testLocationTwo.id, "file2.txt");
    expect(coreSpy.copy).toHaveBeenCalledTimes(2);

    const emptyDirRes = await favaClient.emptyDir(testLocationOne.id, "dir");
    await fava.emptyDir(testLocationOne.id, "dir");
    expect(coreSpy.emptyDir).toHaveBeenCalledTimes(2);

    const ensureDirRes = await favaClient.ensureDir(testLocationOne.id, "dir");
    await fava.ensureDir(testLocationOne.id, "dir");
    expect(coreSpy.ensureDir).toHaveBeenCalledTimes(2);

    const ensureFileRes = await favaClient.ensureFile(testLocationOne.id, "file.txt");
    await fava.ensureFile(testLocationOne.id, "file.txt");
    expect(coreSpy.ensureFile).toHaveBeenCalledTimes(2);

    const getStatsRes = await favaClient.stats(testLocationOne.id, "file.txt");
    await fava.stat(testLocationOne.id, "file.txt");
    expect(coreSpy.stat).toHaveBeenCalledTimes(2);

    const moveRes = await favaClient.move(testLocationOne.id, "file.txt", testLocationTwo.id, "file2.txt");
    await fava.move(testLocationOne.id, "file.txt", testLocationTwo.id, "file2.txt");
    expect(coreSpy.move).toHaveBeenCalledTimes(2);

    const pathExistsRes = await favaClient.exists(testLocationOne.id, "file.txt");
    await fava.exists(testLocationOne.id, "file.txt");
    expect(coreSpy.exists).toHaveBeenCalledTimes(2);

    const readDirRes = await favaClient.readDir(testLocationOne.id, "dir");
    await fava.readDir(testLocationOne.id, "dir");
    expect(coreSpy.readDir).toHaveBeenCalledTimes(2);

    const readFileRes = await favaClient.readFile(testLocationOne.id, "file.txt");
    await fava.readFile(testLocationOne.id, "file.txt");
    expect(coreSpy.readFile).toHaveBeenCalledTimes(2);

    // TODO: not implemented
    // It is supposed ot set the range headers, but the API doesn't read them yet
    // const readFilePartRes = await favaClient.readFilePart(testLocationOne.id, "file.txt", {});
    // await fava.readFilePart(testLocationOne.id, "file.txt");
    // expect(coreSpy.readFilePart).toHaveBeenCalledTimes(2);

    const removeRes = await favaClient.remove(testLocationOne.id, "file.txt");
    await fava.remove(testLocationOne.id, "file.txt");
    expect(coreSpy.remove).toHaveBeenCalledTimes(2);

    const renameRes = await favaClient.rename(testLocationOne.id, "file.txt", "file2.txt");
    await fava.rename(testLocationOne.id, "file.txt", "file2.txt");
    expect(coreSpy.rename).toHaveBeenCalledTimes(2);

    const writeFileRes = await favaClient.writeFile(testLocationOne.id, "file.txt", { data: "data", mimeType: "text/plain" });
    await fava.writeFile(testLocationOne.id, "file.txt", "data");
    expect(coreSpy.writeFile).toHaveBeenCalledTimes(2);

    const writeRes = await favaClient.write(testLocationOne.id, "file.txt", { data: "data", mimeType: "text/plain" });
    await fava.writeFileChunk(testLocationOne.id, "file.txt", "data");
    expect(coreSpy.writeFileChunk).toHaveBeenCalledTimes(2);

    await fava.destroy();

  });

});
