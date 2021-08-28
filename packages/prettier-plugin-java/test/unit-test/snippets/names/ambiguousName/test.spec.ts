import { expectSnippetToBeFormatted } from "../../../../test-utils";

describe("AmbiguousName", () => {
  it("can format a AmbiguousName without dots", () => {
    expectSnippetToBeFormatted({
      snippet: "myAmbiguousName",
      expectedOutput: "myAmbiguousName",
      entryPoint: "ambiguousName"
    });
  });

  it("can format a AmbiguousName with dots", () => {
    expectSnippetToBeFormatted({
      snippet: "myAmbiguousName.with.lot.of.dots",
      expectedOutput: "myAmbiguousName.with.lot.of.dots",
      entryPoint: "ambiguousName"
    });
  });
});
