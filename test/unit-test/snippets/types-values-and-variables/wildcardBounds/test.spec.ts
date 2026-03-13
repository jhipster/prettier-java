import { expectSnippetToBeFormatted } from "../../../../test-utils.js";

describe("Wildcard Bounds", () => {
  it("can format a wildcardBounds with extends", async () => {
    await expectSnippetToBeFormatted({
      snippet: "List<? extends int[]>l;",
      expectedOutput: "List<? extends int[]> l;\n"
    });
  });

  it("can format a wildcardBounds with super", async () => {
    await expectSnippetToBeFormatted({
      snippet: "List<? super int[]>l;",
      expectedOutput: "List<? super int[]> l;\n"
    });
  });
});
