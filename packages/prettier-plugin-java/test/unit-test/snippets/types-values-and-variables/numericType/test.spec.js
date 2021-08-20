"use strict";

const {
  BaseCstPrettierPrinter
} = require("../../../../../dist/cjs/base-cst-printer");

const { assert, spy } = require("sinon");
const { formatJavaSnippet } = require("../../../../test-utils");

describe("numericType", () => {
  let integralTypeSpy;
  let floatingPointTypeSpy;

  // eslint-disable-next-line no-undef
  beforeEach(() => {
    if (integralTypeSpy !== undefined) {
      integralTypeSpy.restore();
    }
    if (floatingPointTypeSpy !== undefined) {
      floatingPointTypeSpy.restore();
    }

    integralTypeSpy = spy(BaseCstPrettierPrinter.prototype, "integralType");
    floatingPointTypeSpy = spy(
      BaseCstPrettierPrinter.prototype,
      "floatingPointType"
    );
  });

  it("can format byte keyword", () => {
    const snippet = "byte";
    const entryPoint = "numericType";

    formatJavaSnippet({ snippet, entryPoint });
    assert.callCount(integralTypeSpy, 1);
    assert.callCount(floatingPointTypeSpy, 0);
  });

  it("can format double keyword", () => {
    const snippet = "double";
    const entryPoint = "numericType";

    formatJavaSnippet({ snippet, entryPoint });
    assert.callCount(integralTypeSpy, 0);
    assert.callCount(floatingPointTypeSpy, 1);
  });
});
