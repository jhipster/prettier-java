const { testSample } = require("../../test-utils");
const path = require("path");

describe("prettier-java", () => {
  testSample(path.resolve(__dirname, "./classDeclaration"));
  testSample(path.resolve(__dirname, "./method"));
  testSample(path.resolve(__dirname, "./multiple-ignore"));
});
