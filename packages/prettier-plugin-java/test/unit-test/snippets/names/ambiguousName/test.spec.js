"use strict";

const { expectSnippetToBeFormatted } = require("../../../../test-utils");

describe("AmbiguousName", () => {
  it("can format a AmbiguousName without dots", () => {
    const input = "myAmbiguousName";
    const entryPoint = "ambiguousName";
    const expectedOutput = "myAmbiguousName";

    expectSnippetToBeFormatted({
      input,
      expectedOutput,
      entryPoint
    });
  });

  it("can format a AmbiguousName with dots", () => {
    const input = "myAmbiguousName.with.lot.of.dots";
    const entryPoint = "ambiguousName";
    const expectedOutput = "myAmbiguousName.with.lot.of.dots";

    expectSnippetToBeFormatted({
      input,
      expectedOutput,
      entryPoint
    });
  });
});
