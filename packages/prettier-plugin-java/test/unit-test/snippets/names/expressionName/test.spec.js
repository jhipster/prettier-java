"use strict";

const { expect } = require("chai");
const { formatJavaSnippet } = require("../../../../test-utils");

describe("expressionName", () => {
  it("can format a ExpressionName without dots", () => {
    const snippet = "myExpression";
    const entryPoint = "expressionName";

    const formattedText = formatJavaSnippet(snippet, entryPoint);
    const expectedContents = "myExpression";
    expect(formattedText).to.equal(expectedContents);
  });

  it("can format a ExpressionName with dots", () => {
    const snippet = "myExpression.with.lot.of.dots";
    const entryPoint = "expressionName";

    const formattedText = formatJavaSnippet(snippet, entryPoint);
    const expectedContents = "myExpression.with.lot.of.dots";
    expect(formattedText).to.equal(expectedContents);
  });
});
