import { expectSnippetToBeFormatted } from "../../../../test-utils.ts";

describe("PackageOrTypeName", () => {
  it("can format a PackageOrTypeName without dots", () => {
    expectSnippetToBeFormatted({
      snippet: "com",
      expectedOutput: "com"
    });
  });

  it("can format a PackageOrTypeName with dots", () => {
    expectSnippetToBeFormatted({
      snippet: "com.iluwatar.abstractdocument",
      expectedOutput: "com.iluwatar.abstractdocument"
    });
  });
});
