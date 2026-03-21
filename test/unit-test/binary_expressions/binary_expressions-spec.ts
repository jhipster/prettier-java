import path from "node:path";
import { fileURLToPath } from "node:url";
import { testSample, testSampleWithOptions } from "../../test-utils.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("prettier-java", () => {
  testSampleWithOptions({
    testFolder: path.resolve(__dirname, "operator-position-start")
  });

  testSampleWithOptions({
    testFolder: path.resolve(__dirname, "operator-position-end")
  });
  testSample(path.resolve(__dirname, "operator-position-end"));
});
