import { expectSnippetToBeFormatted } from "../../../test-utils";

describe("element Value Array Initializer", () => {
  it("can format a elementValueArrayInitializer", () => {
    expectSnippetToBeFormatted({
      snippet: "{alpha}",
      expectedOutput: "{ alpha }",
      entryPoint: "elementValueArrayInitializer"
    });
  });

  describe("Trailing Commas", () => {
    it("should remove extra comma in elementValueArrayInitializer by default", () => {
      expectSnippetToBeFormatted({
        snippet: "{alpha,}",
        expectedOutput: "{ alpha }",
        entryPoint: "elementValueArrayInitializer"
      });
    });

    it("should remove extra comma in elementValueArrayInitializer by default", () => {
      // prettier-ignore
      const expectedOutput =
        "{\n" +
        "  oneVeryLongArrayValue\n" +
        "}";

      expectSnippetToBeFormatted({
        snippet: "{oneVeryLongArrayValue,}",
        expectedOutput,
        entryPoint: "elementValueArrayInitializer",
        prettierOptions: {
          printWidth: 15
        }
      });
    });

    it("should remove extra comma in elementValueArrayInitializer if it fit in one line and --trailing-comma='all'", () => {
      expectSnippetToBeFormatted({
        snippet: "{oneVeryLongArrayValue,}",
        expectedOutput: "{ oneVeryLongArrayValue }",
        entryPoint: "elementValueArrayInitializer",
        prettierOptions: {
          trailingComma: "all"
        }
      });
    });

    it("should not add extra comma in elementValueArrayInitializer if it fit in one line and --trailing-comma='all'", () => {
      expectSnippetToBeFormatted({
        snippet: "{oneVeryLongArrayValue}",
        expectedOutput: "{ oneVeryLongArrayValue }",
        entryPoint: "elementValueArrayInitializer",
        prettierOptions: {
          trailingComma: "all"
        }
      });
    });

    it("should keep extra comma in elementValueArrayInitializer if it does not fit in one line and --trailing-comma='all'", () => {
      // prettier-ignore
      const expectedOutput =
        "{\n" +
        "  oneVeryLongArrayValue/* COMMA */,\n" +
        "}";

      expectSnippetToBeFormatted({
        snippet: "{oneVeryLongArrayValue /* COMMA */,}",
        expectedOutput,
        entryPoint: "elementValueArrayInitializer",
        prettierOptions: {
          printWidth: 15,
          trailingComma: "all"
        }
      });
    });

    it("should add extra comma in elementValueArrayInitializer if it does not fit in one line and --trailing-comma='all'", () => {
      // prettier-ignore
      const expectedOutput =
        "{\n" +
        "  oneVeryLongArrayValue,\n" +
        "}";

      expectSnippetToBeFormatted({
        snippet: "{oneVeryLongArrayValue}",
        expectedOutput,
        entryPoint: "elementValueArrayInitializer",
        prettierOptions: {
          printWidth: 15,
          trailingComma: "all"
        }
      });
    });
  });
});
