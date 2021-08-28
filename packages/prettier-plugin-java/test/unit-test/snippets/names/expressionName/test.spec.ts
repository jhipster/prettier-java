import { expectSnippetToBeFormatted } from "../../../../test-utils";

describe("expressionName", () => {
  it("can format a ExpressionName without dots", () => {
    expectSnippetToBeFormatted({
      snippet: "myExpression",
      expectedOutput: "myExpression",
      entryPoint: "expressionName"
    });
  });

  it("can format a ExpressionName with dots", () => {
    expectSnippetToBeFormatted({
      snippet: "myExpression.with.lot.of.dots",
      expectedOutput: "myExpression.with.lot.of.dots",
      entryPoint: "expressionName"
    });
  });
});
