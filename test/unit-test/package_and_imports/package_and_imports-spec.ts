import path from "path";
import url from "url";
import { testSample } from "../../test-utils.js";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

describe("prettier-java", () => {
  testSample(path.resolve(__dirname, "./classWithMixedCaseImports"));
  testSample(path.resolve(__dirname, "./classWithMixedImports"));
  testSample(path.resolve(__dirname, "./classWithNoImports"));
  testSample(path.resolve(__dirname, "./classWithOnlyStaticImports"));
  testSample(path.resolve(__dirname, "./classWithOnlyNonStaticImports"));
  testSample(path.resolve(__dirname, "./moduleWithMixedImports"));
  testSample(path.resolve(__dirname, "./moduleWithNoImports"));
  testSample(path.resolve(__dirname, "./moduleWithOnlyStaticImports"));
  testSample(path.resolve(__dirname, "./moduleWithOnlyNonStaticImports"));
});
