"use strict";

const { expectSnippetToBeFormatted } = require("../../../../test-utils");

describe("floatingPointType", () => {
  it("can format float keyword", () => {
    expectSnippetToBeFormatted({
      input: "float",
      expectedOutput: "float",
      entryPoint: "floatingPointType"
    });
  });

  it("can format double keyword", () => {
    expectSnippetToBeFormatted({
      input: "double",
      expectedOutput: "double",
      entryPoint: "floatingPointType"
    });
  });
});
