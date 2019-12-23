"use strict";

const { expectSnippetToBeFormatted } = require("../../../../test-utils");

describe("PackageOrTypeName", () => {
  it("can format a PackageOrTypeName without dots", () => {
    expectSnippetToBeFormatted({
      input: "com",
      expectedOutput: "com",
      entryPoint: "packageOrTypeName"
    });
  });

  it("can format a PackageOrTypeName with dots", () => {
    expectSnippetToBeFormatted({
      input: "com.iluwatar.abstractdocument",
      expectedOutput: "com.iluwatar.abstractdocument",
      entryPoint: "packageOrTypeName"
    });
  });
});
