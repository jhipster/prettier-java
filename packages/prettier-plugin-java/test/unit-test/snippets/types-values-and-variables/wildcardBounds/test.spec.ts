import { expectSnippetToBeFormatted } from "../../../../test-utils.js";

describe("Wildcard Bounds", () => {
  it("can format a wildcardBounds with extends", async () => {
    await expectSnippetToBeFormatted({
      snippet: "extends int[]",
      expectedOutput: "extends int[]",
      entryPoint: "wildcardBounds"
    });
  });

  it("can format a wildcardBounds with super", async () => {
    await expectSnippetToBeFormatted({
      snippet: "super int[]",
      expectedOutput: "super int[]",
      entryPoint: "wildcardBounds"
    });
  });
});
