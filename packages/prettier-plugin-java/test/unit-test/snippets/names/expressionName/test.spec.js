"use strict";

const { expectSnippetToBeFormatted } = require("../../../../test-utils");

describe("expressionName", () => {
  it("can format a ExpressionName without dots", () => {
    const input = "myExpression";
    const entryPoint = "expressionName";
    const expectedOutput = "myExpression";

    expectSnippetToBeFormatted({
      input,
      expectedOutput,
      entryPoint
    });
  });

  it("can format a ExpressionName with dots", () => {
    const input = "myExpression.with.lot.of.dots";
    const entryPoint = "expressionName";
    const expectedOutput = "myExpression.with.lot.of.dots";

    expectSnippetToBeFormatted({
      input,
      expectedOutput,
      entryPoint
    });
  });
});
