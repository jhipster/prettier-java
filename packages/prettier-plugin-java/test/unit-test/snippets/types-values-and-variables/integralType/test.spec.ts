import { expectSnippetToBeFormatted } from "../../../../test-utils";

describe("integralType", () => {
  it("can format byte keyword", () => {
    expectSnippetToBeFormatted({
      snippet: "byte",
      expectedOutput: "byte",
      entryPoint: "integralType"
    });
  });

  it("can format short keyword", () => {
    expectSnippetToBeFormatted({
      snippet: "short",
      expectedOutput: "short",
      entryPoint: "integralType"
    });
  });

  it("can format int keyword", () => {
    expectSnippetToBeFormatted({
      snippet: "int",
      expectedOutput: "int",
      entryPoint: "integralType"
    });
  });

  it("can format long keyword", () => {
    expectSnippetToBeFormatted({
      snippet: "long",
      expectedOutput: "long",
      entryPoint: "integralType"
    });
  });

  it("can format char keyword", () => {
    expectSnippetToBeFormatted({
      snippet: "char",
      expectedOutput: "char",
      entryPoint: "integralType"
    });
  });
});
