"use strict";

const { expectSnippetToBeFormatted } = require("../../../../test-utils");

describe("expressionName", () => {
  it("can format a ExpressionName without dots", () => {
    expectSnippetToBeFormatted({
      input: "myExpression",
      expectedOutput: "myExpression",
      entryPoint: "expressionName"
    });
  });

  it("can format a ExpressionName with dots", () => {
    expectSnippetToBeFormatted({
      input: "myExpression.with.lot.of.dots",
      expectedOutput: "myExpression.with.lot.of.dots",
      entryPoint: "expressionName"
    });
  });
});
