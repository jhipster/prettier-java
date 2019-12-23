"use strict";

const { expectSnippetToBeFormatted } = require("../../../../test-utils");

describe("integralType", () => {
  it("can format byte keyword", () => {
    expectSnippetToBeFormatted({
      input: "byte",
      expectedOutput: "byte",
      entryPoint: "integralType"
    });
  });

  it("can format short keyword", () => {
    expectSnippetToBeFormatted({
      input: "short",
      expectedOutput: "short",
      entryPoint: "integralType"
    });
  });

  it("can format int keyword", () => {
    expectSnippetToBeFormatted({
      input: "int",
      expectedOutput: "int",
      entryPoint: "integralType"
    });
  });

  it("can format long keyword", () => {
    expectSnippetToBeFormatted({
      input: "long",
      expectedOutput: "long",
      entryPoint: "integralType"
    });
  });

  it("can format char keyword", () => {
    expectSnippetToBeFormatted({
      input: "char",
      expectedOutput: "char",
      entryPoint: "integralType"
    });
  });
});
