import { backslashToForward } from "../src/core/utils";

describe("Utils", () => {

  test("backslashToForward", () => {
    expect(backslashToForward("C:\\somewhere/dir\\file.txt")).toBe("C:/somewhere/dir/file.txt");
  });

});
