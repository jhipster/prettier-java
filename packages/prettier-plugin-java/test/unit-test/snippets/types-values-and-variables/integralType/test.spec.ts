import { expectSnippetToBeFormatted } from "../../../../test-utils.js";

describe("integralType", () => {
  it("can format byte keyword", () => {
    expectSnippetToBeFormatted({
      snippet: "byte",
      expectedOutput: "byte"
    });
  });

  it("can format short keyword", () => {
    expectSnippetToBeFormatted({
      snippet: "short",
      expectedOutput: "short"
    });
  });

  it("can format int keyword", () => {
    expectSnippetToBeFormatted({
      snippet: "int",
      expectedOutput: "int"
    });
  });

  it("can format long keyword", () => {
    expectSnippetToBeFormatted({
      snippet: "long",
      expectedOutput: "long"
    });
  });

  it("can format char keyword", () => {
    expectSnippetToBeFormatted({
      snippet: "char",
      expectedOutput: "char"
    });
  });
});
