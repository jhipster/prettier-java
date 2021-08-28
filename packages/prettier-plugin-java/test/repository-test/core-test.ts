import { resolve } from "path";
import { testRepositorySample } from "../test-utils";

const jhipsterRepository = ["jhipster", "jhipster-sample-app"];

describe("prettier-java", () => {
  testRepositorySample(
    resolve(__dirname, "../../samples/java-design-patterns"),
    "true",
    []
  );

  testRepositorySample(
    resolve(__dirname, "../../samples/spring-boot"),
    "./mvnw",
    ["clean", "install", "-Ddisable.checks", "-DskipTests"]
  );

  jhipsterRepository.forEach(repository => {
    testRepositorySample(
      resolve(__dirname, `../../samples/${repository}`),
      "./mvnw",
      ["compile"]
    );
  });
});
