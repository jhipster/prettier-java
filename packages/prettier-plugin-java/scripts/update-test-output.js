/* eslint-disable no-console */
import klawSync from "klaw-sync";
import path from "path";
import fs from "fs-extra";
import prettier from "prettier";
import url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const updateTestOutput = async () => {
  let samplesDir = path.resolve(__dirname, "../test/unit-test");
  let originalSamplesDir = samplesDir;
  if (process.argv.indexOf("-single") > -1) {
    samplesDir = path.resolve(__dirname, "./single-printer-run");
  } else if (process.argv.indexOf("-repository") > -1) {
    const testSamples = path.resolve(__dirname, "../test-samples");
    originalSamplesDir = path.resolve(
      __dirname,
      process.argv[process.argv.indexOf("-repository") + 1]
    );
    samplesDir = path.resolve(testSamples, path.basename(originalSamplesDir));
    if (fs.existsSync(samplesDir)) {
      fs.removeSync(samplesDir);
    }
    console.log(`start copy ${originalSamplesDir} to ${samplesDir}`);
    fs.copySync(originalSamplesDir, samplesDir);
    console.log(`end copy ${originalSamplesDir} to ${samplesDir}`);
  }

  let numberOfTime = 1;
  if (process.argv.indexOf("-times") > -1) {
    numberOfTime = process.argv[process.argv.indexOf("-times") + 1];
  }

  const sampleFiles = klawSync(samplesDir, { nodir: true });
  const javaSampleFiles = sampleFiles.filter(fileDesc => {
    if (fileDesc.path.includes("node_modules")) {
      return false;
    }
    if (process.argv.indexOf("-repository") > -1) {
      return fileDesc.path.endsWith(".java");
    }
    return fileDesc.path.endsWith("input.java");
  });

  let failures = 0;
  await Promise.all(
    javaSampleFiles.map(async fileDesc => {
      const javaFileText = fs.readFileSync(fileDesc.path, "utf8");

      try {
        console.log(`Reading <${fileDesc.path}>`);
        let newExpectedText = javaFileText;
        for (let i = 0; i < numberOfTime; i++) {
          newExpectedText = await prettier.format(newExpectedText, {
            parser: "java",
            plugins: [path.resolve(__dirname, "../dist/index.js")],
            tabWidth: 2,
            endOfLine: "lf"
          });
        }
        let outputFilePath = fileDesc.path.replace(
          /input.java$/,
          "output.java"
        );
        if (process.argv.indexOf("-repository") > -1) {
          outputFilePath = fileDesc.path;
        }
        console.log(`writing <${outputFilePath}>`);
        fs.writeFileSync(outputFilePath, newExpectedText);
      } catch (e) {
        failures++;
        console.log(`Failed parsing: <${fileDesc.path}>`);
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
