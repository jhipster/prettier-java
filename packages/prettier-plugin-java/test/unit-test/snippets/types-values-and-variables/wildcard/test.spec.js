"use strict";

const { expect } = require("chai");
const { assert, spy } = require("sinon");
const { formatJavaSnippet } = require("../../../../test-utils");
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
    const snippet = "?";
    const entryPoint = "wildcard";

    const formattedText = formatJavaSnippet(snippet, entryPoint);
    const expectedContents = "?";
    expect(formattedText).to.equal(expectedContents);
  });

  it("can format a wildcard with one annotations", () => {
    const snippet = "@Anno ?";
    const entryPoint = "wildcard";

    const formattedText = formatJavaSnippet(snippet, entryPoint);
    const expectedContents = "@Anno ?";
    expect(formattedText).to.equal(expectedContents);
  });

  it("can format a wildcard with annotations that exceed printWidth ", () => {
    const snippet =
      "@Annotation1 @Annotation2 @Annotation3 @Annotation4 @Annotation5 @Annotation6 @Annotation7 ?";
    const entryPoint = "wildcard";

    const formattedText = formatJavaSnippet(snippet, entryPoint);
    const expectedContents =
      "@Annotation1 @Annotation2 @Annotation3 @Annotation4 @Annotation5 @Annotation6 @Annotation7 ?";
    expect(formattedText).to.equal(expectedContents);
  });

  it("can format a wildcard with wildcardBound", () => {
    const snippet = "? extends int[]";
    const entryPoint = "wildcard";

    const formattedText = formatJavaSnippet(snippet, entryPoint);
    const expectedContents = "? extends int[]";
    expect(formattedText).to.equal(expectedContents);
    assert.calledOnce(wildcardBoundsSpy);
  });
});
