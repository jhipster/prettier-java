"use strict";
const { resolve } = require("path");
const { testRepositorySample } = require("../test-utils");

const jhipsterRepository = [
  "jhipster-online",
  "jhipster-sample-app-microservice",
  "jhipster-sample-app-gateway",
  "jhipster-sample-app-oauth2",
  "jhipster-sample-app-websocket",
  "jhipster-sample-app-noi18n",
  "jhipster-sample-app-nocache",
  "jhipster-sample-app-hazelcast"
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
