import { expectSnippetToBeFormatted } from "../../../test-utils";

describe("Enum Body", () => {
  it("Remove trailing comma by default", () => {
    const snippet = "{ONE,TWO,THREE,}";
    // prettier-ignore
    const expectedOutput =
      "{\n" +
      "  ONE,\n" +
      "  TWO,\n" +
      "  THREE\n" +
      "}";
    expectSnippetToBeFormatted({
      snippet,
      expectedOutput,
      entryPoint: "enumBody"
    });
  });

  it("Add trailing comma when specified", () => {
    const snippet = "{ONE,TWO,THREE}";
    // prettier-ignore
    const expectedOutput =
      "{\n" +
      "  ONE,\n" +
      "  TWO,\n" +
      "  THREE,\n" +
      "}";
    const prettierOptions = {
      trailingComma: "all"
    };
    expectSnippetToBeFormatted({
      snippet,
      expectedOutput,
      entryPoint: "enumBody",
      prettierOptions
    });
  });

  it("Keep one trailing comma if there is already one", () => {
    const snippet = "{" + "\n  ONE," + "\n  TWO," + "\n  THREE," + "\n}";
    // prettier-ignore
    const expectedOutput =
      "{\n" +
      "  ONE,\n" +
      "  TWO,\n" +
      "  THREE,\n" +
      "}";
    const prettierOptions = {
      trailingComma: "all"
    };
    expectSnippetToBeFormatted({
      snippet,
      expectedOutput,
      entryPoint: "enumBody",
      prettierOptions
    });
  });

  it("Remove trailing comma in enum constant list with semicolon by default", () => {
    const snippet = "{ONE,TWO,THREE,;}";
    // prettier-ignore
    const expectedOutput =
      "{\n" +
      "  ONE,\n" +
      "  TWO,\n" +
      "  THREE\n" +
      "}";
    expectSnippetToBeFormatted({
      snippet,
      expectedOutput,
      entryPoint: "enumBody"
    });
  });

  it("Add trailing comma in enum constant list with semicolon when specified", () => {
    const snippet = "{ONE,TWO,THREE;}";
    // prettier-ignore
    const expectedOutput =
      "{\n" +
      "  ONE,\n" +
      "  TWO,\n" +
      "  THREE,\n" +
      "}";
    const prettierOptions = {
      trailingComma: "all"
    };
    expectSnippetToBeFormatted({
      snippet,
      expectedOutput,
      entryPoint: "enumBody",
      prettierOptions
    });
  });
});
