import { SimpleLogger } from "@hypericon/axe";
import { ensureDirSync, rmSync } from "fs-extra";
import fetch from "node-fetch";
import { join } from "path";
import urljoin from "url-join";
import { Fava, FavaLocation, ApiGetLocationsResult, ApiGetStatsResult, ApiPathExistsResult, ApiReadDirResult, ApiUpdateResult } from "../src";
import { FsAdapter } from "../src/core/adapters/fs-adapter";
import { FavaCore } from "../src/core/core";
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
  name: "Test Location two",
  root: testLocationRootTwo,
};

let fava: Fava;

const testFsAdapter = new FsAdapter();

const testAdapterSpies = mockAndSpyOnAdapter(testFsAdapter);

function baseUrl(): string {
  const port = 6131;
  const origin = `http://localhost:${port}`;
  const apiPrefix = "/api";
  return origin + apiPrefix;
}

describe("HTTP API", () => {

  beforeAll(async () => {

    ensureDirSync(testLocationRootOne);
    ensureDirSync(testLocationRootTwo);

    fava = new Fava({
      getLogger: (_) => testLogger,
      locations: [
        testLocationOne,
        testLocationTwo,
      ],
      http: true,
    });
    await fava.onReady;

    const core = (fava as any).core as FavaCore;

    core.adapters = [testFsAdapter];

  });

  afterAll(async () => {

    await fava.destroy();
    jest.clearAllMocks();

    rmSync(testLocationRootOne, { force: true, recursive: true });
    rmSync(testLocationRootTwo, { force: true, recursive: true });

  });

  test("locations - GET", async () => {
    const url = urljoin(baseUrl(), "locations");

    const response = await fetch(url);
    const result = (await response.json()) as ApiGetLocationsResult;

    expect(result.locations).toMatchObject(fava.getLocations());
  });

  test("append - PATCH", async () => {
    const locationId = testLocationOne.id;
    const filePath = "dir/file.txt";
    const data = "data";

    const url = urljoin(baseUrl(), locationId, filePath, `?append`);

    const response = await fetch(url, {
      method: "PATCH",
      headers: {},
      body: data,
    });
    const httpResult = (await response.json()) as ApiUpdateResult;

    const apiResult = await fava.append(locationId, filePath, data);

    expect(testAdapterSpies.append).toHaveBeenCalledTimes(2);
  });

  test("copy - PUT", async () => {
    const fromLocId = testLocationOne.id;
    const fromPath = "dir/file.txt";

    const toLocId = testLocationTwo.id;
    const toPath = "dir/file2.txt";

    const url = urljoin(baseUrl(), toLocId, toPath, `?copyFrom=${fromLocId}/${fromPath}`);

    const response = await fetch(url, { method: "PUT" });
    const httpResult = (await response.json()) as ApiUpdateResult;

    const apiResult = await fava.copy(fromLocId, fromPath, toLocId, toPath);

    expect(testAdapterSpies.copy).toHaveBeenCalledTimes(2);
  });

  test("emptyDir - DELETE", async () => {
    const locationId = testLocationOne.id;
    const dirPath = "dir";

    const url = urljoin(baseUrl(), locationId, dirPath, "?emptyDir");

    const response = await fetch(url, { method: "DELETE" });
    const httpResult = (await response.json()) as ApiUpdateResult;

    const apiResult = await fava.emptyDir(locationId, dirPath);

    expect(testAdapterSpies.emptyDir).toHaveBeenCalledTimes(2);
  });

  test("ensureDir - PUT", async () => {
    const locationId = testLocationOne.id;
    const dirPath = "dir";

    const url = urljoin(baseUrl(), locationId, dirPath, `?ensureDir`);

    const response = await fetch(url, { method: "PUT" });
    const httpResult = (await response.json()) as ApiUpdateResult;

    const apiResult = await fava.ensureDir(locationId, dirPath);

    expect(testAdapterSpies.ensureDir).toHaveBeenCalledTimes(2);
  });

  test("ensureFile - PUT", async () => {
    const locationId = testLocationOne.id;
    const filePath = "dir/file.txt";

    const url = urljoin(baseUrl(), locationId, filePath, `?ensureFile`);

    const response = await fetch(url, { method: "PUT" });
    const httpResult = (await response.json()) as ApiUpdateResult;

    const apiResult = await fava.ensureFile(locationId, filePath);

    expect(testAdapterSpies.ensureFile).toHaveBeenCalledTimes(2);
  });

  test("exists - GET", async () => {
    const locationId = testLocationOne.id;
    const path = "dir";
    const url = urljoin(baseUrl(), locationId, path, "?exists");

    const response = await fetch(url);
    const httpResult = (await response.json()) as ApiPathExistsResult;

    const apiResult = await fava.exists(locationId, path);

    // expect(httpResult).toMatchObject(apiResult);
    expect(testAdapterSpies.exists).toHaveBeenCalledTimes(2);
  });

  test("move - PUT", async () => {
    const fromLocId = testLocationOne.id;
    const fromPath = "dir/file.txt";

    const toLocId = testLocationTwo.id;
    const toPath = "dir/file2.txt";

    const url = urljoin(baseUrl(), toLocId, toPath, `?moveFrom=${fromLocId}/${fromPath}`);

    const response = await fetch(url, { method: "PUT" });
    const httpResult = (await response.json()) as ApiUpdateResult;

    const apiResult = await fava.move(fromLocId, fromPath, toLocId, toPath);

    expect(testAdapterSpies.move).toHaveBeenCalledTimes(2);
  });

  test("readDir - GET", async () => {
    const locationId = testLocationOne.id;
    const path = "dir";
    const url = urljoin(baseUrl(), locationId, path, "?readDir");

    const response = await fetch(url);
    const httpResult = (await response.json()) as ApiReadDirResult;

    const apiResult = await fava.readDir(locationId, path);

    // expect(httpResult.dirInfo).toMatchObject(apiResult);
    expect(testAdapterSpies.readDir).toHaveBeenCalledTimes(2);
  });

  test("readFile - GET", async () => {
    const locationId = testLocationOne.id;
    const filePath = "dir/file.txt";
    const url = urljoin(baseUrl(), locationId, filePath);

    const response = await fetch(url);
    const httpResult = await response.text();

    const apiResult = await fava.readFile(locationId, filePath);

    // expect(httpResult).toMatchObject(apiResult);
    expect(testAdapterSpies.readFile).toHaveBeenCalledTimes(2);
  });

  test("readFileChunk - GET", async () => {
    const locationId = testLocationOne.id;
    const filePath = "dir/file.txt";
    const url = urljoin(baseUrl(), locationId, filePath);

    const response = await fetch(url, {
      headers: {
        "Range": `bytes=1-3`,
      },
    });
    const httpResult = await response.text();

    const apiResult = await fava.readFileChunk(locationId, filePath);

    expect(testAdapterSpies.readFileChunk).toHaveBeenCalledTimes(2);

    const response2 = await fetch(url, {
      headers: {
        "Range": `bytes=1-3, 5-6`,
      },
    });
    expect(response2.ok).toBe(false);
  });

  test("remove - DELETE", async () => {
    const locationId = testLocationOne.id;
    const filePath = "dir/file.txt";

    const url = urljoin(baseUrl(), locationId, filePath);

    const response = await fetch(url, { method: "DELETE" });
    const httpResult = (await response.json()) as ApiUpdateResult;

    const apiResult = await fava.remove(locationId, filePath);

    expect(testAdapterSpies.remove).toHaveBeenCalledTimes(2);
  });

  test("rename - PUT", async () => {
    const locationId = testLocationOne.id;
    const fromPath = "dir/file.txt";
    const toPath = "dir/file2.txt";

    const url = urljoin(baseUrl(), locationId, toPath, `?renameFrom=${fromPath}`);

    const response = await fetch(url, { method: "PUT" });
    const httpResult = (await response.json()) as ApiUpdateResult;

    const apiResult = await fava.rename(locationId, fromPath, toPath);

    expect(testAdapterSpies.rename).toHaveBeenCalledTimes(2);
  });

  test("stats - GET", async () => {
    const locationId = testLocationOne.id;
    const path = "dir";
    const url = urljoin(baseUrl(), locationId, path, "?stats");

    const response = await fetch(url);
    const httpResult = (await response.json()) as ApiGetStatsResult;

    const apiResult = await fava.stat(locationId, path);

    // expect(httpResult).toMatchObject(apiResult);
    expect(testAdapterSpies.stat).toHaveBeenCalledTimes(2);
  });

  test("writeFile - PUT", async () => {
    const locationId = testLocationOne.id;
    const filePath = "dir/file.txt";
    const data = "data";

    const url = urljoin(baseUrl(), locationId, filePath);

    const response = await fetch(url, {
      method: "PUT",
      headers: {},
      body: data,
    });
    const httpResult = (await response.json()) as ApiUpdateResult;

    const apiResult = await fava.writeFile(locationId, filePath, data);

    expect(testAdapterSpies.writeFile).toHaveBeenCalledTimes(2);
  });

  test("writeFileChunk - PATCH", async () => {
    const locationId = testLocationOne.id;
    const filePath = "dir/file.txt";
    const data = "data";

    const url = urljoin(baseUrl(), locationId, filePath);

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        Range: "bytes=1-3",
      },
      body: data,
    });
    const httpResult = (await response.json()) as ApiUpdateResult;

    const apiResult = await fava.writeFileChunk(locationId, filePath, data);

    expect(testAdapterSpies.writeFileChunk).toHaveBeenCalledTimes(2);

    // TODO: check no ranges doesn't work
    // TODO: check multiple ranges doesn't work
  });

});
