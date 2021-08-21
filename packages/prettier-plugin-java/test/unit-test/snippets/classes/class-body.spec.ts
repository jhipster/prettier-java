import { expectSnippetToBeFormatted } from "../../../test-utils";

describe("Class Body", () => {
  it("should handle an empty class body", () => {
    expectSnippetToBeFormatted({
      snippet: "{ }",
      expectedOutput: "{}",
      entryPoint: "classBody"
    });
  });

  it("should handle a class body with one field declaration", () => {
    // prettier-ignore
    const expectedOutput =
      "{\n" +
      "  int i;\n" +
      "}";

    expectSnippetToBeFormatted({
      snippet: "{int i;}",
      expectedOutput,
      entryPoint: "classBody"
    });
  });

  it("should handle blank lines between field declarations", () => {
    // prettier-ignore
    const snippet =
      "{\n" +
      "  int i;\n" +
      "  int j;\n" +
      "  \n" +
      "  int k;\n" +
      "}";

    // prettier-ignore
    const expectedOutput =
      "{\n" +
      "  int i;\n" +
      "  int j;\n" +
      "\n" +
      "  int k;\n" +
      "}";

    expectSnippetToBeFormatted({
      snippet,
      expectedOutput,
      entryPoint: "classBody"
    });
  });

  it("should add exactly one blank lines between field declarations", () => {
    // prettier-ignore
    const snippet =
      "{\n" +
      "  int i;\n" +
      "\n" +
      "\n" +
      "  \n" +
      "  int j;\n" +
      "}";

    // prettier-ignore
    const expectedOutput =
      "{\n" +
      "  int i;\n" +
      "\n" +
      "  int j;\n" +
      "}";

    expectSnippetToBeFormatted({
      snippet,
      expectedOutput,
      entryPoint: "classBody"
    });
  });

  it("should add exactly one blank lines before method declarations", () => {
    const snippet =
      "{\n" +
      "  int i;\n" +
      "  void t() {}" +
      "\n" +
      "  void u() {}" +
      "\n" +
      "\n" +
      "void v() {}" +
      "}";

    const expectedOutput =
      "{\n" +
      "  int i;\n" +
      "\n" +
      "  void t() {}\n" +
      "\n" +
      "  void u() {}\n" +
      "\n" +
      "  void v() {}\n" +
      "}";

    expectSnippetToBeFormatted({
      snippet,
      expectedOutput,
      entryPoint: "classBody"
    });
  });

  describe("Empty statements", () => {
    it("should handle an class body with only empty statements", () => {
      expectSnippetToBeFormatted({
        snippet: "{;;}",
        expectedOutput: "{}",
        entryPoint: "classBody"
      });
    });

    it("should handle blank lines between field declarations", () => {
      const snippet =
        "{\n" +
        "  int i;;int j;;\n" +
        "  int k;;\n" +
        "  ;\n" +
        "  int l;;\n" +
        "  \n" +
        "  int m;;\n" +
        "}";

      const expectedOutput =
        "{\n" +
        "  int i;\n" +
        "  int j;\n" +
        "  int k;\n" +
        "\n" +
        "  int l;\n" +
        "\n" +
        "  int m;\n" +
        "}";

      expectSnippetToBeFormatted({
        snippet,
        expectedOutput,
        entryPoint: "classBody"
      });
    });

    it("should handle blank lines before method declarations", () => {
      const snippet =
        "{\n" +
        "  int i;;\n" +
        "  void t() {}" +
        "\n" +
        "\n;" +
        "  void u() {}" +
        "\n;;" +
        "\n" +
        "void v() {}" +
        "}";

      const expectedOutput =
        "{\n" +
        "  int i;\n" +
        "\n" +
        "  void t() {}\n" +
        "\n" +
        "  void u() {}\n" +
        "\n" +
        "  void v() {}\n" +
        "}";

      expectSnippetToBeFormatted({
        snippet,
        expectedOutput,
        entryPoint: "classBody"
      });
    });

    it("should print comments attached to empty statement where only empty statements", () => {
      expectSnippetToBeFormatted({
        snippet: "{;/* TODO */;}",
        expectedOutput: "{\n" + "  /* TODO */\n" + "}",
        entryPoint: "classBody"
      });
    });

    it("should print comments attached to empty statement between field declarations", () => {
      const snippet =
        "{\n" +
        "  int i;/* TODO */;int j;;\n" +
        "  int k;/* TODO */;\n" +
        "  \n" +
        "  /* TODO */;\n" +
        "  \n" +
        "  int l;;\n" +
        "}";

      const expectedOutput =
        "{\n" +
        "  int i;\n" +
        "  /* TODO */\n" +
        "  int j;\n" +
        "  int k;\n" +
        "\n" +
        "  /* TODO */\n" +
        "  /* TODO */\n" +
        "  int l;\n" +
        "}";

      expectSnippetToBeFormatted({
        snippet,
        expectedOutput,
        entryPoint: "classBody"
      });
    });
  });
});
