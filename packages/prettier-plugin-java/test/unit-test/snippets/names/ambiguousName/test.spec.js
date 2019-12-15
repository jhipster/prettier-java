"use strict";

const { expect } = require("chai");
const { formatJavaSnippet } = require("../../../../test-utils");

describe("AmbiguousName", () => {
  it("can format a AmbiguousName without dots", () => {
    const snippet = "myAmbiguousName";
    const entryPoint = "ambiguousName";

    const formattedText = formatJavaSnippet(snippet, entryPoint);
    const expectedContents = "myAmbiguousName";
    expect(formattedText).to.equal(expectedContents);
  });

  it("can format a AmbiguousName with dots", () => {
    const snippet = "myAmbiguousName.with.lot.of.dots";
    const entryPoint = "ambiguousName";

    const formattedText = formatJavaSnippet(snippet, entryPoint);
    const expectedContents = "myAmbiguousName.with.lot.of.dots";
    expect(formattedText).to.equal(expectedContents);
  });
});
