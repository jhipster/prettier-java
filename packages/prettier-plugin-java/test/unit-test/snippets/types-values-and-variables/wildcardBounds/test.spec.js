"use strict";

const { expect } = require("chai");
const { assert, spy } = require("sinon");
const { formatJavaSnippet } = require("../../../../test-utils");
const { CstPrettierPrinter } = require("../../../../../src/cst-printer");

describe("Wildcard Bounds", () => {
  let referenceTypeSpy;

  // eslint-disable-next-line no-undef
  beforeEach(() => {
    if (referenceTypeSpy !== undefined) {
      referenceTypeSpy.restore();
    }
    referenceTypeSpy = spy(CstPrettierPrinter.prototype, "referenceType");
  });

  it("can format a wildcardBounds with extends", () => {
    const snippet = "extends int[]";
    const entryPoint = "wildcardBounds";

    const formattedText = formatJavaSnippet(snippet, entryPoint);
    const expectedContents = "extends int[]";
    expect(formattedText).to.equal(expectedContents);
    assert.callCount(referenceTypeSpy, 1);
  });

  it("can format a wildcardBounds with super", () => {
    const snippet = "super int[]";
    const entryPoint = "wildcardBounds";

    const formattedText = formatJavaSnippet(snippet, entryPoint);
    const expectedContents = "super int[]";
    expect(formattedText).to.equal(expectedContents);
    assert.callCount(referenceTypeSpy, 1);
  });
});
