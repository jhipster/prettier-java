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
    const input = "extends int[]";
    const entryPoint = "wildcardBounds";
    const expectedOutput = "extends int[]";

    expectSnippetToBeFormatted({
      input,
      expectedOutput,
      entryPoint
    });
    assert.callCount(referenceTypeSpy, 2);
  });

  it("can format a wildcardBounds with super", () => {
    const input = "super int[]";
    const entryPoint = "wildcardBounds";
    const expectedOutput = "super int[]";

    expectSnippetToBeFormatted({
      input,
      expectedOutput,
      entryPoint
    });
    assert.callCount(referenceTypeSpy, 2);
  });
});
