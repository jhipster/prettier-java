import path from "node:path";
import { fileURLToPath } from "node:url";
import { testSampleWithOptions } from "../../test-utils.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("prettier-java: require-pragma option", () => {
  [
    path.resolve(__dirname, "./format-pragma"),
    path.resolve(__dirname, "./prettier-pragma"),
    path.resolve(__dirname, "./invalid-pragma")
  ].forEach(testFolder => {
    testSampleWithOptions({
      testFolder
    });
  });
});
