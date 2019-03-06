/* eslint-disable no-console */
"use strict";
const klawSync = require("klaw-sync");
const path = require("path");
const fs = require("fs");
const javaParser = require("../src/index");
const _ = require("lodash");

const options = {
  failFast: false,
  printProgress: false,
  printErrors: true
};

let printProgress = _.noop;
let printErrors = _.noop;
if (options.printProgress) {
  printProgress = console.log;
}

if (options.printErrors) {
  printErrors = console.error;
}

const samplesDir = [];
samplesDir.push(path.resolve(__dirname, "../samples/guava"));
samplesDir.push(path.resolve(__dirname, "../samples/BugTrackerJHipster"));
samplesDir.push(path.resolve(__dirname, "../samples/java-design-patterns"));
samplesDir.push(path.resolve(__dirname, "../samples/jhipster"));
samplesDir.push(path.resolve(__dirname, "../samples/jhipster-online"));
samplesDir.push(path.resolve(__dirname, "../samples/jhipster-sample-app"));
samplesDir.push(
  path.resolve(__dirname, "../samples/jhipster-sample-app-cassandra")
);
samplesDir.push(
  path.resolve(__dirname, "../samples/jhipster-sample-app-couchbase")
);
samplesDir.push(path.resolve(__dirname, "../samples/jhipster-sample-app-dto"));
samplesDir.push(
  path.resolve(__dirname, "../samples/jhipster-sample-app-elasticsearch")
);
samplesDir.push(
  path.resolve(__dirname, "../samples/jhipster-sample-app-gateway")
);
samplesDir.push(
  path.resolve(__dirname, "../samples/jhipster-sample-app-gradle")
);
samplesDir.push(
  path.resolve(__dirname, "../samples/jhipster-sample-app-hazelcast")
);
samplesDir.push(
  path.resolve(__dirname, "../samples/jhipster-sample-app-microservice")
);
samplesDir.push(
  path.resolve(__dirname, "../samples/jhipster-sample-app-mongodb")
);
samplesDir.push(
  path.resolve(__dirname, "../samples/jhipster-sample-app-nocache")
);
samplesDir.push(
  path.resolve(__dirname, "../samples/jhipster-sample-app-noi18n")
);
samplesDir.push(
  path.resolve(__dirname, "../samples/jhipster-sample-app-oauth2")
);
samplesDir.push(
  path.resolve(__dirname, "../samples/jhipster-sample-app-react")
);
samplesDir.push(
  path.resolve(__dirname, "../samples/jhipster-sample-app-websocket")
);
samplesDir.push(path.resolve(__dirname, "../samples/spring-boot"));
samplesDir.push(path.resolve(__dirname, "../samples/spring-framework"));

for (let i = 0; i < samplesDir.length; i++) {
  console.log(`=== Parsing <${samplesDir[i]}> ===`);
  const sampleFiles = klawSync(samplesDir[i], { nodir: true });
  const javaSampleFiles = sampleFiles.filter(fileDesc =>
    fileDesc.path.endsWith(".java")
  );

  const javaPathAndText = _.map(javaSampleFiles, fileDesc => {
    const currJavaFileString = fs.readFileSync(fileDesc.path, "utf8");
    const relativePath = path.relative(__dirname, fileDesc.path);

    return { path: relativePath, text: currJavaFileString };
  });

  let success = 0;
  let failed = 0;

  const fullStartTime = new Date().getTime();
  let fullTotalParsingTime = 0;
  javaPathAndText.forEach(fileDesc => {
    const relativePath = fileDesc.path;
    try {
      const sampleStartTime = _.now();
      javaParser.parse(fileDesc.text);
      const sampleEndTime = _.now();
      const totalSampleTime = sampleEndTime - sampleStartTime;
      fullTotalParsingTime += totalSampleTime;
      printProgress(
        `Success parsing: <${relativePath}> - <${totalSampleTime}ms>`
      );
      success++;
    } catch (e) {
      printErrors(`Failed parsing: <${relativePath}>`);
      if (options.failFast) {
        throw e;
      }
      failed++;
      printErrors(e.message);
    }
  });
  const fullEndTime = new Date().getTime();
  const fullTotalTime = fullEndTime - fullStartTime;

  const totalFiles = success + failed;
  const successPercentage = ((success / totalFiles) * 100).toFixed(3);

  console.log(`Total number of files: <${totalFiles}>`);
  console.warn(`Total number of failures: <${failed}>`);
  console.log(`Total time: <${fullTotalTime}ms>`);
  console.log(`Time spent parsing files: <${fullTotalParsingTime}ms>`);
  console.log(`Success Percentage: ${successPercentage}%\n`);
}
