"use strict";

const { expect } = require("chai");
const { formatJavaSnippet } = require("../../../../test-utils");

describe("MethodName", () => {
  it("can format a MethodName", () => {
    const snippet = "test";
    const entryPoint = "methodName";

    const formattedText = formatJavaSnippet(snippet, entryPoint);
    const expectedContents = "test";
    expect(formattedText).to.equal(expectedContents);
  });
});
