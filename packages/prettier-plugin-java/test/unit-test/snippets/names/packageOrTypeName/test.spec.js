"use strict";

const { expect } = require("chai");
const { formatJavaSnippet } = require("../../../../test-utils");

describe("PackageOrTypeName", () => {
  it("can format a PackageOrTypeName without dots", () => {
    const snippet = "com";
    const entryPoint = "packageOrTypeName";

    const formattedText = formatJavaSnippet(snippet, entryPoint);
    const expectedContents = "com";
    expect(formattedText).to.equal(expectedContents);
  });

  it("can format a PackageOrTypeName with dots", () => {
    const snippet = "com.iluwatar.abstractdocument";
    const entryPoint = "packageOrTypeName";

    const formattedText = formatJavaSnippet(snippet, entryPoint);
    const expectedContents = "com.iluwatar.abstractdocument";
    expect(formattedText).to.equal(expectedContents);
  });
});
