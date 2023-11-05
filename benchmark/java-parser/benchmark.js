/* eslint no-console: 0 */
import path from "path";
import klawSync from "klaw-sync";
import fs from "fs";
import * as npmparser from "java-parser-npm";
import { performance } from "perf_hooks";
import url from "url";
import * as currentparser from "../../packages/java-parser/src/index.js";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const samplesDir = path.resolve(
  __dirname,
  "../../packages/java-parser/samples/java-design-patterns/flux"
);
const sampleFiles = klawSync(samplesDir, { nodir: true });
const javaSampleFiles = sampleFiles.filter(fileDesc =>
  fileDesc.path.endsWith(".java")
);

const javaPathAndText = javaSampleFiles.map(fileDesc => {
  const currJavaFileString = fs.readFileSync(fileDesc.path, "utf8");
  const relativePath = path.relative(__dirname, fileDesc.path);

  return { path: relativePath, text: currJavaFileString };
});

function benchmarkParser(parser) {
  const start = performance.now();
  javaPathAndText.forEach(javaText => {
    try {
      parser(javaText.text);
    } catch (e) {
      console.log(e);
    }
  });
  const end = performance.now();
  return `${end - start}ms`;
}

for (let i = 0; i < 3; i++) {
  console.log(`NPM Java Parser (${benchmarkParser(npmparser.parse)})`);
  console.log(
    `Local Repository Java Parser (${benchmarkParser(currentparser.parse)})`
  );
}
