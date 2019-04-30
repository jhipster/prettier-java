const { testSample } = require("../test-utils");
const path = require("path");

describe("prettier-java", () => {
  testSample(path.resolve(__dirname, "./edge"));
  testSample(path.resolve(__dirname, "./interface"));
  testSample(path.resolve(__dirname, "./package"));
});
