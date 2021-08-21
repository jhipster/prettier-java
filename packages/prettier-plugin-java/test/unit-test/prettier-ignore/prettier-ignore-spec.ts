import { testSample } from "../../test-utils";
import * as path from "path";

describe("prettier-java: try catch", () => {
  testSample(path.resolve(__dirname, "./classDeclaration"));
  testSample(path.resolve(__dirname, "./method"));
  testSample(path.resolve(__dirname, "./multiple-ignore"));
});
