import { expectSnippetToBeFormatted } from "../../../test-utils.ts";

describe("VariableInitializerList", () => {
  it("format variableInitializerList with one variableInitializer", () => {
    expectSnippetToBeFormatted({
      snippet: "alpha ",
      expectedOutput: "alpha"
    });
  });

  it("format variableInitializerList with multiple variableInitializer", () => {
    expectSnippetToBeFormatted({
      snippet: "alpha,beta, gamma",
      expectedOutput: "alpha,\nbeta,\ngamma"
    });
  });
});
