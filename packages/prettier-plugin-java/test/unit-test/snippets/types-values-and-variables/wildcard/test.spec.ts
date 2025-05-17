import { expectSnippetToBeFormatted } from "../../../../test-utils.js";

describe("Wildcard", () => {
  it("can format a wildcard", async () => {
    await expectSnippetToBeFormatted({
      snippet: "?",
      expectedOutput: "?",
      entryPoint: "wildcard"
    });
  });

  it("can format a wildcard with one annotations", async () => {
    await expectSnippetToBeFormatted({
      snippet: "@Anno ?",
      expectedOutput: "@Anno ?",
      entryPoint: "wildcard"
    });
  });

  it("can format a wildcard with annotations that exceed printWidth ", async () => {
    const snippet =
      "@Annotation1 @Annotation2 @Annotation3 @Annotation4 @Annotation5 @Annotation6 @Annotation7 ?";
    const expectedOutput =
      "@Annotation1 @Annotation2 @Annotation3 @Annotation4 @Annotation5 @Annotation6 @Annotation7 ?";

    await expectSnippetToBeFormatted({
      snippet,
      expectedOutput,
      entryPoint: "wildcard"
    });
  });

  it("can format a wildcard with wildcardBound", async () => {
    await expectSnippetToBeFormatted({
      snippet: "? extends int[]",
      expectedOutput: "? extends int[]",
      entryPoint: "wildcard"
    });
  });
});
