import path from "node:path";
import { fileURLToPath } from "node:url";
import { testSample } from "../../test-utils.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("prettier-java: variables", () => {
  testSample(__dirname);
});
