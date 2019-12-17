"use strict";

const { expectSnippetToBeFormatted } = require("../../../../test-utils");

describe("MethodName", () => {
  it("can format a MethodName", () => {
    expectSnippetToBeFormatted({
      input: "test",
      expectedOutput: "test",
      entryPoint: "methodName"
    });
  });
});
