import { dirname, resolve } from "path";
import url from "url";
import { testRepositorySample } from "../test-utils.js";

const __dirname = dirname(url.fileURLToPath(import.meta.url));
const jhipsterRepository = ["jhipster-bom", "jhipster-sample-app"];

describe("prettier-java", () => {
  testRepositorySample(
    resolve(__dirname, "../../samples/java-design-patterns"),
    "true",
    []
  );

  testRepositorySample(
    resolve(__dirname, "../../samples/spring-boot"),
    "./gradlew",
    ["clean", "build", "-Ddisable.checks", "-xtest", "--no-scan"]
  );

  jhipsterRepository.forEach(repository => {
    testRepositorySample(
      resolve(__dirname, `../../samples/${repository}`),
      "./mvnw",
      ["compile"]
    );
  });
});
