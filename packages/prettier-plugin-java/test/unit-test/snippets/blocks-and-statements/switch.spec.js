"use strict";

const { expectSnippetToBeFormatted } = require("../../../test-utils");

describe("Switches", () => {
  context("Switch Statement", () => {
    it("should format switch statement", () => {
      const snippet =
        "switch (answer) {\n" +
        "  case YES:\n" +
        '    return "Yes";\n' +
        "  default:\n" +
        '    return "NO";\n' +
        "}";

      const expectedOutput =
        "switch (answer) {\n" +
        "  case YES:\n" +
        '    return "Yes";\n' +
        "  default:\n" +
        '    return "NO";\n' +
        "}";

      expectSnippetToBeFormatted({
        snippet,
        expectedOutput,
        entryPoint: "switchStatement"
      });
    });
  });
});
