"use strict";

const { expect } = require("chai");
const { formatJavaSnippet } = require("../../../../test-utils");

describe("integralType", () => {
  it("can format byte keyword", () => {
    const snippet = "byte";
    const entryPoint = "integralType";

    const formattedText = formatJavaSnippet(snippet, entryPoint);
    const expectedContents = "byte";
    expect(formattedText).to.equal(expectedContents);
  });

  it("can format short keyword", () => {
    const snippet = "short";
    const entryPoint = "integralType";

    const formattedText = formatJavaSnippet(snippet, entryPoint);
    const expectedContents = "short";
    expect(formattedText).to.equal(expectedContents);
  });

  it("can format int keyword", () => {
    const snippet = "int";
    const entryPoint = "integralType";

    const formattedText = formatJavaSnippet(snippet, entryPoint);
    const expectedContents = "int";
    expect(formattedText).to.equal(expectedContents);
  });

  it("can format long keyword", () => {
    const snippet = "long";
    const entryPoint = "integralType";

    const formattedText = formatJavaSnippet(snippet, entryPoint);
    const expectedContents = "long";
    expect(formattedText).to.equal(expectedContents);
  });

  it("can format char keyword", () => {
    const snippet = "char";
    const entryPoint = "integralType";

    const formattedText = formatJavaSnippet(snippet, entryPoint);
    const expectedContents = "char";
    expect(formattedText).to.equal(expectedContents);
  });
});
