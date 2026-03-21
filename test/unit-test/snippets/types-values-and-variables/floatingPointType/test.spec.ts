import { expectSnippetToBeFormatted } from "../../../../test-utils.ts";

describe("floatingPointType", () => {
  it("can format float keyword", () => {
    expectSnippetToBeFormatted({
      snippet: "float",
      expectedOutput: "float"
    });
  });

  it("can format double keyword", () => {
    expectSnippetToBeFormatted({
      snippet: "double",
      expectedOutput: "double"
    });
  });
});
