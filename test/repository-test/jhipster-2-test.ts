import path from "node:path";
import { fileURLToPath } from "node:url";
import { testRepositorySample } from "../test-utils.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jhipsterRepository = [
  "jhipster-sample-app-elasticsearch",
  "jhipster-sample-app-dto",
  "jhipster-sample-app-cassandra",
  "jhipster-sample-app-mongodb",
  "jhipster-sample-app-react"
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
