import { expectSnippetToBeFormatted } from "../../../../test-utils.js";

describe("MethodName", () => {
  it("can format a MethodName", () => {
    expectSnippetToBeFormatted({
      snippet: "test",
      expectedOutput: "test",
      entryPoint: "methodName"
    });
  });
});
