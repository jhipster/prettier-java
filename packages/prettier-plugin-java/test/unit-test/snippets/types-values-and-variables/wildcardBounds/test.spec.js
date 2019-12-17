"use strict";

const { assert, spy } = require("sinon");
const { expectSnippetToBeFormatted } = require("../../../../test-utils");
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
    expectSnippetToBeFormatted({
      input: "extends int[]",
      expectedOutput: "extends int[]",
      entryPoint: "wildcardBounds"
    });
    assert.callCount(referenceTypeSpy, 2);
  });

  it("can format a wildcardBounds with super", () => {
    expectSnippetToBeFormatted({
      input: "super int[]",
      expectedOutput: "super int[]",
      entryPoint: "wildcardBounds"
    });
    assert.callCount(referenceTypeSpy, 2);
  });
});
