import path from "node:path";
import { fileURLToPath } from "node:url";
import { testRepositorySample } from "../test-utils.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jhipsterRepository = ["jhipster-bom", "jhipster-sample-app"];

describe("prettier-java", () => {
  testRepositorySample(
    path.resolve(__dirname, "../../samples/java-design-patterns"),
    "true",
    []
  );

  testRepositorySample(
    path.resolve(__dirname, "../../samples/spring-boot"),
    "./gradlew",
    ["compileJava"]
  );

  jhipsterRepository.forEach(repository => {
    testRepositorySample(
      path.resolve(__dirname, `../../samples/${repository}`),
      "./mvnw",
      ["compile"]
    );
  });
});
