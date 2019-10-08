const { testSample } = require("../../test-utils");
const path = require("path");

describe("prettier-java", () => {
  testSample(path.resolve(__dirname, "./classWithMixedImports"));
  testSample(path.resolve(__dirname, "./classWithNoImports"));
  testSample(path.resolve(__dirname, "./classWithOnlyStaticImports"));
  testSample(path.resolve(__dirname, "./classWithOnlyNonStaticImports"));
});
