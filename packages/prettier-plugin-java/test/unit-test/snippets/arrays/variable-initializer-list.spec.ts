import { expectSnippetToBeFormatted } from "../../../test-utils";

describe("VariableInitializerList", () => {
  it("format variableInitializerList with one variableInitializer", () => {
    expectSnippetToBeFormatted({
      snippet: "alpha ",
      expectedOutput: "alpha",
      entryPoint: "variableInitializerList"
    });
  });

  it("format variableInitializerList with multiple variableInitializer", () => {
    expectSnippetToBeFormatted({
      snippet: "alpha,beta, gamma",
      expectedOutput: "alpha,\nbeta,\ngamma",
      entryPoint: "variableInitializerList"
    });
  });
});
