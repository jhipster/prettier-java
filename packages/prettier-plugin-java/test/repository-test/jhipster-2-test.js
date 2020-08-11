"use strict";
const { resolve } = require("path");
const { testRepositorySample } = require("../test-utils");

const jhipsterRepository = [
  "jhipster-sample-app-elasticsearch",
  "jhipster-sample-app-dto",
  "jhipster-sample-app-couchbase",
  "jhipster-sample-app-cassandra",
  "jhipster-sample-app-mongodb",
  "jhipster-sample-app-react"
];

describe("prettier-java", () => {
  jhipsterRepository.forEach(repository => {
    testRepositorySample(
      resolve(__dirname, `../../samples/${repository}`),
      "./mvnw",
      ["compile"]
    );
  });
});
