import { formatJavaSnippet } from "../../../../test-utils.js";

describe("numericType", () => {
  it("can format byte keyword", async () => {
    const snippet = "byte b;";

    await formatJavaSnippet({ snippet });
  });

  it("can format double keyword", async () => {
    const snippet = "double d;";

    await formatJavaSnippet({ snippet });
  });
});
