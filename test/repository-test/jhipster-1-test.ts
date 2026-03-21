import path from "node:path";
import { fileURLToPath } from "node:url";
import { testRepositorySample } from "../test-utils.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jhipsterRepository = [
  "jhipster-sample-app-microservice",
  "jhipster-sample-app-oauth2",
  "jhipster-sample-app-websocket",
  "jhipster-sample-app-noi18n",
  "jhipster-sample-app-hazelcast"
];

describe("prettier-java", () => {
  jhipsterRepository.forEach(repository => {
    testRepositorySample(
      path.resolve(__dirname, `../../samples/${repository}`),
      "./mvnw",
      ["compile"]
    );
  });
});
