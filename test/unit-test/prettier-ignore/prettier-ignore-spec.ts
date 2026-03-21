import path from "node:path";
import { fileURLToPath } from "node:url";
import { testSample } from "../../test-utils.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("prettier-java: try catch", () => {
  testSample(path.resolve(__dirname, "./block"));
  testSample(path.resolve(__dirname, "./classDeclaration"));
  testSample(path.resolve(__dirname, "./method"));
  testSample(path.resolve(__dirname, "./multiple-ignore"));
});
