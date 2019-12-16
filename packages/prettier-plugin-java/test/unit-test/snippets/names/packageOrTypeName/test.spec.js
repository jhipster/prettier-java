"use strict";

const { expectSnippetToBeFormatted } = require("../../../../test-utils");

describe("PackageOrTypeName", () => {
  it("can format a PackageOrTypeName without dots", () => {
    const input = "com";
    const entryPoint = "packageOrTypeName";
    const expectedOutput = "com";

    expectSnippetToBeFormatted({
      input,
      expectedOutput,
      entryPoint
    });
  });

  it("can format a PackageOrTypeName with dots", () => {
    const input = "com.iluwatar.abstractdocument";
    const entryPoint = "packageOrTypeName";
    const expectedOutput = "com.iluwatar.abstractdocument";

    expectSnippetToBeFormatted({
      input,
      expectedOutput,
      entryPoint
    });
  });
});
