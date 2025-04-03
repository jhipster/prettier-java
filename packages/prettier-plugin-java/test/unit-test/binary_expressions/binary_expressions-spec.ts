import path from "path";
import url from "url";
import { testSample, testSampleWithOptions } from "../../test-utils.js";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

describe("prettier-java", () => {
  testSampleWithOptions({
    testFolder: path.resolve(__dirname, "operator-position-start"),
    prettierOptions: { experimentalOperatorPosition: "start" }
  });
  testSampleWithOptions({
    testFolder: path.resolve(__dirname, "operator-position-end"),
    prettierOptions: { experimentalOperatorPosition: "end" }
  });
  testSample(path.resolve(__dirname, "operator-position-end"));
});
