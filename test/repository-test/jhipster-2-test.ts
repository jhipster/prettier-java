import { dirname, resolve } from "path";
import url from "url";
import { testRepositorySample } from "../test-utils.js";

const __dirname = dirname(url.fileURLToPath(import.meta.url));
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
      resolve(__dirname, `../../samples/${repository}`),
      "./mvnw",
      ["compile"]
    );
  });
});
