import { expectSnippetToBeFormatted } from "../../../../test-utils";

describe("floatingPointType", () => {
  it("can format float keyword", () => {
    expectSnippetToBeFormatted({
      snippet: "float",
      expectedOutput: "float",
      entryPoint: "floatingPointType"
    });
  });

  it("can format double keyword", () => {
    expectSnippetToBeFormatted({
      snippet: "double",
      expectedOutput: "double",
      entryPoint: "floatingPointType"
    });
  });
});
