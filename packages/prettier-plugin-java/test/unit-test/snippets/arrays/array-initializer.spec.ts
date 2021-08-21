import { expectSnippetToBeFormatted } from "../../../test-utils";

describe("Arrays Initializer", () => {
  it("can format an empty arrayInitializer", () => {
    expectSnippetToBeFormatted({
      snippet: "{ }",
      expectedOutput: "{}",
      entryPoint: "arrayInitializer"
    });
  });

  it("can format a arrayInitializer", () => {
    expectSnippetToBeFormatted({
      snippet: "{alpha}",
      expectedOutput: "{ alpha }",
      entryPoint: "arrayInitializer"
    });
  });

  describe("Trailing Commas", () => {
    it("should remove extra comma in arrayInitializer by default", () => {
      expectSnippetToBeFormatted({
        snippet: "{alpha,}",
        expectedOutput: "{ alpha }",
        entryPoint: "arrayInitializer"
      });
    });

    it("should remove extra comma in arrayInitializer by default", () => {
      const snippet = "{oneVeryLongArrayValue,}";
      const prettierOptions = {
        printWidth: 15
      };
      // prettier-ignore
      const expectedOutput =
        "{\n" +
        "  oneVeryLongArrayValue\n" +
        "}";

      expectSnippetToBeFormatted({
        snippet,
        expectedOutput,
        entryPoint: "arrayInitializer",
        prettierOptions
      });
    });

    it("should remove extra comma in arrayInitializer if it fit in one line and --trailing-comma='all'", () => {
      expectSnippetToBeFormatted({
        snippet: "{oneVeryLongArrayValue,}",
        expectedOutput: "{ oneVeryLongArrayValue }",
        entryPoint: "arrayInitializer",
        prettierOptions: {
          trailingComma: "all"
        }
      });
    });

    it("should not add extra comma in arrayInitializer if it fit in one line and --trailing-comma='all'", () => {
      expectSnippetToBeFormatted({
        snippet: "{oneVeryLongArrayValue}",
        expectedOutput: "{ oneVeryLongArrayValue }",
        entryPoint: "arrayInitializer",
        prettierOptions: {
          trailingComma: "all"
        }
      });
    });

    it("should keep extra comma in arrayInitializer if it does not fit in one line and --trailing-comma='all'", () => {
      // prettier-ignore
      const expectedOutput =
        "{\n" +
        "  oneVeryLongArrayValue/* COMMA */,\n" +
        "}";

      expectSnippetToBeFormatted({
        snippet: "{oneVeryLongArrayValue /* COMMA */,}",
        expectedOutput,
        entryPoint: "arrayInitializer",
        prettierOptions: {
          printWidth: 15,
          trailingComma: "all"
        }
      });
    });

    it("should add extra comma in arrayInitializer if it does not fit in one line and --trailing-comma='all'", () => {
      // prettier-ignore
      const expectedOutput =
        "{\n" +
        "  oneVeryLongArrayValue,\n" +
        "}";

      expectSnippetToBeFormatted({
        snippet: "{oneVeryLongArrayValue}",
        expectedOutput,
        entryPoint: "arrayInitializer",
        prettierOptions: {
          printWidth: 15,
          trailingComma: "all"
        }
      });
    });
  });
});
