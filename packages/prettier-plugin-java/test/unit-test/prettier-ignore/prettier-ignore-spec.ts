import path from "path";
import url from "url";
import { testSample } from "../../test-utils.js";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

describe("prettier-java: try catch", () => {
  testSample(path.resolve(__dirname, "./block"));
  testSample(path.resolve(__dirname, "./classDeclaration"));
  testSample(path.resolve(__dirname, "./method"));
  testSample(path.resolve(__dirname, "./multiple-ignore"));
});
