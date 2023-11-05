import { dirname, resolve } from "path";
import url from "url";
import { testRepositorySample } from "../test-utils.js";

const __dirname = dirname(url.fileURLToPath(import.meta.url));
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
      resolve(__dirname, `../../samples/${repository}`),
      "./mvnw",
      ["compile"]
    );
  });
});
