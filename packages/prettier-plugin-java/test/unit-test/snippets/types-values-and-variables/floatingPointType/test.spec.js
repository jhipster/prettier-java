"use strict";

const { expectSnippetToBeFormatted } = require("../../../../test-utils");

describe("floatingPointType", () => {
  it("can format float keyword", () => {
    const input = "float";
    const entryPoint = "floatingPointType";
    const expectedOutput = "float";

    expectSnippetToBeFormatted({
      input,
      expectedOutput,
      entryPoint
    });
  });

  it("can format double keyword", () => {
    const input = "double";
    const entryPoint = "floatingPointType";
    const expectedOutput = "double";

    expectSnippetToBeFormatted({
      input,
      expectedOutput,
      entryPoint
    });
  });
});
