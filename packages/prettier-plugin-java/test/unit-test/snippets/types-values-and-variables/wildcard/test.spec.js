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
    expectSnippetToBeFormatted({
      input: "?",
      expectedOutput: "?",
      entryPoint: "wildcard"
    });
  });

  it("can format a wildcard with one annotations", () => {
    expectSnippetToBeFormatted({
      input: "@Anno ?",
      expectedOutput: "@Anno ?",
      entryPoint: "wildcard"
    });
  });

  it("can format a wildcard with annotations that exceed printWidth ", () => {
    const input =
      "@Annotation1 @Annotation2 @Annotation3 @Annotation4 @Annotation5 @Annotation6 @Annotation7 ?";
    const expectedOutput =
      "@Annotation1 @Annotation2 @Annotation3 @Annotation4 @Annotation5 @Annotation6 @Annotation7 ?";

    expectSnippetToBeFormatted({
      input,
      expectedOutput,
      entryPoint: "wildcard"
    });
  });

  it("can format a wildcard with wildcardBound", () => {
    expectSnippetToBeFormatted({
      input: "? extends int[]",
      expectedOutput: "? extends int[]",
      entryPoint: "wildcard"
    });
    assert.calledTwice(wildcardBoundsSpy);
  });
});
