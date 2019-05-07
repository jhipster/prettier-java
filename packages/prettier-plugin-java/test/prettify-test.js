"use strict";
const { resolve } = require("path");
const { testRepositorySample } = require("./test-utils");

const jhipsterRepository = [
  "jhipster",
  "jhipster-online",
  "jhipster-sample-app",
  "jhipster-sample-app-microservice",
  "jhipster-sample-app-gateway",
  "jhipster-sample-app-oauth2",
  "jhipster-sample-app-websocket",
  "jhipster-sample-app-noi18n",
  "jhipster-sample-app-nocache",
  "jhipster-sample-app-hazelcast",
  "jhipster-sample-app-elasticsearch",
  "jhipster-sample-app-dto",
  "jhipster-sample-app-couchbase",
  "jhipster-sample-app-cassandra",
  "jhipster-sample-app-mongodb",
  "jhipster-sample-app-react"
];

describe("prettier-java", () => {
  testRepositorySample(
    resolve(__dirname, "../samples/spring-boot"),
    "true",
    []
  );

  testRepositorySample(resolve(__dirname, "../samples/spring-boot"), "./mvnw", [
    "clean",
    "install",
    "-Ddisable.checks",
    "-DskipTests"
  ]);

  jhipsterRepository.forEach(repository => {
    testRepositorySample(
      resolve(__dirname, `../samples/${repository}`),
      "./mvnw",
      ["compile"]
    );
  });

  testRepositorySample(
    resolve(__dirname, `../samples/jhipster-sample-app-gradle`),
    "./gradlew",
    ["build"]
  );
});
