"use strict";

const { assert, spy } = require("sinon");
const { expectSnippetToBeFormatted } = require("../../../../test-utils");
const { CstPrettierPrinter } = require("../../../../../src/cst-printer");

describe("Wildcard", () => {
  let wildcardBoundsSpy;

  // eslint-disable-next-line no-undef
  beforeEach(() => {
    if (wildcardBoundsSpy !== undefined) {
      wildcardBoundsSpy.restore();
    }
    wildcardBoundsSpy = spy(CstPrettierPrinter.prototype, "wildcardBounds");
  });

  it("can format a wildcard", () => {
    const input = "?";
    const entryPoint = "wildcard";
    const expectedOutput = "?";

    expectSnippetToBeFormatted({
      input,
      expectedOutput,
      entryPoint
    });
  });

  it("can format a wildcard with one annotations", () => {
    const input = "@Anno ?";
    const entryPoint = "wildcard";
    const expectedOutput = "@Anno ?";

    expectSnippetToBeFormatted({
      input,
      expectedOutput,
      entryPoint
    });
  });

  it("can format a wildcard with annotations that exceed printWidth ", () => {
    const input =
      "@Annotation1 @Annotation2 @Annotation3 @Annotation4 @Annotation5 @Annotation6 @Annotation7 ?";
    const entryPoint = "wildcard";
    const expectedOutput =
      "@Annotation1 @Annotation2 @Annotation3 @Annotation4 @Annotation5 @Annotation6 @Annotation7 ?";

    expectSnippetToBeFormatted({
      input,
      expectedOutput,
      entryPoint
    });
  });

  it("can format a wildcard with wildcardBound", () => {
    const input = "? extends int[]";
    const entryPoint = "wildcard";
    const expectedOutput = "? extends int[]";

    expectSnippetToBeFormatted({
      input,
      expectedOutput,
      entryPoint
    });
    assert.calledTwice(wildcardBoundsSpy);
  });
});
