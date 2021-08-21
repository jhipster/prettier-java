import { expectSnippetToBeFormatted } from "../../../../test-utils";

describe("PackageOrTypeName", () => {
  it("can format a PackageOrTypeName without dots", () => {
    expectSnippetToBeFormatted({
      snippet: "com",
      expectedOutput: "com",
      entryPoint: "packageOrTypeName"
    });
  });

  it("can format a PackageOrTypeName with dots", () => {
    expectSnippetToBeFormatted({
      snippet: "com.iluwatar.abstractdocument",
      expectedOutput: "com.iluwatar.abstractdocument",
      entryPoint: "packageOrTypeName"
    });
  });
});
