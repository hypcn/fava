import { SimpleLogger } from "@hypericon/axe";
import { rmSync } from "fs";
import { ensureDirSync, pathExists, remove } from "fs-extra";
import { join } from "path";
import urljoin from "url-join";
import { Fava, FavaLocation, FileInfo } from "../src";
import { FavaClient } from "../src/client";
import fetch from "node-fetch";
import { mkdir, readFile, readdir, writeFile } from "fs/promises";
import { backslashToForward } from "../src/core/utils";

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

let fava: Fava;

describe("Fava client", () => {

  beforeAll(async () => {
    ensureDirSync(testLocationRootOne);
    ensureDirSync(testLocationRootTwo);

    fava = new Fava({
      getLogger: (_) => testLogger,
      http: true,
      locations: [
        testLocationOne,
        testLocationTwo,
      ],
    });
    await fava.onReady;
  });

  afterAll(async () => {
    await fava.destroy();
    
    rmSync(testLocationRootOne, { force: true, recursive: true });
    rmSync(testLocationRootTwo, { force: true, recursive: true });
  });

  test("can be created", () => {
    const favaClient = new FavaClient({
      fetch: fetch as any,
    });
    expect(favaClient).toBeDefined();
  });

  test("can be created with options", () => {
    const origin = "http://example.com";
    const routePrefix = "a/route/prefix";

    const favaClient = new FavaClient({
      fetch: fetch as any,
      origin: "http://example.com",
      routePrefix: "a/route/prefix",
    });

    expect(favaClient).toBeDefined();
    expect(favaClient.apiPrefix).toBe(urljoin(origin, routePrefix, "api"));
  });

  test("calls API: get location", async () => {
    const favaClient = new FavaClient({ fetch: fetch as any });

    const getLocationsRes = await favaClient.getLocations();
    expect(getLocationsRes.locations).toMatchObject(fava.getLocations());
  });

  test("client calls API: append", async () => {
    const favaClient = new FavaClient({ fetch: fetch as any });

    const filePath = "file.txt";
    const locationFilePath = join(testLocationRootOne, filePath);
    
    // Setup target file
    const data1 = "data1\n";
    await writeFile(locationFilePath, data1);

    // Call the client's append method
    const data2 = "data2\n";
    const appendResult1 = await favaClient.append(testLocationOne.id, filePath, data2);
    
    // Check the append call had the intended effect
    const fileContents1 = await readFile(locationFilePath, "utf-8")
    expect(fileContents1).toBe(data1 + data2);

    // Call the client's append method with an explicit mime type
    const data3 = "data3\n";
    const appendResult2 = await favaClient.append(testLocationOne.id, filePath, data3, { mimeType: "text/plain" });

    // Check the append call had the intended effect
    const fileContents = await readFile(locationFilePath, "utf-8")
    expect(fileContents).toBe(data1 + data2 + data3);
  });

  test("client calls API: copy", async () => {
    const favaClient = new FavaClient({ fetch: fetch as any });

    const sourceFilePath = "source.txt";
    const targetFilePath = "target.txt";
    const locationSourceFilePath = join(testLocationRootOne, sourceFilePath);
    const locationTargetFilePath = join(testLocationRootOne, targetFilePath);

    // Setup source file
    const data = "This is the content of the source file.";
    await writeFile(locationSourceFilePath, data);

    // Call the client's copy method without overwrite option
    const copyResult1 = await favaClient.copy(testLocationOne.id, sourceFilePath, testLocationOne.id, targetFilePath);

    // Check the copy call had the intended effect
    const sourceFileContents1 = await readFile(locationSourceFilePath, "utf-8");
    const targetFileContents1 = await readFile(locationTargetFilePath, "utf-8");
    expect(sourceFileContents1).toBe(data);
    expect(targetFileContents1).toBe(data);

    // Setup updated source file
    const updatedData = "This is the updated content of the source file.";
    await writeFile(locationSourceFilePath, updatedData);

    // Call the client's copy method with overwrite option
    const copyResult2 = await favaClient.copy(testLocationOne.id, sourceFilePath, testLocationOne.id, targetFilePath, { overwrite: true });

    // Check the copy call had the intended effect
    const sourceFileContents2 = await readFile(locationSourceFilePath, "utf-8");
    const targetFileContents2 = await readFile(locationTargetFilePath, "utf-8");
    expect(sourceFileContents2).toBe(updatedData);
    expect(targetFileContents2).toBe(updatedData);
  });

  test("client calls API: emptyDir", async () => {
    const favaClient = new FavaClient({ fetch: fetch as any });

    const dirPath = "testDir";
    const locationDirPath = join(testLocationRootOne, dirPath);

    // Setup files and subdirectories in the directory
    await mkdir(locationDirPath);
    await writeFile(join(locationDirPath, "file1.txt"), "File 1 content");
    await writeFile(join(locationDirPath, "file2.txt"), "File 2 content");
    await mkdir(join(locationDirPath, "subDir"));
    await writeFile(join(locationDirPath, "subDir", "file3.txt"), "File 3 content");

    // Call the client's emptyDir method
    const emptyDirResult = await favaClient.emptyDir(testLocationOne.id, dirPath);

    // Check the emptyDir call had the intended effect
    const filesAfterEmptyDir = await readdir(locationDirPath);
    expect(filesAfterEmptyDir).toHaveLength(0);
  });

  test("client calls API: ensureDir", async () => {
    const favaClient = new FavaClient({ fetch: fetch as any });

    const dirPath = "testDir";
    const locationDirPath = join(testLocationRootOne, dirPath);
    await remove(locationDirPath);

    // Check if the directory does not exist initially
    const dirExistsBefore = await pathExists(locationDirPath);
    expect(dirExistsBefore).toBe(false);

    // Call the client's ensureDir method
    const ensureDirResult = await favaClient.ensureDir(testLocationOne.id, dirPath);

    // Check the ensureDir call had the intended effect
    const dirExistsAfter = await pathExists(locationDirPath);
    expect(dirExistsAfter).toBe(true);

    // Call the client's ensureDir method again to ensure it doesn't throw an error when the directory already exists
    const ensureDirResultAgain = await favaClient.ensureDir(testLocationOne.id, dirPath);
  });

  test("client calls API: ensureFile", async () => {
    const favaClient = new FavaClient({ fetch: fetch as any });

    const filePath = "testFile.txt";
    const locationFilePath = join(testLocationRootOne, filePath);
    await remove(locationFilePath);

    // Check if the file does not exist initially
    const fileExistsBefore = await pathExists(locationFilePath);
    expect(fileExistsBefore).toBe(false);

    // Call the client's ensureFile method
    const ensureFileResult = await favaClient.ensureFile(testLocationOne.id, filePath);

    // Check the ensureFile call had the intended effect
    const fileExistsAfter = await pathExists(locationFilePath);
    expect(fileExistsAfter).toBe(true);

    // Call the client's ensureFile method again to ensure it doesn't throw an error when the file already exists
    const ensureFileResultAgain = await favaClient.ensureFile(testLocationOne.id, filePath);
  });

  test("client calls API: stats", async () => {
    const favaClient = new FavaClient({ fetch: fetch as any });

    const filePath = "testFile.txt";
    const locationFilePath = join(testLocationRootOne, filePath);
    const dirPath = "testDir";
    const locationDirPath = join(testLocationRootOne, dirPath);
    const nonExistentFilePath = "nonExistentFile.txt";

    // Setup a file and a directory
    await writeFile(locationFilePath, "File content");
    await remove(locationDirPath);
    await mkdir(locationDirPath);

    // Call the client's stats method for a file
    const fileStatsResult: { fileInfo: FileInfo } = await favaClient.stats(testLocationOne.id, filePath);
    expect(fileStatsResult.fileInfo.fullpath).toBe(filePath);
    expect(fileStatsResult.fileInfo.dirpath).toBe("");
    expect(fileStatsResult.fileInfo.filename).toBe("testFile.txt");
    expect(fileStatsResult.fileInfo.basename).toBe("testFile");
    expect(fileStatsResult.fileInfo.ext).toBe(".txt");
    expect(fileStatsResult.fileInfo.mimeType).toBe("text/plain");
    expect(fileStatsResult.fileInfo.isDir).toBe(false);
    expect(fileStatsResult.fileInfo.size).toBeGreaterThan(0);

    // Call the client's stats method for a directory
    const dirStatsResult: { fileInfo: FileInfo } = await favaClient.stats(testLocationOne.id, dirPath);
    expect(dirStatsResult.fileInfo.fullpath).toBe(dirPath);
    expect(dirStatsResult.fileInfo.dirpath).toBe("");
    expect(dirStatsResult.fileInfo.filename).toBe("testDir");
    expect(dirStatsResult.fileInfo.basename).toBe("testDir");
    expect(dirStatsResult.fileInfo.ext).toBe("");
    expect(dirStatsResult.fileInfo.mimeType).toBe("");
    expect(dirStatsResult.fileInfo.isDir).toBe(true);
    expect(dirStatsResult.fileInfo.size).toBe(0);

    // Call the client's stats method for a file that doesn't exist (should throw)
    try {
      await favaClient.stats(testLocationOne.id, nonExistentFilePath);
    } catch (error) {
      expect(error).toBeDefined();
      expect((error as any).message).toContain("not found");
    }
  });

  test("client calls API: move", async () => {
    const favaClient = new FavaClient({ fetch: fetch as any });

    const sourceFilePath = "sourceFile.txt";
    const targetFilePath = "targetFile.txt";
    const sourceDirPath = "sourceDir";
    const targetDirPath = "targetDir";
    const nonExistentFilePath = "nonExistentFile.txt";
    const locationSourceFilePath = join(testLocationRootOne, sourceFilePath);
    const locationTargetFilePath = join(testLocationRootOne, targetFilePath);
    const locationSourceDirPath = join(testLocationRootOne, sourceDirPath);
    const locationTargetDirPath = join(testLocationRootOne, targetDirPath);

    // Setup a file and a directory
    await writeFile(locationSourceFilePath, "File content");
    await mkdir(locationSourceDirPath);

    // Call the client's move method for a file
    await favaClient.move(testLocationOne.id, sourceFilePath, testLocationOne.id, targetFilePath);
    const fileMoved = await pathExists(locationTargetFilePath);
    expect(fileMoved).toBe(true);

    // Call the client's move method for a directory
    await favaClient.move(testLocationOne.id, sourceDirPath, testLocationOne.id, targetDirPath);
    const dirMoved = await pathExists(locationTargetDirPath);
    expect(dirMoved).toBe(true);

    // Call the client's move method for a file that doesn't exist (should throw)
    try {
      await favaClient.move(testLocationOne.id, nonExistentFilePath, testLocationOne.id, targetFilePath);
    } catch (error) {
      expect(error).toBeDefined();
      expect((error as any).message).toContain("not found");
    }
  });

  test("client calls API: exists", async () => {
    const favaClient = new FavaClient({ fetch: fetch as any });

    const filePath = "testFile.txt";
    const dirPath = "testDir";
    const nonExistentFilePath = "nonExistentFile.txt";
    const locationFilePath = join(testLocationRootOne, filePath);
    const locationDirPath = join(testLocationRootOne, dirPath);

    // Setup a file and a directory
    await writeFile(locationFilePath, "File content");
    await remove(locationDirPath);
    await mkdir(locationDirPath);

    // Call the client's exists method for a file
    const fileExistsResult: { exists: boolean } = await favaClient.exists(testLocationOne.id, filePath);
    expect(fileExistsResult.exists).toBe(true);

    // Call the client's exists method for a directory
    const dirExistsResult: { exists: boolean } = await favaClient.exists(testLocationOne.id, dirPath);
    expect(dirExistsResult.exists).toBe(true);

    // Call the client's exists method for a file that doesn't exist
    const nonExistentFileExistsResult: { exists: boolean } = await favaClient.exists(testLocationOne.id, nonExistentFilePath);
    expect(nonExistentFileExistsResult.exists).toBe(false);
  });

  test("client calls API: readDir", async () => {
    const favaClient = new FavaClient({ fetch: fetch as any });

    const dirPath = "testDir";
    const filePath1 = "file1.txt";
    const filePath2 = "file2.txt";
    const locationDirPath = join(testLocationRootOne, dirPath);
    const locationFilePath1 = join(locationDirPath, filePath1);
    const locationFilePath2 = join(locationDirPath, filePath2);

    // Setup a directory with two files
    await remove(locationDirPath);
    await mkdir(locationDirPath);
    await writeFile(locationFilePath1, "File 1 content");
    await writeFile(locationFilePath2, "File 2 content");

    // Call the client's readDir method
    const readDirResult = await favaClient.readDir(testLocationOne.id, dirPath);

    // Verify the returned directory information
    expect(readDirResult.dirInfo.dir.fullpath).toBe(dirPath);
    expect(readDirResult.dirInfo.dir.isDir).toBe(true);
    expect(readDirResult.dirInfo.files.length).toBe(2);

    // Verify the returned file information
    const file1Info = readDirResult.dirInfo.files.find((file) => file.filename === filePath1)!;
    const file2Info = readDirResult.dirInfo.files.find((file) => file.filename === filePath2)!;

    expect(file1Info).toBeDefined();
    expect(file1Info.fullpath).toBe(backslashToForward(join(dirPath, filePath1)));
    expect(file1Info.basename).toBe("file1");
    expect(file1Info.ext).toBe(".txt");
    expect(file1Info.mimeType).toBe("text/plain");
    expect(file1Info.isDir).toBe(false);

    expect(file2Info).toBeDefined();
    expect(file2Info.fullpath).toBe(backslashToForward(join(dirPath, filePath2)));
    expect(file2Info.basename).toBe("file2");
    expect(file2Info.ext).toBe(".txt");
    expect(file2Info.mimeType).toBe("text/plain");
    expect(file2Info.isDir).toBe(false);
  });

  test("client calls API: readFile", async () => {
    const favaClient = new FavaClient({ fetch: fetch as any });

    const dirPath = "testDir";
    const textFilePath = "file1.txt";
    const binaryFilePath = "file2.bin";
    const locationDirPath = join(testLocationRootOne, dirPath);
    const locationTextFilePath = join(locationDirPath, textFilePath);
    const locationBinaryFilePath = join(locationDirPath, binaryFilePath);

    const textFileContent = "File 1 content";
    const binaryFileContent = new Uint8Array([1, 2, 3, 4, 5]);

    // Setup a directory with a text file and a binary file
    await remove(locationDirPath);
    await mkdir(locationDirPath);
    await writeFile(locationTextFilePath, textFileContent);
    await writeFile(locationBinaryFilePath, binaryFileContent);

    // Call the client's readFile method for a text file
    const readTextFileResult = await favaClient.readFile(testLocationOne.id, join(dirPath, textFilePath));
    expect(readTextFileResult).toBeInstanceOf(String);
    expect(readTextFileResult).toBe(textFileContent);

    // Call the client's readFile method for a binary file
    const readBinaryFileResult = await favaClient.readFile(testLocationOne.id, join(dirPath, binaryFilePath));
    expect(readBinaryFileResult).toBeInstanceOf(Uint8Array);
    expect(readBinaryFileResult).toEqual(binaryFileContent);

    // Call the client's readFile method for a text file with returnAs option set to 'binary'
    const readTextFileAsBufferResult = await favaClient.readFile(testLocationOne.id, join(dirPath, textFilePath), { returnAs: 'binary' });
    expect(readTextFileAsBufferResult).toBeInstanceOf(Uint8Array);
    expect(new TextDecoder().decode(readTextFileAsBufferResult)).toBe(textFileContent);

    // Call the client's readFile method for a binary file with returnAs option set to 'text'
    const readBinaryFileAsTextResult = await favaClient.readFile(testLocationOne.id, join(dirPath, binaryFilePath), { returnAs: 'text' });
    expect(readBinaryFileAsTextResult).toBeInstanceOf(String);
    expect(new TextEncoder().encode(readBinaryFileAsTextResult)).toEqual(binaryFileContent);
  });

  test("client calls API: readFileChunk", async () => {
    const favaClient = new FavaClient({ fetch: fetch as any });

    const dirPath = "testDir";
    const filePath = "file1.txt";
    const locationDirPath = join(testLocationRootOne, dirPath);
    const locationFilePath = join(locationDirPath, filePath);

    const fileContent = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const fileContentBuffer = new TextEncoder().encode(fileContent);

    // Setup a directory with a text file
    await remove(locationDirPath);
    await mkdir(locationDirPath);
    await writeFile(locationFilePath, fileContent);

    // Call the client's readFileChunk method with a range
    const rangeStart = 5;
    const rangeEnd = 10;
    const readRangeResult = await favaClient.readFileChunk(testLocationOne.id, join(dirPath, filePath), { rangeStart, rangeEnd });
    expect(readRangeResult.data).toBeInstanceOf(String);
    expect(readRangeResult.data).toBe(fileContent.slice(rangeStart, rangeEnd + 1));
    expect(readRangeResult.bytesRead).toBe(rangeEnd - rangeStart + 1);
    expect(readRangeResult.chunkStart).toBe(rangeStart);
    expect(readRangeResult.chunkEnd).toBe(rangeEnd);
    expect(readRangeResult.fileSize).toBe(fileContent.length);
    expect(readRangeResult.mimeType).toBe("text/plain");

    // Call the client's readFileChunk method with a suffixLength
    const suffixLength = 6;
    const readSuffixResult = await favaClient.readFileChunk(testLocationOne.id, join(dirPath, filePath), { suffixLength });
    expect(readSuffixResult.data).toBeInstanceOf(String);
    expect(readSuffixResult.data).toBe(fileContent.slice(-suffixLength));
    expect(readSuffixResult.bytesRead).toBe(suffixLength);
    expect(readSuffixResult.chunkStart).toBe(fileContent.length - suffixLength);
    expect(readSuffixResult.chunkEnd).toBe(fileContent.length - 1);
    expect(readSuffixResult.fileSize).toBe(fileContent.length);
    expect(readSuffixResult.mimeType).toBe("text/plain");

    // Call the client's readFileChunk method with a range and returnAs option set to 'binary'
    const readRangeAsBinaryResult = await favaClient.readFileChunk(testLocationOne.id, join(dirPath, filePath), { rangeStart, rangeEnd, returnAs: 'binary' });
    expect(readRangeAsBinaryResult.data).toBeInstanceOf(Uint8Array);
    expect(readRangeAsBinaryResult.data).toEqual(fileContentBuffer.slice(rangeStart, rangeEnd + 1));
    expect(readRangeAsBinaryResult.bytesRead).toBe(rangeEnd - rangeStart + 1);
    expect(readRangeAsBinaryResult.chunkStart).toBe(rangeStart);
    expect(readRangeAsBinaryResult.chunkEnd).toBe(rangeEnd);
    expect(readRangeAsBinaryResult.fileSize).toBe(fileContent.length);
    expect(readRangeAsBinaryResult.mimeType).toBe("text/plain");
  });

  test("client calls API: remove", async () => {
    const favaClient = new FavaClient({ fetch: fetch as any });

    const basePath = "testDir";
    const filePath = "file1.txt";
    const dirPath = "subDir";
    const fullFilePath = join(basePath, filePath);
    const fullDirPath = join(basePath, dirPath);
    const locationDirPath = join(testLocationRootOne, basePath);

    // Create test directory, file, and subdirectory
    await favaClient.ensureDir(testLocationOne.id, basePath);
    await favaClient.writeFile(testLocationOne.id, fullFilePath, "Test content");
    await favaClient.ensureDir(testLocationOne.id, fullDirPath);

    // Verify that the file and subdirectory exist
    const fileExistsBefore = await pathExists(join(locationDirPath, filePath));
    const dirExistsBefore = await pathExists(join(locationDirPath, dirPath));
    expect(fileExistsBefore).toBe(true);
    expect(dirExistsBefore).toBe(true);

    // Call the client's remove method for the file
    await favaClient.remove(testLocationOne.id, fullFilePath);

    // Verify that the file has been removed
    const fileExistsAfter = await pathExists(join(locationDirPath, filePath));
    expect(fileExistsAfter).toBe(false);

    // Call the client's remove method for the subdirectory
    await favaClient.remove(testLocationOne.id, fullDirPath);

    // Verify that the subdirectory has been removed
    const dirExistsAfter = await pathExists(join(locationDirPath, dirPath));
    expect(dirExistsAfter).toBe(false);

    // Call the client's remove method for a non-existent path
    const nonExistentPath = join(basePath, "nonExistent");
    try {
      await favaClient.remove(testLocationOne.id, nonExistentPath);
    } catch (err) {
      fail("Should not throw an error for non-existent path");
    }
  });

  test("client calls API: rename", async () => {
    const favaClient = new FavaClient({ fetch: fetch as any });

    const basePath = "testDir";
    const filePath = "file1.txt";
    const newFilePath = "file2.txt";
    const fullFilePath = join(basePath, filePath);
    const fullNewFilePath = join(basePath, newFilePath);
    const locationDirPath = join(testLocationRootOne, basePath);

    // Create test directory and file
    await favaClient.ensureDir(testLocationOne.id, basePath);
    await favaClient.writeFile(testLocationOne.id, fullFilePath, "Test content");

    // Verify that the file exists and the new file does not exist initially
    const fileExistsBefore = await pathExists(join(locationDirPath, filePath));
    const newFileExistsBefore = await pathExists(join(locationDirPath, newFilePath));
    expect(fileExistsBefore).toBe(true);
    expect(newFileExistsBefore).toBe(false);

    // Call the client's rename method
    await favaClient.rename(testLocationOne.id, fullFilePath, fullNewFilePath);

    // Verify that the file has been renamed
    const fileExistsAfter = await pathExists(join(locationDirPath, filePath));
    const newFileExistsAfter = await pathExists(join(locationDirPath, newFilePath));
    expect(fileExistsAfter).toBe(false);
    expect(newFileExistsAfter).toBe(true);

    // Call the client's rename method for a non-existent path
    const nonExistentPath = join(basePath, "nonExistent");
    const nonExistentNewPath = join(basePath, "nonExistentNew");
    try {
      await favaClient.rename(testLocationOne.id, nonExistentPath, nonExistentNewPath);
      fail("Should throw an error for non-existent path");
    } catch (err) {
      // Error is expected, do nothing
    }
  });

  test("client calls API: writeFile", async () => {
    const favaClient = new FavaClient({ fetch: fetch as any });

    const basePath = "testDir";
    const file1Path = "file1.txt";
    const file2Path = "file2.bin";
    const nestedFile3Path = "nested/file3.txt";
    const fullFile1Path = join(basePath, file1Path);
    const fullFile2Path = join(basePath, file2Path);
    const fullNestedFile3Path = join(basePath, nestedFile3Path);
    const locationDirPath = join(testLocationRootOne, basePath);

    // Ensure the base directory is created
    await favaClient.ensureDir(testLocationOne.id, basePath);

    // Write a string to a file
    const stringData = "Test content";
    await favaClient.writeFile(testLocationOne.id, fullFile1Path, stringData, { mimeType: "text/plain" });

    // Verify that the file has been written with the correct content
    const file1Content = await readFile(join(locationDirPath, file1Path), "utf-8");
    expect(file1Content).toBe(stringData);

    // Write a Uint8Array to a file
    const uint8ArrayData = new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]); // "Hello World"
    await favaClient.writeFile(testLocationOne.id, fullFile2Path, uint8ArrayData, { mimeType: "application/octet-stream" });

    // Verify that the file has been written with the correct content
    const file2Content = await readFile(join(locationDirPath, file2Path));
    expect(Buffer.from(file2Content).equals(Buffer.from(uint8ArrayData))).toBe(true);

    // Write a string to a file in a nested directory
    const nestedStringData = "Nested test content";
    await favaClient.writeFile(testLocationOne.id, fullNestedFile3Path, nestedStringData);

    // Verify that the file has been written with the correct content and the parent directory has been created
    const file3Content = await readFile(join(locationDirPath, nestedFile3Path), "utf-8");
    expect(file3Content).toBe(nestedStringData);
  });

  test("client calls API: writeFileChunk", async () => {
    const favaClient = new FavaClient({ fetch: fetch as any });

    const basePath = "testDir";
    const file1Path = "file1.txt";
    const file2Path = "file2.bin";
    const fullFile1Path = join(basePath, file1Path);
    const fullFile2Path = join(basePath, file2Path);
    const locationDirPath = join(testLocationRootOne, basePath);

    // Ensure the base directory is created
    await favaClient.ensureDir(testLocationOne.id, basePath);

    // Write a chunk of string data to a file
    const stringData = "Test content";
    const stringChunkResult = await favaClient.writeFileChunk(testLocationOne.id, fullFile1Path, stringData, {
      rangeStart: 0,
      rangeEnd: 3,
      mimeType: "text/plain",
    });

    // Verify that the chunk has been written with the correct content and bytesWritten is correct
    const file1Content = await readFile(join(locationDirPath, file1Path), "utf-8");
    expect(file1Content).toBe(stringData.slice(0, 4));
    expect(stringChunkResult.bytesWritten).toBe(4);

    // Write a chunk of Uint8Array data to a file
    const uint8ArrayData = new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]); // "Hello World"
    const uint8ArrayChunkResult = await favaClient.writeFileChunk(testLocationOne.id, fullFile2Path, uint8ArrayData, {
      rangeStart: 0,
      rangeEnd: 4,
      mimeType: "application/octet-stream",
    });

    // Verify that the chunk has been written with the correct content and bytesWritten is correct
    const file2Content = await readFile(join(locationDirPath, file2Path));
    expect(Buffer.from(file2Content).equals(Buffer.from(uint8ArrayData.slice(0, 5)))).toBe(true);
    expect(uint8ArrayChunkResult.bytesWritten).toBe(5);

    // Write a chunk of string data to a file with suffixLength
    const suffixStringData = "Suffix content";
    const suffixStringChunkResult = await favaClient.writeFileChunk(testLocationOne.id, fullFile1Path, suffixStringData, {
      suffixLength: 4,
    });

    // Verify that the chunk has been written with the correct content and bytesWritten is correct
    const file1ContentWithSuffix = await readFile(join(locationDirPath, file1Path), "utf-8");
    expect(file1ContentWithSuffix).toBe("TestSuffix content");
    expect(suffixStringChunkResult.bytesWritten).toBe(suffixStringData.length);
  });

});
