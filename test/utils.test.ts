import { backslashToForward, toStringOrUint8Array } from "../src/core/utils";

describe("Utils", () => {

  test("backslashToForward", () => {
    expect(backslashToForward("C:\\somewhere/dir\\file.txt")).toBe("C:/somewhere/dir/file.txt");
  });

  test("toStringOrUint8Array", () => {
    expect(toStringOrUint8Array("string")).toBe("string");
    expect(toStringOrUint8Array(Buffer.from("string"))).toBe("string");
    // expect(toStringOrUint8Array(ArrayBuffer (Buffer.from("string")))).toBe("string");
  });

});
