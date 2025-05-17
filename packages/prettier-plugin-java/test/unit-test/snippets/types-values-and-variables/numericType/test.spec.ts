import { formatJavaSnippet } from "../../../../test-utils.js";

describe("numericType", () => {
  it("can format byte keyword", async () => {
    const snippet = "byte";
    const entryPoint = "numericType";

    await formatJavaSnippet({ snippet, entryPoint });
  });

  it("can format double keyword", async () => {
    const snippet = "double";
    const entryPoint = "numericType";

    await formatJavaSnippet({ snippet, entryPoint });
  });
});
