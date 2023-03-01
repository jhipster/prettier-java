import * as path from "path";
import { testSampleWithOptions } from "../../test-utils";

describe("prettier-java: require-pragma option", () => {
  [
    path.resolve(__dirname, "./format-pragma"),
    path.resolve(__dirname, "./prettier-pragma"),
    path.resolve(__dirname, "./invalid-pragma")
  ].forEach(testFolder =>
    testSampleWithOptions({
      testFolder,
      prettierOptions: { requirePragma: true }
    })
  );
});
