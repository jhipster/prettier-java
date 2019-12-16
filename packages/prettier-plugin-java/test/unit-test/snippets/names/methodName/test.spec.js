"use strict";

const { expectSnippetToBeFormatted } = require("../../../../test-utils");

describe("MethodName", () => {
  it("can format a MethodName", () => {
    const input = "test";
    const entryPoint = "methodName";
    const expectedOutput = "test";

    expectSnippetToBeFormatted({
      input,
      expectedOutput,
      entryPoint
    });
  });
});
