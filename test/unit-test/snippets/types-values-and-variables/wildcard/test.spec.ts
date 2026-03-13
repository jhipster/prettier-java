import { expectSnippetToBeFormatted } from "../../../../test-utils.js";

describe("Wildcard", () => {
  it("can format a wildcard", async () => {
    await expectSnippetToBeFormatted({
      snippet: "List<?>l;",
      expectedOutput: "List<?> l;\n"
    });
  });

  it("can format a wildcard with one annotations", async () => {
    await expectSnippetToBeFormatted({
      snippet: "List<@Anno ?>l;",
      expectedOutput: "List<@Anno ?> l;\n"
    });
  });

  it("can format a wildcard with annotations that exceed printWidth ", async () => {
    const snippet =
      "List<@Annotation1 @Annotation2 @Annotation3 @Annotation4 @Annotation5 @Annotation6 @Annotation7 ?>l;";
    const expectedOutput =
      "List<\n  @Annotation1 @Annotation2 @Annotation3 @Annotation4 @Annotation5 @Annotation6 @Annotation7 ?\n> l;\n";

    await expectSnippetToBeFormatted({
      snippet,
      expectedOutput
    });
  });

  it("can format a wildcard with wildcardBound", async () => {
    await expectSnippetToBeFormatted({
      snippet: "List<? extends int[]>l;",
      expectedOutput: "List<? extends int[]> l;\n"
    });
  });
});
