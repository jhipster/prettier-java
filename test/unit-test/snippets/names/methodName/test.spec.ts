import { expectSnippetToBeFormatted } from "../../../../test-utils.ts";

describe("MethodName", () => {
  it("can format a MethodName", () => {
    expectSnippetToBeFormatted({
      snippet: "test",
      expectedOutput: "test"
    });
  });
});
