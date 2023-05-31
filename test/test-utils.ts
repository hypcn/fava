import { FavaLocation } from "../src";
import { IFavaAdapter } from "../src/core/adapters/adapter.interface";
import { FavaCore } from "../src/core/core";

export function mockAndSpyOnAdapter(adapter: IFavaAdapter<FavaLocation>) {
  const adapterSpy = {
    append: jest.spyOn(adapter, "append").mockImplementation(async () => undefined),
    copy: jest.spyOn(adapter, "copy").mockImplementation(async () => undefined),
    emptyDir: jest.spyOn(adapter, "emptyDir").mockImplementation(async () => undefined),
    ensureFile: jest.spyOn(adapter, "ensureFile").mockImplementation(async () => undefined),
    ensureDir: jest.spyOn(adapter, "ensureDir").mockImplementation(async () => undefined),
    exists: jest.spyOn(adapter, "exists").mockImplementation(async () => (undefined as any)),
    move: jest.spyOn(adapter, "move").mockImplementation(async () => undefined),
    readDir: jest.spyOn(adapter, "readDir").mockImplementation(async () => (undefined as any)),
    readFile: jest.spyOn(adapter, "readFile").mockImplementation(async () => (undefined as any)),
    readFileChunk: jest.spyOn(adapter, "readFileChunk").mockImplementation(async () => (undefined as any)),
    remove: jest.spyOn(adapter, "remove").mockImplementation(async () => undefined),
    rename: jest.spyOn(adapter, "rename").mockImplementation(async () => undefined),
    stat: jest.spyOn(adapter, "stat").mockImplementation(async () => (undefined as any)),
    writeFile: jest.spyOn(adapter, "writeFile").mockImplementation(async () => undefined),
    writeFileChunk: jest.spyOn(adapter, "writeFileChunk").mockImplementation(async () => (undefined as any)),
  };
  return adapterSpy;
}

export function mockAndSpyOnCore(core: FavaCore) {
  const coreSpy = {
    append: jest.spyOn(core, "append").mockImplementation(async () => undefined),
    copy: jest.spyOn(core, "copy").mockImplementation(async () => undefined),
    emptyDir: jest.spyOn(core, "emptyDir").mockImplementation(async () => undefined),
    ensureDir: jest.spyOn(core, "ensureDir").mockImplementation(async () => undefined),
    ensureFile: jest.spyOn(core, "ensureFile").mockImplementation(async () => undefined),
    exists: jest.spyOn(core, "exists").mockImplementation(async () => (undefined as any)),
    move: jest.spyOn(core, "move").mockImplementation(async () => undefined),
    readDir: jest.spyOn(core, "readDir").mockImplementation(async () => (undefined as any)),
    readFile: jest.spyOn(core, "readFile").mockImplementation(async () => (undefined as any)),
    readFileChunk: jest.spyOn(core, "readFileChunk").mockImplementation(async () => (undefined as any)),
    remove: jest.spyOn(core, "remove").mockImplementation(async () => undefined),
    rename: jest.spyOn(core, "rename").mockImplementation(async () => undefined),
    stat: jest.spyOn(core, "stat").mockImplementation(async () => (undefined as any)),
    writeFile: jest.spyOn(core, "writeFile").mockImplementation(async () => undefined),
    writeFileChunk: jest.spyOn(core, "writeFileChunk").mockImplementation(async () => (undefined as any)),
  };
  return coreSpy;
}
