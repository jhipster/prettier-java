import {
  cpSync,
  existsSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import prettier from "prettier";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const updateTestOutput = async () => {
  let samplesDir = path.resolve(__dirname, "../test/unit-test");
  if (process.argv.indexOf("-single") > -1) {
    samplesDir = path.resolve(__dirname, "./single-printer-run");
  } else if (process.argv.indexOf("-repository") > -1) {
    const testSamples = path.resolve(__dirname, "../test-samples");
    const originalSamplesDir = path.resolve(
      __dirname,
      process.argv[process.argv.indexOf("-repository") + 1]
    );
    samplesDir = path.resolve(testSamples, path.basename(originalSamplesDir));
    if (existsSync(samplesDir)) {
      rmSync(samplesDir, { recursive: true });
    }
    console.log(`start copy ${originalSamplesDir} to ${samplesDir}`);
    cpSync(originalSamplesDir, samplesDir, { recursive: true });
    console.log(`end copy ${originalSamplesDir} to ${samplesDir}`);
  }

  let numberOfTime = 1;
  if (process.argv.indexOf("-times") > -1) {
    numberOfTime = process.argv[process.argv.indexOf("-times") + 1];
  }

  const sampleFiles = readdirSync(samplesDir, {
    encoding: "utf-8",
    recursive: true
  });
  const javaSampleFiles = sampleFiles
    .filter(filePath => {
      if (filePath.includes("node_modules")) {
        return false;
      }
      if (process.argv.indexOf("-repository") > -1) {
        return filePath.endsWith(".java");
      }
      return filePath.endsWith("input.java");
    })
    .map(filePath => path.join(samplesDir, filePath));

  let failures = 0;
  await Promise.all(
    javaSampleFiles.map(async filePath => {
      const javaFileText = readFileSync(filePath, "utf8");

      try {
        console.log(`Reading <${filePath}>`);
        let newExpectedText = javaFileText;

        const testDir = path.dirname(filePath);
        const optionsPath = path.join(testDir, ".prettierrc.json");
        const testOptions = existsSync(optionsPath)
          ? JSON.parse(readFileSync(optionsPath, "utf-8"))
          : {};

        for (let i = 0; i < numberOfTime; i++) {
          if (process.argv.indexOf("-doc") > -1) {
            console.log(
              "doc:",
              await prettier.__debug.formatDoc(
                await prettier.__debug.printToDoc(newExpectedText, {
                  parser: "java",
                  plugins: [path.resolve(__dirname, "../dist/index.mjs")]
                })
              )
            );
          }
          newExpectedText = await prettier.format(newExpectedText, {
            parser: "java",
            plugins: [path.resolve(__dirname, "../dist/index.mjs")],
            tabWidth: 2,
            endOfLine: "lf",
            ...testOptions
          });
        }
        let outputFilePath = filePath.replace(/input.java$/, "output.java");
        if (process.argv.indexOf("-repository") > -1) {
          outputFilePath = filePath;
        }
        console.log(`writing <${outputFilePath}>`);
        writeFileSync(outputFilePath, newExpectedText);
      } catch (e) {
        failures++;
        console.log(`Failed parsing: <${filePath}>`);
        console.log(e);
      }
    })
  );

  if (failures > 0) {
    console.log(`fail: ${failures}`);
    process.exit(1);
  }
};

updateTestOutput();
