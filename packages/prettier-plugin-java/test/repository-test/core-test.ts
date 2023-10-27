import { resolve } from "path";
import { testRepositorySample } from "../test-utils";

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
