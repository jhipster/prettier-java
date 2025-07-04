import path from "path";
import url from "url";
import fs from "fs-extra";
import { testSample, testSampleWithOptions } from "../../test-utils.js";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

describe("prettier-java", () => {
  const startOptions = fs.readJsonSync(
    path.resolve(__dirname, "operator-position-start/prettier-options.json")
  );
  testSampleWithOptions({
    testFolder: path.resolve(__dirname, "operator-position-start"),
    prettierOptions: startOptions
  });

  const endOptions = fs.readJsonSync(
    path.resolve(__dirname, "operator-position-end/prettier-options.json")
  );
  testSampleWithOptions({
    testFolder: path.resolve(__dirname, "operator-position-end"),
    prettierOptions: endOptions
  });
  testSample(path.resolve(__dirname, "operator-position-end"));
});
