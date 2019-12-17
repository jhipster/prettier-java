"use strict";

const { expectSnippetToBeFormatted } = require("../../../../test-utils");

describe("AmbiguousName", () => {
  it("can format a AmbiguousName without dots", () => {
    expectSnippetToBeFormatted({
      input: "myAmbiguousName",
      expectedOutput: "myAmbiguousName",
      entryPoint: "ambiguousName"
    });
  });

  it("can format a AmbiguousName with dots", () => {
    expectSnippetToBeFormatted({
      input: "myAmbiguousName.with.lot.of.dots",
      expectedOutput: "myAmbiguousName.with.lot.of.dots",
      entryPoint: "ambiguousName"
    });
  });
});
