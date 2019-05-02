"use strict";
const { resolve } = require("path");
describe("prettier-java", () => {
  require("./test-utils").testRepositorySample(
    resolve(__dirname, "../samples/jhipster-sample-app"),
    "./mvnw",
    ["compile"],
    { cwd: resolve(__dirname, "../samples/jhipster-sample-app") }
  );
});
