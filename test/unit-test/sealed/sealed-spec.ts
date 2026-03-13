import path from "path";
import url from "url";
import { testSample } from "../../test-utils.js";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

describe("prettier-java: sealed classes", () => {
  testSample(__dirname);
});
