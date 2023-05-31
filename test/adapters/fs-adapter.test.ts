import { Logger, SimpleLogger } from "@hypericon/axe";
import { readFileSync } from "fs";
import { ensureDir, ensureDirSync, pathExists, remove, rmSync } from "fs-extra";
import { readFile, readdir, writeFile } from "fs/promises";
import { join } from "path";
import { FavaLocation } from "../../src";
import { FsAdapter } from "../../src/core/adapters/fs-adapter";

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
    const data1 = "data1\n";
    const data2 = "data2\n";

    // Create and write a file
    await adapter.writeFile(testLocationOne, "file.txt", data1);
    const fileData1 = await readFile(filePath, { encoding: "utf8" });
    expect(fileData1).toBe(data1);

    // Append data to the existing file
    await adapter.append(testLocationOne, "file.txt", data2);
    const fileData2 = await readFile(filePath, { encoding: "utf8" });
    expect(fileData2).toBe(data1 + data2);
  });

  test("implements copy", async () => {
    const adapter = new FsAdapter();

    const srcFilePath = join(testLocationRootOne, "file.txt");
    const srcDirPath = join(testLocationRootOne, "dir");
    const destFilePath = join(testLocationRootTwo, "file.txt");
    const destDirPath = join(testLocationRootTwo, "dir");
    const data = "data\n";

    // Create a file and a directory
    await writeFile(srcFilePath, data, { encoding: "utf8" });
    await ensureDir(srcDirPath);

    // Copy a file
    await adapter.copy(testLocationOne, "file.txt", testLocationTwo, "file.txt");
    const fileData = await readFile(destFilePath, { encoding: "utf8" });
    expect(fileData).toBe(data);

    // Copy a directory
    await adapter.copy(testLocationOne, "dir", testLocationTwo, "dir");
    const dirExists = await pathExists(destDirPath);
    expect(dirExists).toBe(true);

    // Expect an error when the source doesn't exist
    await expect(adapter.copy(testLocationOne, "nonexistent.txt", testLocationTwo, "nonexistent.txt")).rejects.toThrow();
  });

  test("implements emptyDir", async () => {
    const adapter = new FsAdapter();

    const dirPath = join(testLocationRootOne, "dir");
    const filePath1 = join(dirPath, "file1.txt");
    const filePath2 = join(dirPath, "file2.txt");
    const data = "data\n";

    // Create a directory with files
    await ensureDir(dirPath);
    await writeFile(filePath1, data, { encoding: "utf8" });
    await writeFile(filePath2, data, { encoding: "utf8" });

    // Empty the directory
    await adapter.emptyDir(testLocationOne, "dir");

    // Check if the directory is empty
    const files = await readdir(dirPath);
    expect(files.length).toBe(0);
  });

  test("implements ensureDir", async () => {
    const adapter = new FsAdapter();

    const dirPath = join(testLocationRootOne, "newDir");

    // Remove the directory if it exists
    await remove(dirPath);

    // Ensure the directory exists
    await adapter.ensureDir(testLocationOne, "newDir");

    // Check if the directory exists
    const dirExists = await pathExists(dirPath);
    expect(dirExists).toBe(true);
  });

  test("implements ensureFile", async () => {
    const adapter = new FsAdapter();

    const filePath = join(testLocationRootOne, "newFile.txt");

    // Remove the file if it exists
    await remove(filePath);

    // Ensure the file exists
    await adapter.ensureFile(testLocationOne, "newFile.txt");

    // Check if the file exists
    const fileExists = await pathExists(filePath);
    expect(fileExists).toBe(true);
  });

  test("implements exists", async () => {
    const adapter = new FsAdapter();

    const filePath = join(testLocationRootOne, "file.txt");
    const dirPath = join(testLocationRootOne, "nonExistentDir");

    // Create a file
    await writeFile(filePath, "data", { encoding: "utf8" });

    // Check if the file exists
    const fileExists = await adapter.exists(testLocationOne, "file.txt");
    expect(fileExists).toBe(true);

    // Check if the non-existent directory exists
    const dirExists = await adapter.exists(testLocationOne, "nonExistentDir");
    expect(dirExists).toBe(false);
  });

  test("implements move", async () => {
    const adapter = new FsAdapter();

    const filePath1 = join(testLocationRootOne, "file.txt");
    const filePath2 = join(testLocationRootTwo, "file2.txt");
    const data = "data\n";

    // Create a file and remove the destination file if it exists
    await writeFile(filePath1, data, { encoding: "utf8" });
    await remove(filePath2);

    // Move the file
    await adapter.move(testLocationOne, "file.txt", testLocationTwo, "file2.txt");

    // Check if the source file no longer exists and the destination file exists
    const sourceExists = await pathExists(filePath1);
    const destinationExists = await pathExists(filePath2);
    expect(sourceExists).toBe(false);
    expect(destinationExists).toBe(true);
  });

  test("implements readDir", async () => {
    const adapter = new FsAdapter();

    const dirPath = join(testLocationRootOne, "dir");
    const filePath1 = join(dirPath, "file1.txt");
    const filePath2 = join(dirPath, "file2");
    const data = "data\n";

    // Create a directory with files
    await ensureDir(dirPath);
    await writeFile(filePath1, data, { encoding: "utf8" });
    await writeFile(filePath2, data, { encoding: "utf8" });

    // Read the directory
    const dirInfo = await adapter.readDir(testLocationOne, "dir");

    // Check the directory information
    expect(dirInfo.dir.fullpath).toBe("dir");
    expect(dirInfo.dir.dirpath).toBe("");
    expect(dirInfo.dir.isDir).toBe(true);

    // Check the files information
    expect(dirInfo.files.length).toBe(2);

    dirInfo.files.forEach((file) => {
      expect(file.dirpath).toBe("dir");
      expect(file.isDir).toBe(false);
      expect(["file1.txt", "file2"].includes(file.filename)).toBe(true);

      if (file.filename === "file1.txt") {
        expect(file.basename).toBe("file1");
        expect(file.ext).toBe(".txt");
      } else if (file.filename === "file2") {
        expect(file.basename).toBe("file2");
        expect(file.ext).toBe("");
      }
    });

  });

  test("implements readFile", async () => {
    const adapter = new FsAdapter();

    const filePath = join(testLocationRootOne, "file.txt");
    const data = "data\n";

    // Create a file
    await writeFile(filePath, data, { encoding: "utf8" });

    // Read the file
    const fileData = await adapter.readFile(testLocationOne, "file.txt", { encoding: "utf8" });

    // Check if the file data is correct
    expect(fileData).toBe(data);
  });

  test("implements readFileChunk", async () => {
    const adapter = new FsAdapter();

    const filePath = join(testLocationRootOne, "file.txt");
    const data = "This is a test file with some content.";

    // Create and write a file
    await adapter.writeFile(testLocationOne, "file.txt", data);
    const fileData = await readFile(filePath, { encoding: "utf8" });
    expect(fileData).toBe(data);

    // Read a chunk from the existing file
    const readChunk1 = await adapter.readFileChunk(testLocationOne, "file.txt", { position: 0, length: 4, encoding: "utf8" });
    expect(readChunk1.data).toBe("This");
    expect(readChunk1.bytesRead).toBe(4);

    // Read a chunk using a buffer
    const readChunk2 = await adapter.readFileChunk(testLocationOne, "file.txt", { position: 5, length: 2 });
    expect(readChunk2.data.toString()).toBe("is");
    expect(readChunk2.bytesRead).toBe(2);

    // Read a chunk with no specified length (should read to the end of the file)
    const readChunk3 = await adapter.readFileChunk(testLocationOne, "file.txt", { position: 10, encoding: "utf8" });
    expect(readChunk3.data).toBe("test file with some content.");
    expect(readChunk3.bytesRead).toBe(data.length - 10);

    // Expect an error when the file doesn't exist
    await expect(adapter.readFileChunk(testLocationOne, "nonexistent.txt", { position: 0, length: 4 })).rejects.toThrow("File not found: nonexistent.txt");
  });

  test("implements remove", async () => {
    const adapter = new FsAdapter();

    const filePath = join(testLocationRootOne, "file.txt");
    const dirPath = join(testLocationRootOne, "dir");
    const data = "data\n";

    // Create a file and a directory
    await writeFile(filePath, data, { encoding: "utf8" });
    await ensureDir(dirPath);

    // Remove the file and the directory
    await adapter.remove(testLocationOne, "file.txt");
    await adapter.remove(testLocationOne, "dir");

    // Check if the file and the directory no longer exist
    const fileExists = await pathExists(filePath);
    const dirExists = await pathExists(dirPath);
    expect(fileExists).toBe(false);
    expect(dirExists).toBe(false);
  });

  test("implements rename", async () => {
    const adapter = new FsAdapter();

    const filePath1 = join(testLocationRootOne, "file.txt");
    const filePath2 = join(testLocationRootOne, "file2.txt");
    const dirPath1 = join(testLocationRootOne, "dir");
    const dirPath2 = join(testLocationRootOne, "dir2");
    const data = "data\n";

    // Create a file and a directory
    await writeFile(filePath1, data, { encoding: "utf8" });
    await ensureDir(dirPath1);

    // Rename the file and the directory
    await adapter.rename(testLocationOne, "file.txt", "file2.txt");
    await adapter.rename(testLocationOne, "dir", "dir2");

    // Check if the original file and directory no longer exist, and the renamed ones exist
    const fileExists1 = await pathExists(filePath1);
    const fileExists2 = await pathExists(filePath2);
    const dirExists1 = await pathExists(dirPath1);
    const dirExists2 = await pathExists(dirPath2);
    expect(fileExists1).toBe(false);
    expect(fileExists2).toBe(true);
    expect(dirExists1).toBe(false);
    expect(dirExists2).toBe(true);
  });

  test("implements stat", async () => {
    const adapter = new FsAdapter();

    const filePath = join(testLocationRootOne, "file.txt");
    const dirPath = join(testLocationRootOne, "dir");
    const data = "data\n";

    // Create a file and a directory
    await writeFile(filePath, data, { encoding: "utf8" });
    await ensureDir(dirPath);

    // Stat the file and the directory
    const fileInfo = await adapter.stat(testLocationOne, "file.txt");
    const dirInfo = await adapter.stat(testLocationOne, "dir");

    // Check the file information
    expect(fileInfo.fullpath).toBe("file.txt");
    expect(fileInfo.dirpath).toBe("");
    expect(fileInfo.filename).toBe("file.txt");
    expect(fileInfo.basename).toBe("file");
    expect(fileInfo.ext).toBe(".txt");
    expect(fileInfo.mimeType).toBe("text/plain");
    expect(fileInfo.isDir).toBe(false);
    expect(fileInfo.size).toBe(data.length);
    expect(typeof fileInfo.created).toBe("number");
    expect(typeof fileInfo.modified).toBe("number");
    expect(typeof fileInfo.changed).toBe("number");
    expect(typeof fileInfo.accessed).toBe("number");

    // Check the directory information
    expect(dirInfo.fullpath).toBe("dir");
    expect(dirInfo.dirpath).toBe("");
    expect(dirInfo.filename).toBe("dir");
    expect(dirInfo.basename).toBe("dir");
    expect(dirInfo.ext).toBe("");
    expect(dirInfo.mimeType).toBe("");
    expect(dirInfo.isDir).toBe(true);
    expect(dirInfo.size).toBe(0);
    expect(typeof dirInfo.created).toBe("number");
    expect(typeof dirInfo.modified).toBe("number");
    expect(typeof dirInfo.changed).toBe("number");
    expect(typeof dirInfo.accessed).toBe("number");
  });

  test("implements writeFile", async () => {
    const adapter = new FsAdapter();

    const filePath1 = join(testLocationRootOne, "file.txt");
    const filePath2 = join(testLocationRootOne, "dir", "file2.txt");
    const data1 = "data1\n";
    const data2 = "data2\n";
    const data3 = "data3\n";

    // Create and write a file
    await adapter.writeFile(testLocationOne, "file.txt", data1);
    const fileData1 = await readFile(filePath1, { encoding: "utf8" });
    expect(fileData1).toBe(data1);

    // Replace an existing file
    await adapter.writeFile(testLocationOne, "file.txt", data2);
    const fileData2 = await readFile(filePath1, { encoding: "utf8" });
    expect(fileData2).toBe(data2);

    // Ensure parent directories and write a file
    await adapter.writeFile(testLocationOne, "dir/file2.txt", data3);
    const fileData3 = await readFile(filePath2, { encoding: "utf8" });
    expect(fileData3).toBe(data3);
  });

  test("implements writeFileChunk", async () => {
    const adapter = new FsAdapter();

    const filePath = join(testLocationRootOne, "file.txt");
    const data1 = "This is the first part. ";
    const data2 = "This is the second part.";
    const combinedData = data1 + data2;

    // Create and write a file
    await adapter.writeFile(testLocationOne, "file.txt", data1);
    const fileData1 = await readFile(filePath, { encoding: "utf8" });
    expect(fileData1).toBe(data1);

    // Write a chunk to the existing file
    await adapter.writeFileChunk(testLocationOne, "file.txt", data2, { position: data1.length });
    const fileData2 = await readFile(filePath, { encoding: "utf8" });
    expect(fileData2).toBe(combinedData);

    // Write a chunk using a buffer
    const bufferData = Buffer.from(" using a buffer.");
    await adapter.writeFileChunk(testLocationOne, "file.txt", bufferData, { position: combinedData.length });
    const fileData3 = await readFile(filePath, { encoding: "utf8" });
    expect(fileData3).toBe(combinedData + bufferData.toString());

    // Expect an error when the file doesn't exist
    await expect(adapter.writeFileChunk(testLocationOne, "nonexistent.txt", data2, { position: 0 })).rejects.toThrow("File not found: nonexistent.txt");
  });

});
