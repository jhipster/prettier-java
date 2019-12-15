"use strict";

const { expect } = require("chai");
const { formatJavaSnippet } = require("../../../../test-utils");

describe("floatingPointType", () => {
  it("can format float keyword", () => {
    const snippet = "float";
    const entryPoint = "floatingPointType";

    const formattedText = formatJavaSnippet(snippet, entryPoint);
    const expectedContents = "float";
    expect(formattedText).to.equal(expectedContents);
  });

  it("can format double keyword", () => {
    const snippet = "double";
    const entryPoint = "floatingPointType";

    const formattedText = formatJavaSnippet(snippet, entryPoint);
    const expectedContents = "double";
    expect(formattedText).to.equal(expectedContents);
  });
});
