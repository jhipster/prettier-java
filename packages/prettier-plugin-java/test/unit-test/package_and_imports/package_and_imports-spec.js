const { testSample } = require("../../test-utils");
const path = require("path");

describe("prettier-java", () => {
  testSample(path.resolve(__dirname, "./classWithMixedImports"));
  testSample(path.resolve(__dirname, "./classWithNoImports"));
  testSample(path.resolve(__dirname, "./classWithOnlyStaticImports"));
  testSample(path.resolve(__dirname, "./classWithOnlyNonStaticImports"));
  testSample(path.resolve(__dirname, "./moduleWithMixedImports"));
  testSample(path.resolve(__dirname, "./moduleWithNoImports"));
  testSample(path.resolve(__dirname, "./moduleWithOnlyStaticImports"));
  testSample(path.resolve(__dirname, "./moduleWithOnlyNonStaticImports"));
});
