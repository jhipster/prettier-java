"use strict";

const { expectSnippetToBeFormatted } = require("../../../../test-utils");

describe("integralType", () => {
  it("can format byte keyword", () => {
    const input = "byte";
    const entryPoint = "integralType";
    const expectedOutput = "byte";

    expectSnippetToBeFormatted({
      input,
      expectedOutput,
      entryPoint
    });
  });

  it("can format short keyword", () => {
    const input = "short";
    const entryPoint = "integralType";
    const expectedOutput = "short";

    expectSnippetToBeFormatted({
      input,
      expectedOutput,
      entryPoint
    });
  });

  it("can format int keyword", () => {
    const input = "int";
    const entryPoint = "integralType";
    const expectedOutput = "int";

    expectSnippetToBeFormatted({
      input,
      expectedOutput,
      entryPoint
    });
  });

  it("can format long keyword", () => {
    const input = "long";
    const entryPoint = "integralType";
    const expectedOutput = "long";

    expectSnippetToBeFormatted({
      input,
      expectedOutput,
      entryPoint
    });
  });

  it("can format char keyword", () => {
    const input = "char";
    const entryPoint = "integralType";
    const expectedOutput = "char";

    expectSnippetToBeFormatted({
      input,
      expectedOutput,
      entryPoint
    });
  });
});
