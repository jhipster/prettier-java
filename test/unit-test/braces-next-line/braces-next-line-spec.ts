import path from "node:path";
import { fileURLToPath } from "node:url";
import { testSampleWithOptions } from "../../test-utils.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("prettier-java", () => {
  testSampleWithOptions({
    testFolder: __dirname,
  });
});
